import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cachcqnqqowmmripuqeb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pPZEJlJj-wcHzKqG6vK-_g_oIMSfd-V';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  global: { headers: { 'x-client-info': 'dimixkoj-conflow1-auth-pages' } }
});

const $ = (id) => document.getElementById(id);
const page = document.body.dataset.authPage;
const params = new URLSearchParams(window.location.search);
const emailFromUrl = params.get('email') || sessionStorage.getItem('conflow-auth-email') || '';
const message = (text, kind = 'info') => {
  const node = $('auth-message');
  if (!node) return;
  node.textContent = text;
  node.dataset.kind = kind;
  node.hidden = false;
};
const go = (file) => { window.location.href = new URL(file, window.location.href).href; };
const setBusy = (button, busy, label) => {
  if (!button) return;
  button.disabled = busy;
  if (label) button.textContent = label;
};

if ($('auth-email') && emailFromUrl) $('auth-email').value = emailFromUrl;
if (page === 'login') {
  $('login-submit')?.addEventListener('click', async () => {
    const email = $('auth-email').value.trim();
    const password = $('auth-password').value;
    if (!email || !password) return message('Enter your email address and password.', 'error');
    const button = $('login-submit');
    setBusy(button, true, 'Signing in…');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      sessionStorage.removeItem('conflow-auth-email');
      go('index.html');
    } catch (error) {
      const detail = /email not confirmed/i.test(error.message)
        ? 'Your email is not confirmed yet. Open the confirmation page and resend the confirmation email if needed.'
        : error.message;
      message('Sign-in failed: ' + detail, 'error');
    } finally { setBusy(button, false, 'Sign in'); }
  });
  $('forgot-password')?.addEventListener('click', async () => {
    const email = $('auth-email').value.trim();
    if (!email) return message('Enter your email address first, then choose Forgot password.', 'error');
    const button = $('forgot-password');
    setBusy(button, true, 'Sending…');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      message('If the address is registered, a password-reset email will be sent. Check your inbox and spam folder.', 'success');
    } catch (error) { message('Could not request password reset: ' + error.message, 'error'); }
    finally { setBusy(button, false, 'Forgot password?'); }
  });
}

if (page === 'register') {
  $('register-submit')?.addEventListener('click', async () => {
    const email = $('auth-email').value.trim();
    const password = $('auth-password').value;
    const confirm = $('auth-password-confirm').value;
    if (!email || password.length < 8) return message('Enter a valid email and a password of at least 8 characters.', 'error');
    if (password !== confirm) return message('The passwords do not match.', 'error');
    const button = $('register-submit');
    setBusy(button, true, 'Creating account…');
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      sessionStorage.setItem('conflow-auth-email', email);
      if (data.session) {
        message('Your account is ready. Opening ConFlow 1…', 'success');
        setTimeout(() => go('index.html'), 700);
      } else {
        go('confirm-email.html?email=' + encodeURIComponent(email));
      }
    } catch (error) {
      message('Account creation failed: ' + error.message, 'error');
    } finally { setBusy(button, false, 'Create account'); }
  });
}

if (page === 'confirm') {
  const emailInput = $('auth-email');
  if (emailInput) emailInput.value = emailFromUrl;
  $('resend-confirmation')?.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) return message('Enter the email address used to create your account.', 'error');
    const button = $('resend-confirmation');
    setBusy(button, true, 'Sending…');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      sessionStorage.setItem('conflow-auth-email', email);
      message('Confirmation request sent. Check your inbox and spam folder. Avoid repeated requests; email providers apply rate limits.', 'success');
      let seconds = 60;
      button.textContent = 'Resend available in 60s';
      const timer = window.setInterval(() => {
        seconds -= 1;
        if (seconds <= 0) {
          window.clearInterval(timer);
          setBusy(button, false, 'Resend confirmation email');
        } else button.textContent = 'Resend available in ' + seconds + 's';
      }, 1000);
    } catch (error) {
      message('Could not resend confirmation: ' + error.message, 'error');
      setBusy(button, false, 'Resend confirmation email');
    }
  });
  $('check-confirmation')?.addEventListener('click', async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) return message('Could not verify the current session: ' + error.message, 'error');
    if (data.user?.email_confirmed_at) {
      message('Email confirmed successfully. You can now sign in to ConFlow 1.', 'success');
    } else {
      message('Confirmation is still pending. Open the latest confirmation email and follow its link, then return here.', 'info');
    }
  });
}

$('back-to-login')?.addEventListener('click', () => go('login.html'));
