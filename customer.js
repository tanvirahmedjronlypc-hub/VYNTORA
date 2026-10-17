
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgbfQu5XPBQNVHMKFAjfvK5KSTy3VFdEY",
  authDomain: "vyntora-gen-z.firebaseapp.com",
  projectId: "vyntora-gen-z",
  storageBucket: "vyntora-gen-z.firebasestorage.app",
  messagingSenderId: "1091859566524",
  appId: "1:109185956652:web:39e57e38ee5defb28ee5b9",
  measurementId: "G-1EPNG6CHF1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const $ = (id) => document.getElementById(id);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const name = user.displayName || "VYNTORA Customer";

  $("customerName").textContent = name;
  $("profileName").textContent = name;
  $("profileEmail").textContent = user.email || "Email not available";
  $("avatar").textContent = name.charAt(0).toUpperCase();
});

$("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.replace("index.html");
  } catch (error) {
    alert("Logout failed. Please try again.");
    console.error(error);
  }
});

const sections = {
  orders: {
    title: "My Orders",
    message: "Your orders will appear here.",
    description: "Order history and delivery tracking will be connected in a later step."
  },
  wishlist: {
    title: "My Wishlist",
    message: "Save your favourite products.",
    description: "Wishlist storage will be connected when the product system is added."
  },
  cart: {
    title: "My Cart",
    message: "Your shopping cart is ready to build.",
    description: "Cart items and checkout will be added in the next shopping features."
  },
  profile: {
    title: "My Profile",
    message: "Your account information",
    description: "Name and email are shown from your signed-in Firebase account."
  }
};

document.querySelectorAll("[data-section]").forEach((button) => {
  button.addEventListener("click", () => {
    const section = sections[button.dataset.section];

    $("contentTitle").textContent = section.title;
    $("contentMessage").textContent = section.message;
    $("contentDescription").textContent = section.description;

    $("contentSection").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});
