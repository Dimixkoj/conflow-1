const $ = (id) => document.getElementById(id);
const cloud = () => window.parent?.conflowCloud;
let stopRealtime = null;
let activeProjectId = null;

function status(message, good = false) {
  const node = $('cloudSyncStatus');
  if (node) {
    node.textContent = message;
    node.style.borderColor = good ? '#317a6c' : '';
    node.style.color = good ? '#56d4bd' : '';
  }
}
function ready() {
  return new Promise((resolve) => {
    if (window.cpecReady && window.CPEC) return resolve();
    window.addEventListener('cpec-ready', resolve, { once: true });
  });
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}
const serialise = (value) => JSON.stringify(stable(value));
const keyOf = (type, id) => type + ':' + id;
const collections = {
  task: 'tasks', drawing: 'drawings', stage: 'stages', daily: 'daily',
  quality: 'quality', satisfaction: 'satisfaction', chat: 'chat'
};

function localRecords(data) {
  const rows = [{ type: 'project_meta', id: 'project-meta', payload: data.meta || {} }];
  for (const [type, collection] of Object.entries(collections)) {
    for (const item of data[collection] || []) {
      if (item?.id) rows.push({ type, id: String(item.id), payload: item });
    }
  }
  return rows;
}
function findLocal(data, type, id) {
  if (type === 'project_meta') return data.meta || {};
  const collection = collections[type];
  return collection ? (data[collection] || []).find((item) => String(item.id) === String(id)) : null;
}
function replaceLocal(data, type, id, payload) {
  if (type === 'project_meta') {
    data.meta = payload || {};
    return;
  }
  const collection = collections[type];
  if (!collection) return;
  data[collection] = data[collection] || [];
  const index = data[collection].findIndex((item) => String(item.id) === String(id));
  if (payload == null) {
    if (index >= 0) data[collection].splice(index, 1);
  } else if (index >= 0) {
    data[collection][index] = payload;
  } else {
    data[collection].push(payload);
  }
}
function toBlob(item) {
  if (item.blob instanceof Blob) return item.blob;
  if (typeof item.blob === 'string' && item.blob.startsWith('data:')) {
    const [head, body] = item.blob.split(',');
    const mime = head.match(/data:([^;]+)/)?.[1] || item.type || 'application/octet-stream';
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  throw new Error('The local attachment is not available as a Blob or data URL.');
}
async function uploadAttachments(data, api, projectId) {
  const all = [];
  for (const type of Object.keys(collections)) {
    const collection = data[collections[type]] || [];
    for (const record of collection) {
      for (const file of record.files || []) all.push(file);
    }
  }
  let uploaded = 0;
  for (const file of all) {
    if (file.cloudPath) continue;
    const local = await window.CPEC.getAttachment(file.id);
    if (!local) continue;
    const path = await api.uploadCpecAttachment({
      projectId, fileId: file.id, name: file.name, blob: toBlob(local),
      contentType: file.type || local.type || 'application/octet-stream'
    });
    file.cloudPath = path;
    uploaded++;
  }
  return uploaded;
}

async function loadProjects() {
  const api = cloud();
  if (!api?.getContext?.()) {
    status('Sign in through Company login first');
    window.parent?.document?.getElementById('cloud-open')?.click();
    return;
  }
  try {
    const projects = await api.listCpecProjects();
    const select = $('cloudProjectSelect');
    const previous = window.CPEC.getData().meta?.cloudProjectId || select.value;
    select.replaceChildren(new Option('Choose shared project', ''));
    for (const project of projects) {
      select.add(new Option(project.name + (project.project_code ? ' · ' + project.project_code : ''), project.id));
    }
    if (projects.some((project) => project.id === previous)) select.value = previous;
    else if (projects.length === 1) select.value = projects[0].id;
    if (select.value) await selectProject(select.value);
    else status(projects.length ? 'Choose a shared project' : 'No shared projects yet');
  } catch (error) {
    status('Could not load projects: ' + error.message);
  }
}
async function selectProject(projectId) {
  const data = window.CPEC.getData();
  data.meta.cloudProjectId = projectId || null;
  window.CPEC.save();
  activeProjectId = projectId || null;
  if (stopRealtime) { stopRealtime(); stopRealtime = null; }
  if (!activeProjectId) {
    status('Choose a shared project');
    $('cloudTeamList').textContent = 'Load a shared project to view its assigned team.';
    return;
  }
  try {
    await loadTeam();
    const api = cloud();
    stopRealtime = api.subscribeCpecProject(activeProjectId, () => {
      status('Shared changes detected · press Sync to reconcile');
    });
    status('Connected to shared project · ready to sync', true);
  } catch (error) {
    status('Project access check failed: ' + error.message);
  }
}
async function createProject() {
  const api = cloud();
  if (!api?.getContext?.()) {
    status('Sign in through Company login first');
    window.parent?.document?.getElementById('cloud-open')?.click();
    return;
  }
  try {
    await window.CPEC.save();
    const project = await api.createCpecProject(window.CPEC.getData().meta || {});
    const select = $('cloudProjectSelect');
    select.add(new Option(project.name, project.id));
    select.value = project.id;
    await selectProject(project.id);
    status('Shared project created · ' + project.name, true);
  } catch (error) {
    status('Project creation failed: ' + error.message);
  }
}
async function loadTeam() {
  if (!activeProjectId) return;
  const api = cloud();
  const members = await api.listCpecTeam(activeProjectId);
  const root = $('cloudTeamList');
  root.replaceChildren();
  if (!members.length) {
    root.textContent = 'No project team members assigned yet. The company owner or project manager can add existing ConFlow user accounts above.';
    return;
  }
  for (const member of members) {
    const row = document.createElement('div');
    row.style.cssText = 'padding:8px 0;border-bottom:1px solid #2b4058;overflow-wrap:anywhere';
    const title = document.createElement('b');
    title.textContent = member.role.replaceAll('_', ' ');
    const detail = document.createElement('span');
    detail.textContent = ' · ' + member.user_id + ' · ' + member.status;
    row.append(title, detail);
    root.append(row);
  }
}
async function addTeamMember(event) {
  event.preventDefault();
  if (!activeProjectId) return status('Choose a shared project before assigning a team member');
  const userId = $('cloudTeamUserId').value.trim();
  const role = $('cloudTeamRole').value;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return status('Enter a valid Supabase Auth user UUID');
  }
  try {
    await cloud().addCpecTeamMember({ projectId: activeProjectId, userId, role });
    $('cloudTeamForm').reset();
    await loadTeam();
    status('Project access granted to ' + role.replaceAll('_', ' '), true);
  } catch (error) {
    status('Could not assign team member: ' + error.message);
  }
}

