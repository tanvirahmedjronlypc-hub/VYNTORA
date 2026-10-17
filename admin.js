
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgbfQu5XPBQNVHMKFAjfvK5KSTy3VFdEY",
  authDomain: "vyntora-gen-z.firebaseapp.com",
  projectId: "vyntora-gen-z",
  storageBucket: "vyntora-gen-z.firebasestorage.app",
  messagingSenderId: "1091859566524",
  appId: "1:1091859566524:web:39e57e38ee5defb28ee5b9",
  measurementId: "G-1EPNG6CHF1"
};

const ADMIN_UID = "ecLFGmZkmUWTaV4lvqw7vzcTXd32";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

const form = $("productForm");
const addBtn = $("addProductBtn");
const productList = $("productList");
const statusMessage = $("statusMessage");

let currentAdmin = null;

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status show " + type;
}

function showError(error) {
  console.error(error);

  const messages = {
    "permission-denied":
      "Permission denied: Firestore Rules ও Admin UID পরীক্ষা করো.",
    "unauthenticated":
      "তোমার Login session নেই। আবার Login করো.",
    "unavailable":
      "ইন্টারনেট বা Firebase সার্ভারে সমস্যা। আবার চেষ্টা করো."
  };

  showStatus(
    messages[error.code] ||
    "সমস্যা হয়েছে: " + (error.message || "Unknown error"),
    "error"
  );
}

function makeElement(tag, className, text = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

function validImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  if (user.uid !== ADMIN_UID) {
    showStatus(
      "এই Account-এর Admin access নেই। Admin Account দিয়ে Login করো.",
      "error"
    );
    setTimeout(() => signOut(auth), 1800);
    return;
  }

  currentAdmin = user;
  await loadProducts();
});

$("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.replace("index.html");
  } catch (error) {
    showError(error);
  }
});

$("refreshBtn").addEventListener("click", loadProducts);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentAdmin || currentAdmin.uid !== ADMIN_UID) {
    showStatus("Admin Login প্রয়োজন.", "error");
    return;
  }

  const name = $("productName").value.trim();
  const code = $("productCode").value.trim();
  const price = Number($("productPrice").value);
  const stock = Number($("productStock").value);
  const imageUrl = $("productImage").value.trim();
  const description = $("productDescription").value.trim();

  if (!name || !code || !imageUrl) {
    showStatus("সব প্রয়োজনীয় তথ্য পূরণ করো.", "error");
    return;
  }

  if (!validImageUrl(imageUrl)) {
    showStatus("সঠিক HTTP/HTTPS Image URL দাও.", "error");
    return;
  }

  if (!Number.isFinite(price) || price < 1 ||
      !Number.isInteger(stock) || stock < 0) {
    showStatus("দাম ও Stock সঠিকভাবে লেখো.", "error");
    return;
  }

  addBtn.disabled = true;
  showStatus("পণ্য যোগ হচ্ছে...");

  try {
    await addDoc(collection(db, "products"), {
      name,
      code,
      price,
      stock,
      imageUrl,
      description,
      active: true,
      createdAt: serverTimestamp(),
      createdBy: currentAdmin.uid
    });

    form.reset();
    showStatus("🎉 পণ্য সফলভাবে যোগ হয়েছে!", "success");
    await loadProducts();
  } catch (error) {
    showError(error);
  } finally {
    addBtn.disabled = false;
  }
});

async function loadProducts() {
  if (!currentAdmin || currentAdmin.uid !== ADMIN_UID) return;

  productList.replaceChildren(
    makeElement("p", "muted", "পণ্য লোড হচ্ছে...")
  );

  try {
    const snapshot = await getDocs(collection(db, "products"));

    $("productCount").textContent = snapshot.size;

    productList.replaceChildren();

    if (snapshot.empty) {
      productList.append(
        makeElement("p", "muted", "এখনো কোনো পণ্য যোগ করা হয়নি.")
      );
      return;
    }

    snapshot.forEach((productDoc) => {
      const product = productDoc.data();
      const card = makeElement("article", "product-card");

      const image = document.createElement("img");
      image.src = validImageUrl(product.imageUrl || "")
        ? product.imageUrl
        : "";
      image.alt = product.name || "Product image";
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      image.addEventListener("error", () => {
        image.alt = "ছবি লোড হয়নি";
        image.removeAttribute("src");
      });

      const name = makeElement("h3", "", product.name || "Unnamed Product");
      const code = makeElement("p", "product-meta", "Code: " + (product.code || "—"));
      const price = makeElement(
        "p",
        "product-price",
        "৳" + (Number(product.price) || 0).toLocaleString("en-BD")
      );
      const stock = makeElement(
        "p",
        "product-meta",
        "Stock: " + (Number(product.stock) || 0)
      );
      const description = makeElement(
        "p",
        "product-meta",
        product.description || "No description"
      );
      const deleteBtn = makeElement("button", "delete-btn", "🗑️ Delete Product");
      deleteBtn.type = "button";

      deleteBtn.addEventListener("click", async () => {
        if (!currentAdmin || currentAdmin.uid !== ADMIN_UID) return;

        const confirmed = window.confirm(
          `“${product.name || "এই পণ্য"}” মুছে ফেলবে?`
        );
        if (!confirmed) return;

        deleteBtn.disabled = true;

        try {
          await deleteDoc(doc(db, "products", productDoc.id));
          showStatus("পণ্য মুছে ফেলা হয়েছে.", "success");
          await loadProducts();
        } catch (error) {
          deleteBtn.disabled = false;
          showError(error);
        }
      });

      card.append(image, name, code, price, stock, description, deleteBtn);
      productList.append(card);
    });
  } catch (error) {
    productList.replaceChildren();
    showError(error);
  }
}
