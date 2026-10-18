
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
  appId: "1:1091859566524:web:39e57e38ee5b9",
  measurementId: "G-1EPNG6CHF1"
};

// Admin UID
const ADMIN_UID = "ecLFGmZkmUWTaV4lvqw7vzcTXd32";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});

const $ = (id) => document.getElementById(id);

// Page elements
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

// Display message safely
function showMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

// Return path relative to current GitHub Pages project
function getPageUrl(page) {
  const path = window.location.pathname;
  const basePath = path.substring(0, path.lastIndexOf("/") + 1);
  return basePath + page;
}

// Animate robot
function animateRobot() {
  if (!robot) return;

  robot.style.animation = "none";
  void robot.offsetWidth;
  robot.style.animation = "floatRobot .7s ease-in-out 2";
}

// Redirect according to Firebase UID
function goToDashboard(user) {
  if (isRedirecting) return;

  if (!user) {
    showMessage("Login session পাওয়া যায়নি। আবার Login করুন।");
    return;
  }

  isRedirecting = true;
  showMessage("সফল হয়েছে! VYNTORA Dashboard খুলছে...");
  animateRobot();

  const destination =
    user.uid === ADMIN_UID ? "admin.html" : "customer.html";

  setTimeout(() => {
    window.location.replace(getPageUrl(destination));
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
      "Google Sign-In বন্ধ হয়েছে। আবার চেষ্টা করুন।",

    "auth/popup-blocked":
      "Browser Popup আটকে দিয়েছে। Popup অনুমতি দিয়ে চেষ্টা করুন।",

    "auth/unauthorized-domain":
      "Firebase Authorized domains-এ GitHub Pages domain যোগ করুন।",

    "auth/network-request-failed":
      "Internet Connection পরীক্ষা করুন।",

    "auth/too-many-requests":
      "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

    "auth/operation-not-allowed":
      "Firebase Console-এ এই Sign-In Method চালু করুন।",

    "auth/account-exists-with-different-credential":
      "এই Email অন্য Sign-In Method দিয়ে নিবন্ধিত।",

    "auth/missing-password":
      "Password লিখুন।"
  };

  return errors[error.code] ||
    "সমস্যা হয়েছে: " + (error.message || "আবার চেষ্টা করুন।");
}

// Switch Login / Signup
function setMode(mode) {
  currentMode = mode;
  isRedirecting = false;

  const isSignup = mode === "signup";

  if (loginTab) loginTab.classList.toggle("active", !isSignup);
  if (signupTab) signupTab.classList.toggle("active", isSignup);

  if (nameWrap) nameWrap.classList.toggle("hidden", !isSignup);
  if (fullName) fullName.required = isSignup;

  if (forgotBtn) forgotBtn.classList.toggle("hidden", isSignup);

  if (formTitle) {
    formTitle.textContent = isSignup
      ? "Create your account"
      : "Welcome back!";
  }

  if (subtitle) {
    subtitle.textContent = isSignup
      ? "Join VYNTORA and discover something new."
      : "Log in to continue shopping.";
  }

  if (modeLabel) {
    modeLabel.textContent = isSignup
      ? "JOIN VYNTORA"
      : "WELCOME BACK";
  }

  if (submitLabel) {
    submitLabel.textContent = isSignup
      ? "Create Account"
      : "Log In";
    submitLabel.disabled = false;
  }

  if (switchText && switchText.firstChild) {
    switchText.firstChild.textContent = isSignup
      ? "Already have an account? "
      : "New to VYNTORA? ";
  }

  if (switchBtn) {
    switchBtn.textContent = isSignup
      ? "Log in"
      : "Create an account";
  }

  if (password) {
    password.autocomplete = isSignup
      ? "new-password"
      : "current-password";
  }

  showMessage("");
  animateRobot();
}

if (loginTab) {
  loginTab.addEventListener("click", () => setMode("login"));
}

if (signupTab) {
  signupTab.addEventListener("click", () => setMode("signup"));
}

if (switchBtn) {
  switchBtn.addEventListener("click", () => {
    setMode(currentMode === "login" ? "signup" : "login");
  });
}

// Show / Hide Password
if (password && !$("passwordToggle")) {
  password.insertAdjacentHTML(
    "afterend",
    '<button type="button" id="passwordToggle" class="forgot">Show Password</button>'
  );
}

const passwordToggle = $("passwordToggle");

if (passwordToggle && password) {
  passwordToggle.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    passwordToggle.textContent = show
      ? "Hide Password"
      : "Show Password";
  });
}

