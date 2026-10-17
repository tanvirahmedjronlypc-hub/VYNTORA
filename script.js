
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const authForm = document.getElementById('authForm');

const formTitle = document.getElementById('formTitle');
const subtitle = document.getElementById('subtitle');
const modeLabel = document.getElementById('modeLabel');
const submitLabel = document.getElementById('submitLabel');

const nameWrap = document.getElementById('nameWrap');
const fullName = document.getElementById('fullName');
const password = document.getElementById('password');
const message = document.getElementById('message');

const forgotBtn = document.getElementById('forgotBtn');
const googleBtn = document.getElementById('googleBtn');
const switchText = document.getElementById('switchText');
const switchBtn = document.getElementById('switchBtn');

const themeBtn = document.getElementById('themeBtn');
const robot = document.getElementById('robot');

let currentMode = 'login';

function showMessage(text) {
  message.textContent = text;
}

function setMode(mode) {
  currentMode = mode;

  const isSignup = mode === 'signup';

  loginTab.classList.toggle('active', !isSignup);
  signupTab.classList.toggle('active', isSignup);

  nameWrap.classList.toggle('hidden', !isSignup);
  fullName.required = isSignup;

  forgotBtn.classList.toggle('hidden', isSignup);

  formTitle.textContent = isSignup
    ? 'Create your account'
    : 'Welcome back!';

  subtitle.textContent = isSignup
    ? 'Join VYNTORA and discover something new.'
    : 'Log in to continue shopping.';

  modeLabel.textContent = isSignup
    ? 'JOIN VYNTORA'
    : 'WELCOME BACK';

  submitLabel.textContent = isSignup
    ? 'Create Account'
    : 'Log In';

  switchText.firstChild.textContent = isSignup
    ? 'Already have an account? '
    : 'New to VYNTORA? ';

  switchBtn.textContent = isSignup
    ? 'Log in'
    : 'Create an account';

  password.autocomplete = isSignup
    ? 'new-password'
    : 'current-password';

  showMessage('');

  // Robot reaction animation
  robot.style.animation = 'none';
  void robot.offsetWidth;
  robot.style.animation = 'floatRobot 1s ease-in-out 2';
}

loginTab.addEventListener('click', () => {
  setMode('login');
});

signupTab.addEventListener('click', () => {
  setMode('signup');
});

switchBtn.addEventListener('click', () => {
  setMode(currentMode === 'login' ? 'signup' : 'login');
});

// Show / hide password
const passwordField = document.getElementById('password');

passwordField.insertAdjacentHTML(
  'afterend',
  '<button type="button" id="passwordToggle" class="forgot">Show / Hide Password</button>'
);

document.getElementById('passwordToggle').addEventListener('click', () => {
  const isHidden = password.type === 'password';

  password.type = isHidden ? 'text' : 'password';

  document.getElementById('passwordToggle').textContent =
    isHidden ? 'Hide Password' : 'Show Password';
});

// Light / Dark theme
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');

  const isLight = document.body.classList.contains('light');

  themeBtn.textContent = isLight ? '🌙' : '☀️';

  try {
    localStorage.setItem('vyntora-theme', isLight ? 'light' : 'dark');
  } catch (error) {
    // Theme still works if browser storage is unavailable.
  }
});

// Restore saved theme
try {
  if (localStorage.getItem('vyntora-theme') === 'light') {
    document.body.classList.add('light');
    themeBtn.textContent = '🌙';
  }
} catch (error) {
  // Use the default dark theme.
}

// Login / Signup form preview
authForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!authForm.checkValidity()) {
    authForm.reportValidity();
    return;
  }

  showMessage(
    currentMode === 'signup'
      ? 'Signup design ready. Firebase Authentication must be connected to create your account.'
      : 'Login design ready. Firebase Authentication must be connected to sign in.'
  );

  robot.style.animation = 'none';
  void robot.offsetWidth;
  robot.style.animation = 'floatRobot .7s ease-in-out 3';
});

// Forgot password preview
forgotBtn.addEventListener('click', () => {
  const emailInput = document.getElementById('email');

  if (!emailInput.value.trim()) {
    showMessage('Enter your email address first to reset your password.');
    emailInput.focus();
    return;
  }

  showMessage(
    'Password reset requires Firebase Authentication to be connected.'
  );
});

// Google sign-in preview
googleBtn.addEventListener('click', () => {
  showMessage(
    'Google Sign-In requires Firebase Authentication setup.'
  );

  robot.style.animation = 'none';
  void robot.offsetWidth;
  robot.style.animation = 'floatRobot .7s ease-in-out 2';
});

// Initial state
setMode('login');
