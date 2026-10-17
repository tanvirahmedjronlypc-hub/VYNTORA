
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

const productGrid = $("productGrid");
const searchInput = $("productSearch");
const categoryFilter = $("categoryFilter");
const shopStatus = $("shopStatus");

let allProducts = [];

function safeImageUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("vyntoraCart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("vyntoraCart", JSON.stringify(cart));
    updateCartCount();
    return true;
  } catch {
    showStatus("Cart সংরক্ষণ করা যায়নি। Browser storage পরীক্ষা করো.", true);
    return false;
  }
}

function updateCartCount() {
  const count = readCart().reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const badge = $("cartCount");
  if (badge) badge.textContent = String(count);
}

function showStatus(message, error = false) {
  if (!shopStatus) return;
  shopStatus.textContent = message;
  shopStatus.className = "shop-status show" + (error ? " error" : "");
}

function createElement(tag, className, text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function renderProducts() {
  if (!productGrid) return;

  const search = (searchInput?.value || "").trim().toLowerCase();
  const category = categoryFilter?.value || "all";

  const filtered = allProducts.filter((product) => {
    const searchable = [
      product.name,
      product.code,
      product.description,
      product.category
    ].join(" ").toLowerCase();

    const matchesSearch = searchable.includes(search);
    const matchesCategory =
      category === "all" || (product.category || "Other") === category;

    return matchesSearch && matchesCategory;
  });

  productGrid.replaceChildren();

  if (!filtered.length) {
    productGrid.append(
      createElement("p", "shop-empty", "কোনো পণ্য পাওয়া যায়নি.")
    );
    return;
  }

  filtered.forEach((product) => {
    const card = createElement("article", "shop-product-card");
    const image = document.createElement("img");

    image.src = safeImageUrl(product.imageUrl) || "";
    image.alt = product.name || "VYNTORA product";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.alt = "ছবি পাওয়া যায়নি";
    });

    const details = createElement("div", "shop-product-details");
    const code = createElement(
      "p",
      "shop-product-code",
      "Code: " + (product.code || "—")
    );
    const name = createElement(
      "h3",
      "shop-product-name",
      product.name || "Unnamed Product"
    );
    const price = createElement(
      "p",
      "shop-product-price",
      "৳" + Number(product.price || 0).toLocaleString("en-BD")
    );

    const stock = Number(product.stock || 0);
    const stockText = createElement(
      "p",
      stock > 0 ? "shop-stock" : "shop-stock out",
      stock > 0 ? `স্টকে আছে: ${stock}` : "স্টক শেষ"
    );

    const addButton = createElement(
      "button",
      "shop-add-button",
      stock > 0 ? "🛒 Add to Cart" : "Out of Stock"
    );
    addButton.type = "button";
    addButton.disabled = stock <= 0;

    addButton.addEventListener("click", () => {
      const cart = readCart();
      const existing = cart.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity >= stock) {
          showStatus("স্টকের চেয়ে বেশি পণ্য Cart-এ যোগ করা যাবে না.", true);
          return;
        }
        existing.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name || "",
          code: product.code || "",
          price: Number(product.price || 0),
          imageUrl: safeImageUrl(product.imageUrl),
          quantity: 1
        });
      }

      if (saveCart(cart)) {
        showStatus("✅ পণ্য Cart-এ যোগ হয়েছে!");
        addButton.textContent = "✓ Added";
        setTimeout(() => {
          if (addButton.isConnected) addButton.textContent = "🛒 Add to Cart";
        }, 1000);
      }
    });

    details.append(code, name, price, stockText, addButton);
    card.append(image, details);
    productGrid.append(card);
  });
}

async function loadShopProducts() {
  if (!productGrid) return;

  productGrid.replaceChildren(
    createElement("p", "shop-empty", "পণ্য লোড হচ্ছে...")
  );

  try {
    const snapshot = await getDocs(collection(db, "products"));

    allProducts = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter((product) => product.active !== false);

    if (categoryFilter) {
      const categories = [
        ...new Set(allProducts.map((p) => p.category || "Other"))
      ];

      categories.sort().forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.append(option);
      });
    }

    renderProducts();
    updateCartCount();

    if (!allProducts.length) {
      showStatus("এখনো কোনো পণ্য যোগ করা হয়নি.");
    } else {
      showStatus(`${allProducts.length}টি পণ্য লোড হয়েছে.`);
    }
  } catch (error) {
    console.error(error);
    showStatus(
      "পণ্য লোড হয়নি। Firestore Rules ও Internet সংযোগ পরীক্ষা করো.",
      true
    );
    productGrid.replaceChildren(
      createElement("p", "shop-empty", "পণ্য লোড করা যায়নি.")
    );
  }
}

searchInput?.addEventListener("input", renderProducts);
categoryFilter?.addEventListener("change", renderProducts);

$("openCartBtn")?.addEventListener("click", () => {
  window.location.href = "cart.html";
});

loadShopProducts();