// Dark / Light Theme
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light", isLight);

  if (themeBtn) {
    themeBtn.textContent = isLight ? "🌙" : "☀️";
    themeBtn.setAttribute(
      "aria-label",
      isLight ? "Switch to dark theme" : "Switch to light theme"
    );
  }
}

try {
  applyTheme(localStorage.getItem("vyntora-theme") || "dark");
} catch (error) {
  applyTheme("dark");
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const isLight = !document.body.classList.contains("light");
    applyTheme(isLight ? "light" : "dark");

    try {
      localStorage.setItem(
        "vyntora-theme",
        isLight ? "light" : "dark"
      );
    } catch (error) {
      // Theme remains active for this page session.
    }
  });
}

// Logout button
let logoutBtn = $("logoutBtn");

if (!logoutBtn && message) {
  logoutBtn = document.createElement("button");
  logoutBtn.id = "logoutBtn";
  logoutBtn.type = "button";
  logoutBtn.className = "google-btn";
  logoutBtn.textContent = "Log Out";
  logoutBtn.hidden = true;
  message.insertAdjacentElement("afterend", logoutBtn);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      isRedirecting = false;
      showMessage("আপনি সফলভাবে Logout করেছেন।");
      logoutBtn.hidden = true;
    } catch (error) {
      showMessage(friendlyError(error));
    }
  });
}

// Email Signup / Login
if (authForm) {
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isRedirecting) return;

    if (!authForm.checkValidity()) {
      authForm.reportValidity();
      return;
    }

    const emailValue = email.value.trim();
    const passwordValue = password.value;

    if (submitLabel) {
      submitLabel.disabled = true;
      submitLabel.textContent = "Please wait...";
    }

    showMessage("");

    try {
      let user;

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

        user = result.user;
        showMessage(
          "Welcome to VYNTORA, " + name + "! Account created successfully."
        );
      } else {
        const result = await signInWithEmailAndPassword(
          auth,
          emailValue,
          passwordValue
        );

        user = result.user;
        showMessage(
          "Welcome back, " + (user.displayName || user.email) + "!"
        );
      }

      goToDashboard(user);

    } catch (error) {
      showMessage(friendlyError(error));
    } finally {
      if (submitLabel) {
        submitLabel.disabled = false;

        if (!isRedirecting) {
          submitLabel.textContent =
            currentMode === "signup"
              ? "Create Account"
              : "Log In";
        }
      }
    }
  });
}

// Google Sign-In
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    if (isRedirecting) return;

    googleBtn.disabled = true;
    showMessage("Connecting to Google...");

    try {
      const result = await signInWithPopup(auth, googleProvider);

      showMessage(
        "Welcome to VYNTORA, " +
        (result.user.displayName || "Customer") +
        "!"
      );

      goToDashboard(result.user);

    } catch (error) {
      showMessage(friendlyError(error));
    } finally {
      googleBtn.disabled = false;
    }
  });
}

// Forgot Password
if (forgotBtn) {
  forgotBtn.addEventListener("click", async () => {
    const emailValue = email ? email.value.trim() : "";

    if (!emailValue) {
      showMessage("প্রথমে Email Address লিখুন।");
      if (email) email.focus();
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
}

// Observe authentication state
onAuthStateChanged(auth, (user) => {
  if (logoutBtn) {
    logoutBtn.hidden = !user;
  }
});

// Initial screen
setMode("login");