async function syncProject() {
  const api = cloud();
  const context = api?.getContext?.();
  if (!context) {
    status('Sign in through Company login before syncing');
    window.parent?.document?.getElementById('cloud-open')?.click();
    return;
  }
  const projectId = $('cloudProjectSelect').value;
  if (!projectId) return status('Choose or create a shared project first');
  const button = $('syncCloudProject');
  button.disabled = true;
  try {
    await window.CPEC.save();
    const data = window.CPEC.getData();
    data.meta.cloudProjectId = projectId;
    const uploaded = await uploadAttachments(data, api, projectId);
    const remoteRows = await api.listCpecRecords(projectId);
    const remote = new Map(remoteRows.map((row) => [keyOf(row.record_type, row.record_id), row]));
    data._cloudVersions = data._cloudVersions || {};
    data._cloudSnapshots = data._cloudSnapshots || {};
    const conflicts = [];
    let pushed = 0, pulled = 0;

    for (const local of localRecords(data)) {
      const key = keyOf(local.type, local.id);
      const localJson = serialise(local.payload);
      const snapshot = data._cloudSnapshots[key];
      const cloudRow = remote.get(key);

      if (!cloudRow) {
        if (snapshot !== undefined) {
          conflicts.push(local.type + ' ' + local.id + ': the shared record is missing; local copy retained');
          continue;
        }
        const result = await api.saveCpecRecord({
          projectId, recordType: local.type, recordId: local.id, payload: local.payload
        });
        if (result.status === 'saved') {
          const row = result.record;
          data._cloudVersions[key] = row.version;
          data._cloudSnapshots[key] = localJson;
          pushed++;
          remote.set(key, row);
        } else if (result.status === 'conflict' && result.record) {
          conflicts.push(local.type + ' ' + local.id + ': another device created this record');
        } else {
          conflicts.push(local.type + ' ' + local.id + ': could not create shared record');
        }
        continue;
      }

      if (cloudRow.deleted_at) {
        if (snapshot !== undefined && localJson === snapshot) {
          replaceLocal(data, local.type, local.id, null);
          delete data._cloudVersions[key];
          delete data._cloudSnapshots[key];
          pulled++;
        } else {
          conflicts.push(local.type + ' ' + local.id + ': deleted in cloud but changed locally');
        }
        continue;
      }

      const remoteJson = serialise(cloudRow.payload || {});
      if (snapshot === undefined) {
        if (localJson === remoteJson) {
          data._cloudVersions[key] = cloudRow.version;
          data._cloudSnapshots[key] = remoteJson;
        } else {
          conflicts.push(local.type + ' ' + local.id + ': existing cloud record differs from this device');
        }
        continue;
      }

      const localChanged = localJson !== snapshot;
      const remoteChanged = remoteJson !== snapshot;
      if (localChanged && remoteChanged && localJson !== remoteJson) {
        conflicts.push(local.type + ' ' + local.id + ': both this device and another user changed it');
      } else if (localChanged && !remoteChanged) {
        const result = await api.saveCpecRecord({
          projectId, recordType: local.type, recordId: local.id,
          payload: local.payload, expectedVersion: cloudRow.version
        });
        if (result.status === 'saved') {
          data._cloudVersions[key] = result.record.version;
          data._cloudSnapshots[key] = localJson;
          pushed++;
        } else {
          conflicts.push(local.type + ' ' + local.id + ': changed on the server during upload');
        }
      } else if (!localChanged && remoteChanged) {
        replaceLocal(data, local.type, local.id, cloudRow.payload);
        data._cloudVersions[key] = cloudRow.version;
        data._cloudSnapshots[key] = remoteJson;
        pulled++;
      } else {
        data._cloudVersions[key] = cloudRow.version;
        data._cloudSnapshots[key] = remoteJson;
      }
    }

    const localKeys = new Set(localRecords(data).map((row) => keyOf(row.type, row.id)));
    for (const row of remoteRows) {
      const key = keyOf(row.record_type, row.record_id);
      if (localKeys.has(key)) continue;
      if (row.deleted_at) continue;
      if (row.record_type === 'project_meta' || collections[row.record_type]) {
        replaceLocal(data, row.record_type, row.record_id, row.payload || {});
        data._cloudVersions[key] = row.version;
        data._cloudSnapshots[key] = serialise(row.payload || {});
        pulled++;
      }
    }

    await window.CPEC.save();
    window.CPEC.render();
    await loadTeam();
    if (conflicts.length) {
      status('Sync finished with ' + conflicts.length + ' conflict(s) · local copies preserved');
      alert('Some records need review before they can be merged:\n\n' + conflicts.slice(0, 12).join('\n'));
    } else {
      status('Shared sync complete · ' + pushed + ' uploaded · ' + pulled + ' downloaded · ' + uploaded + ' files', true);
    }
  } catch (error) {
    status('Sync failed · ' + error.message);
  } finally {
    button.disabled = false;
  }
}

(async () => {
  await ready();
  $('loadCloudProjects')?.addEventListener('click', loadProjects);
  $('createCloudProject')?.addEventListener('click', createProject);
  $('syncCloudProject')?.addEventListener('click', syncProject);
  $('cloudProjectSelect')?.addEventListener('change', (event) => selectProject(event.target.value));
  $('cloudTeamForm')?.addEventListener('submit', addTeamMember);
  const data = window.CPEC.getData();
  if (data.meta?.cloudProjectId) {
    await loadProjects();
  } else {
    status('Sign in via Company login · then load or create a project');
  }
  window.addEventListener('online', () => status('Online · ready for manual shared sync'));
  window.addEventListener('beforeunload', () => { if (stopRealtime) stopRealtime(); });
})();
