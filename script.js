
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// VYNTORA Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgbfQu5XPBQNVHMKFAjfvK5KSTy3VFdEY",
  authDomain: "vyntora-gen-z.firebaseapp.com",
  projectId: "vyntora-gen-z",
  storageBucket: "vyntora-gen-z.firebasestorage.app",
  messagingSenderId: "1091859566524",
  appId: "1:1091859566524:web:39e57e38ee5defb28ee5b9",
  measurementId: "G-1EPNG6CHF1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const $ = (id) => document.getElementById(id);

// Page Elements
const loginTab = $("loginTab");
const signupTab = $("signupTab");
const authForm = $("authForm");
const formTitle = $("formTitle");
const subtitle = $("subtitle");
const modeLabel = $("modeLabel");
const submitLabel = $("submitLabel");
const nameWrap = $("nameWrap");
const fullName = $("fullName");
const email = $("email");
const password = $("password");
const message = $("message");
const forgotBtn = $("forgotBtn");
const googleBtn = $("googleBtn");
const switchText = $("switchText");
const switchBtn = $("switchBtn");
const themeBtn = $("themeBtn");
const robot = $("robot");

let currentMode = "login";
let isRedirecting = false;

// Display messages
function showMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

// Redirect after successful authentication
function goToDashboard() {
  if (isRedirecting) return;

  isRedirecting = true;
  showMessage("সফল হয়েছে! VYNTORA Dashboard খুলছে...");

  animateRobot();

  setTimeout(() => {
    window.location.href = "customer.html";
  }, 800);
}

// Friendly Firebase errors
function friendlyError(error) {
  const errors = {
    "auth/email-already-in-use":
      "এই Email দিয়ে ইতিমধ্যে Account তৈরি হয়েছে।",

    "auth/invalid-email":
      "সঠিক Email Address লিখুন।",

    "auth/weak-password":
      "Password কমপক্ষে ৬ অক্ষরের হতে হবে।",

    "auth/invalid-credential":
      "Email অথবা Password সঠিক নয়।",

    "auth/user-not-found":
      "এই Email দিয়ে কোনো Account পাওয়া যায়নি।",

    "auth/wrong-password":
      "Password সঠিক নয়।",

    "auth/popup-closed-by-user":
      "Google Sign-In বন্ধ হয়ে গেছে। আবার চেষ্টা করুন।",

    "auth/popup-blocked":
      "Browser Popup আটকে দিয়েছে। Popup অনুমতি দিয়ে চেষ্টা করুন।",

    "auth/unauthorized-domain":
      "Firebase Authorized domains-এ GitHub Pages domain যোগ করুন।",

    "auth/network-request-failed":
      "Internet Connection পরীক্ষা করুন।",

    "auth/too-many-requests":
      "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

    "auth/operation-not-allowed":
      "Firebase Console-এ এই Sign-In Method চালু করুন।"
  };

  return errors[error.code] ||
    "সমস্যা হয়েছে: " + (error.message || "আবার চেষ্টা করুন।");
}

// Robot animation
function animateRobot() {
  if (!robot) return;

  robot.style.animation = "none";
  void robot.offsetWidth;
  robot.style.animation = "floatRobot .7s ease-in-out 2";
}

// Switch Login / Signup
function setMode(mode) {
  currentMode = mode;
  isRedirecting = false;

  const isSignup = mode === "signup";

  loginTab.classList.toggle("active", !isSignup);
  signupTab.classList.toggle("active", isSignup);

  nameWrap.classList.toggle("hidden", !isSignup);
  fullName.required = isSignup;

  forgotBtn.classList.toggle("hidden", isSignup);

  formTitle.textContent = isSignup
    ? "Create your account"
    : "Welcome back!";

  subtitle.textContent = isSignup
    ? "Join VYNTORA and discover something new."
    : "Log in to continue shopping.";

  modeLabel.textContent = isSignup
    ? "JOIN VYNTORA"
    : "WELCOME BACK";

  submitLabel.textContent = isSignup
    ? "Create Account"
    : "Log In";

  switchText.firstChild.textContent = isSignup
    ? "Already have an account? "
    : "New to VYNTORA? ";

  switchBtn.textContent = isSignup
    ? "Log in"
    : "Create an account";

  password.autocomplete = isSignup
    ? "new-password"
    : "current-password";

  showMessage("");
  animateRobot();
}

