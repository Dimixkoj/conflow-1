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
supabase.auth.onAuthStateChange((_event, _session) => { queueMicrotask(() => refreshAuth()); });
refreshAuth();
