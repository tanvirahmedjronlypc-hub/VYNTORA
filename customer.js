
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
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

const $ = (id) => document.getElementById(id);

// Safe text update
function setText(id, value) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}

// Show notification
function showNotice(text) {
  const message = $("dashboardMessage");

  if (message) {
    message.textContent = text;
  } else {
    console.info(text);
  }
}

// Prevent multiple logout clicks
let isLoggingOut = false;

// Check Firebase login status
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const name = user.displayName || "VYNTORA Customer";
  const email = user.email || "Email not available";

  setText("customerName", name);
  setText("profileName", name);
  setText("profileEmail", email);
  setText("avatar", name.charAt(0).toUpperCase());

  // Optional: show the Google profile picture if the HTML has an image
  const avatarImage = $("avatarImage");

  if (avatarImage && user.photoURL) {
    avatarImage.src = user.photoURL;
    avatarImage.alt = name;
    avatarImage.hidden = false;
  }

  showNotice("Welcome to your VYNTORA Dashboard!");
});

// Logout
const logoutBtn = $("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (isLoggingOut) return;

    isLoggingOut = true;
    logoutBtn.disabled = true;
    logoutBtn.textContent = "Logging out...";

    try {
      await signOut(auth);
      window.location.replace("index.html");
    } catch (error) {
      console.error("Logout error:", error);

      showNotice("Logout failed. Please try again.");

      logoutBtn.disabled = false;
      logoutBtn.textContent = "Log Out";
      isLoggingOut = false;
    }
  });
}

// Dashboard sections
const sections = {
  orders: {
    title: "My Orders",
    message: "Your orders will appear here.",
    description:
      "Order history and delivery tracking will be available after the order system is connected."
  },

  wishlist: {
    title: "My Wishlist",
    message: "Save your favourite products.",
    description:
      "Your wishlist feature will be connected when product storage is implemented."
  },

  cart: {
    title: "My Cart",
    message: "Your shopping cart is ready.",
    description:
      "Product quantities, checkout and order placement will be added with the shopping system."
  },

  profile: {
    title: "My Profile",
    message: "Your account information",
    description:
      "Your name and email are displayed from your signed-in Firebase account."
  }
};

// Handle section navigation
document.querySelectorAll("[data-section]").forEach((button) => {
  button.addEventListener("click", () => {
    const sectionName = button.dataset.section;
    const section = sections[sectionName];

    if (!section) return;

    setText("contentTitle", section.title);
    setText("contentMessage", section.message);
    setText("contentDescription", section.description);

    // Highlight selected section
    document.querySelectorAll("[data-section]").forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute(
        "aria-current",
        item === button ? "page" : "false"
      );
    });

    const contentSection = $("contentSection");

    if (contentSection) {
      contentSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// Initial section
setText("contentTitle", "My Orders");
setText("contentMessage", "Your orders will appear here.");
setText(
  "contentDescription",
  "Order history and delivery tracking will be available after the order system is connected."
);