loginTab.addEventListener("click", () => {
  setMode("login");
});

signupTab.addEventListener("click", () => {
  setMode("signup");
});

switchBtn.addEventListener("click", () => {
  setMode(currentMode === "login" ? "signup" : "login");
});

// Show / Hide Password
if (!$("passwordToggle")) {
  password.insertAdjacentHTML(
    "afterend",
    '<button type="button" id="passwordToggle" class="forgot">Show Password</button>'
  );
}

$("passwordToggle").addEventListener("click", (event) => {
  const show = password.type === "password";

  password.type = show ? "text" : "password";

  event.currentTarget.textContent = show
    ? "Hide Password"
    : "Show Password";
});

// Dark / Light Theme
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");

  themeBtn.textContent = isLight ? "🌙" : "☀️";

  try {
    localStorage.setItem(
      "vyntora-theme",
      isLight ? "light" : "dark"
    );
  } catch (error) {
    // Theme still works for this page session.
  }
});

// Restore saved theme
try {
  if (localStorage.getItem("vyntora-theme") === "light") {
    document.body.classList.add("light");
    themeBtn.textContent = "🌙";
  }
} catch (error) {
  // Continue with default theme.
}

// Logout Button
let logoutBtn = $("logoutBtn");

if (!logoutBtn) {
  logoutBtn = document.createElement("button");
  logoutBtn.id = "logoutBtn";
  logoutBtn.type = "button";
  logoutBtn.className = "google-btn";
  logoutBtn.textContent = "Log Out";
  logoutBtn.hidden = true;

  message.insertAdjacentElement("afterend", logoutBtn);
}

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showMessage("আপনি সফলভাবে Logout করেছেন।");
    isRedirecting = false;
  } catch (error) {
    showMessage(friendlyError(error));
  }
});

// Firebase Email Signup and Login
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isRedirecting) return;

  if (!authForm.checkValidity()) {
    authForm.reportValidity();
    return;
  }

  const emailValue = email.value.trim();
  const passwordValue = password.value;

  submitLabel.disabled = true;
  submitLabel.textContent = "Please wait...";
  showMessage("");

  try {
    if (currentMode === "signup") {
      const name = fullName.value.trim();

      if (!name) {
        showMessage("আপনার নাম লিখুন।");
        return;
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        emailValue,
        passwordValue
      );

      await updateProfile(result.user, {
        displayName: name
      });

      showMessage(
        "Welcome to VYNTORA, " +
        name +
        "! Account created successfully."
      );
    } else {
      const result = await signInWithEmailAndPassword(
        auth,
        emailValue,
        passwordValue
      );

      showMessage(
        "Welcome back, " +
        (result.user.displayName || result.user.email) +
        "!"
      );
    }

    goToDashboard();

  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    submitLabel.disabled = false;

    if (!isRedirecting) {
      submitLabel.textContent =
        currentMode === "signup"
          ? "Create Account"
          : "Log In";
    }
  }
});

// Google Sign-In
googleBtn.addEventListener("click", async () => {
  if (isRedirecting) return;

  try {
    googleBtn.disabled = true;
    showMessage("Connecting to Google...");

    const result = await signInWithPopup(auth, googleProvider);

    showMessage(
      "Welcome to VYNTORA, " +
      (result.user.displayName || "Customer") +
      "!"
    );

    goToDashboard();

  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    googleBtn.disabled = false;
  }
});

// Forgot Password
forgotBtn.addEventListener("click", async () => {
  const emailValue = email.value.trim();

  if (!emailValue) {
    showMessage("প্রথমে Email Address লিখুন।");
    email.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailValue);

    showMessage(
      "Password reset email পাঠানো হয়েছে। Inbox ও Spam folder দেখুন।"
    );
  } catch (error) {
    showMessage(friendlyError(error));
  }
});

// Check Login Status
onAuthStateChanged(auth, (user) => {
  logoutBtn.hidden = !user;

  if (user) {
    showMessage(
      "Signed in: " + (user.displayName || user.email)
    );
  }
});

// Initial Screen
setMode("login");
