import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cachcqnqqowmmripuqeb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pPZEJlJj-wcHzKqG6vK-_g_oIMSfd-V';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  global: { headers: { 'x-client-info': 'dimixkoj-conflow1' } }
});

const $ = (id) => document.getElementById(id);
const panel = $('cloud-auth-panel');
let activeWorkspace = null;
let activeUser = null;
const appKey = window.APP_VARIANT === 'buildflow' ? 'buildflow1' : 'conflow1';

function status(message, connected = false) {
  if ($('cloud-status')) $('cloud-status').textContent = connected ? 'Cloud connected' : 'Cloud not connected';
  if ($('cloud-account-status')) $('cloud-account-status').textContent = message;
}
function showPanel(show) { panel?.classList.toggle('hidden', !show); }
$('cloud-open')?.addEventListener('click', () => showPanel(true));
$('cloud-close')?.addEventListener('click', () => showPanel(false));

async function resolveWorkspace(user) {
  const { data: ownerWorkspace, error: ownerError } = await supabase
    .from('company_workspaces').select('id, company_name, owner_email')
    .ilike('owner_email', user.email).maybeSingle();
  if (!ownerError && ownerWorkspace) return ownerWorkspace;
  const { data: memberships, error: membershipError } = await supabase
    .from('company_memberships').select('company_id, role, status')
    .eq('user_id', user.id).eq('app_key', appKey).eq('status', 'active').limit(1);
  if (membershipError) throw membershipError;
  if (!memberships?.length) return null;
  const { data: workspace, error } = await supabase.from('company_workspaces')
    .select('id, company_name, owner_email').eq('id', memberships[0].company_id).single();
  if (error) throw error;
  return workspace;
}

async function refreshAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  activeUser = session?.user || null;
  activeWorkspace = null;
  if (!activeUser) {
    status('Not signed in. Sign in with your company account.');
    $('cloud-sync').disabled = true; $('cloud-sign-out').disabled = true;
    return;
  }
  try {
    activeWorkspace = await resolveWorkspace(activeUser);
    if (!activeWorkspace) {
      status('Signed in, but no active membership or matching owner workspace exists for this app. Ask the company owner to grant access.');
      $('cloud-sync').disabled = true;
    } else {
      status('Signed in as ' + activeUser.email + ' · ' + activeWorkspace.company_name + ' · ' + appKey, true);
      $('cloud-sync').disabled = false;
    }
    $('cloud-sign-out').disabled = false;
  } catch (error) {
    status('Account signed in; workspace access check failed: ' + error.message);
    $('cloud-sync').disabled = true;
  }
}

$('cloud-sign-in')?.addEventListener('click', async () => {
  const email = $('cloud-email').value.trim(); const password = $('cloud-password').value;
  if (!email || !password) return status('Enter your email and password.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return status('Sign-in failed: ' + error.message);
  await refreshAuth();
});
$('cloud-sign-up')?.addEventListener('click', async () => {
  const email = $('cloud-email').value.trim(); const password = $('cloud-password').value;
  if (!email || password.length < 8) return status('Enter an email and a password of at least 8 characters.');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return status('Account creation failed: ' + error.message);
  if (!data.session) status('Account created. Check your email to confirm the account, then sign in.');
  else await refreshAuth();
});
$('cloud-sign-out')?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return status('Sign-out failed: ' + error.message);
  await refreshAuth();
});
$('cloud-sync')?.addEventListener('click', async () => {
  if (!activeUser || !activeWorkspace) return status('Sign in and confirm app membership before syncing.');
  try {
    $('cloud-sync').disabled = true;
    const localProjects = await window.desktop.listProjects();
    const rows = localProjects.map((project) => ({
      id: project.id, company_id: activeWorkspace.id, app_key: appKey,
      name: project.title, site_address: null, timezone: 'Africa/Lagos',
      status: ['active','paused','completed','archived'].includes(project.status) ? project.status : 'active',
      created_by: activeUser.id, updated_at: project.updated_at || new Date().toISOString()
    }));
    if (rows.length) {
      const { error } = await supabase.from('projects').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    }
    status('Uploaded ' + rows.length + ' local project record(s) to ' + appKey + '. Other record types remain local for now.', true);
  } catch (error) {
    status('Project sync failed: ' + error.message);
  } finally {
    $('cloud-sync').disabled = !activeWorkspace;
  }
});

window.conflowCloud = {
  getContext: () => activeUser && activeWorkspace ? {
    userId: activeUser.id, email: activeUser.email, companyId: activeWorkspace.id,
    companyName: activeWorkspace.company_name, appKey
  } : null,
  listCpecProjects: async () => {
    if (!activeUser || !activeWorkspace || appKey !== 'conflow1') throw new Error('Sign in to the ConFlow 1 company workspace first.');
    const ownerAccess = String(activeWorkspace.owner_email || '').toLowerCase() === String(activeUser.email || '').toLowerCase();
    const { data: memberships, error: membershipError } = await supabase.from('company_memberships')
      .select('role').eq('company_id', activeWorkspace.id).eq('app_key', 'conflow1')
      .eq('user_id', activeUser.id).eq('status', 'active');
    if (membershipError) throw membershipError;
    const companyAdmin = ownerAccess || (memberships || []).some((m) => ['company_owner','company_admin','hr_manager'].includes(m.role));
    let allowedProjectIds = null;
    if (!companyAdmin) {
      const { data: assignments, error: assignmentError } = await supabase.from('construction_project_team')
        .select('project_id').eq('user_id', activeUser.id).eq('status', 'active');
      if (assignmentError) throw assignmentError;
      allowedProjectIds = (assignments || []).map((a) => a.project_id);
      if (!allowedProjectIds.length) return [];
    }
    let query = supabase.from('projects')
      .select('id,name,project_code,site_address,status,updated_at')
      .eq('company_id', activeWorkspace.id).eq('app_key', 'conflow1')
      .order('updated_at', { ascending: false });
    if (allowedProjectIds) query = query.in('id', allowedProjectIds);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  createCpecProject: async (meta) => {
    if (!activeUser || !activeWorkspace || appKey !== 'conflow1') throw new Error('Sign in to ConFlow 1 before creating a shared project.');
    const { data, error } = await supabase.from('projects').insert({
      company_id: activeWorkspace.id, app_key: 'conflow1',
      name: String(meta?.title || 'Untitled construction project').trim(),
      site_address: String(meta?.location || '').trim() || null,
      timezone: 'Africa/Lagos', status: 'active', created_by: activeUser.id
    }).select('id,name,project_code,site_address,status,updated_at').single();
    if (error) throw error;
    const ownerAccess = String(activeWorkspace.owner_email || '').toLowerCase() === String(activeUser.email || '').toLowerCase();
    const { data: memberships } = await supabase.from('company_memberships')
      .select('role').eq('company_id', activeWorkspace.id).eq('app_key', 'conflow1')
      .eq('user_id', activeUser.id).eq('status', 'active');
    const memberRole = (memberships || []).find((m) => ['project_manager','site_supervisor','company_owner','company_admin','hr_manager'].includes(m.role))?.role;
    const creatorRole = ownerAccess || ['company_owner','company_admin','hr_manager'].includes(memberRole) ? 'project_manager' : memberRole;
    const { error: teamError } = await supabase.from('construction_project_team').insert({
      company_id: activeWorkspace.id, app_key: 'conflow1', project_id: data.id,
      user_id: activeUser.id, role: creatorRole || 'project_manager',
      status: 'active', added_by: activeUser.id
    });
    return { ...data, teamAssignmentWarning: teamError?.message || null };
  },
  listCpecRecords: async (projectId) => {
    if (!activeUser || !activeWorkspace) throw new Error('Sign in before loading shared project records.');
    const { data, error } = await supabase.from('construction_project_records')
      .select('id,project_id,record_type,record_id,payload,version,updated_at,deleted_at')
      .eq('project_id', projectId).order('updated_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  saveCpecRecord: async ({ projectId, recordType, recordId, payload, expectedVersion = null, deleted = false }) => {
    if (!activeUser || !activeWorkspace) throw new Error('Sign in before syncing shared project records.');
    const { data, error } = await supabase.rpc('cpec_save_record', {
      p_project_id: projectId, p_record_type: recordType, p_record_id: recordId,
      p_payload: payload, p_expected_version: expectedVersion, p_deleted: deleted
    });
    if (error) throw error;
    return data;
  },
  listCpecTeam: async (projectId) => {
    const { data, error } = await supabase.from('construction_project_team')
      .select('id,user_id,role,status,created_at').eq('project_id', projectId).order('created_at');
    if (error) throw error;
    return data || [];
  },
  addCpecTeamMember: async ({ projectId, userId, role }) => {
    if (!activeUser || !activeWorkspace) throw new Error('Sign in before managing project access.');
    const { data: member, error: memberError } = await supabase.from('company_memberships')
      .select('id').eq('company_id', activeWorkspace.id).eq('app_key', 'conflow1')
      .eq('user_id', userId).eq('status', 'active').maybeSingle();
    if (memberError) throw memberError;
    if (!member) throw new Error('This user must first be added as an active ConFlow 1 company member.');
    const { error } = await supabase.from('construction_project_team').insert({
      company_id: activeWorkspace.id, app_key: 'conflow1', project_id: projectId,
      user_id: userId, role, status: 'active', added_by: activeUser.id
    });
    if (error) throw error;
  },
  subscribeCpecProject: (projectId, onChange) => {
    const channel = supabase.channel('cpec-project-' + projectId)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'construction_project_records',
        filter: 'project_id=eq.' + projectId
      }, onChange).subscribe();
    return () => { supabase.removeChannel(channel); };
  },
  uploadCpecAttachment: async ({ projectId, fileId, name, blob, contentType }) => {
    const safeName = String(name || 'attachment').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
    const path = projectId + '/' + fileId + '/' + safeName;
    const { data, error } = await supabase.storage.from('cpec-project-files')
      .upload(path, blob, { contentType: contentType || 'application/octet-stream', upsert: true });
    if (error) throw error;
    return data.path;
  },
  downloadCpecAttachment: async (path) => {
    const { data, error } = await supabase.storage.from('cpec-project-files').download(path);
    if (error) throw error;
    return data;
  }
};

supabase.auth.onAuthStateChange((_event, _session) => { queueMicrotask(() => refreshAuth()); });
refreshAuth();
