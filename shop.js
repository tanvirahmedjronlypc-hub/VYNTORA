
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

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

// Reuse Firebase app if customer.js has already initialized it.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
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
    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function readCart() {
  try {
    const cart = JSON.parse(
      localStorage.getItem("vyntoraCart") || "[]"
    );

    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function showStatus(message, error = false) {
  if (!shopStatus) return;

  shopStatus.textContent = message;
  shopStatus.className =
    "shop-status show" + (error ? " error" : "");
}

function updateCartCount() {
  const count = readCart().reduce(
    (total, item) =>
      total + Math.max(0, Number(item.quantity) || 0),
    0
  );

  const badge = $("cartCount");
  if (badge) badge.textContent = String(count);
}

function saveCart(cart) {
  try {
    localStorage.setItem("vyntoraCart", JSON.stringify(cart));
    updateCartCount();
    return true;
  } catch (error) {
    console.error(error);
    showStatus(
      "Cart সংরক্ষণ করা যায়নি। Browser storage পরীক্ষা করো।",
      true
    );
    return false;
  }
}

function createElement(tag, className, text = "") {
  const element = document.createElement(tag);

  if (className) element.className = className;
  element.textContent = text;

  return element;
}

function renderProducts() {
  if (!productGrid) return;

  const search = (searchInput?.value || "")
    .trim()
    .toLowerCase();

  const category = categoryFilter?.value || "all";

  const filtered = allProducts.filter((product) => {
    const searchable = [
      product.name,
      product.code,
      product.description,
      product.category
    ].join(" ").toLowerCase();

    const productCategory = product.category || "Other";

    return (
      searchable.includes(search) &&
      (category === "all" || productCategory === category)
    );
  });

  productGrid.replaceChildren();

  if (!filtered.length) {
    productGrid.append(
      createElement(
        "p",
        "shop-empty",
        "কোনো পণ্য পাওয়া যায়নি। অন্য নামে খুঁজে দেখো।"
      )
    );
    return;
  }

  filtered.forEach((product, index) => {
    const card = createElement("article", "shop-product-card");
    card.style.animationDelay = `${Math.min(index * 50, 300)}ms`;

    const image = document.createElement("img");
    const imageUrl = safeImageUrl(product.imageUrl);

    image.className = "shop-product-image";
    image.alt = product.name || "VYNTORA product";
    image.loading = "lazy";

    if (imageUrl) {
      image.src = imageUrl;
    } else {
      image.hidden = true;
      card.append(
        createElement("p", "shop-empty", "🛍️ ছবি দেওয়া হয়নি")
      );
    }

    image.addEventListener("error", () => {
      image.hidden = true;
      if (!card.querySelector(".image-fallback")) {
        const fallback = createElement(
          "p",
          "shop-empty image-fallback",
          "🖼️ ছবি পাওয়া যায়নি"
        );
        image.insertAdjacentElement("afterend", fallback);
      }
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
      product.name || "VYNTORA Product"
    );

    const priceValue = Number(product.price);
    const validPrice = Number.isFinite(priceValue) && priceValue >= 0;

    const price = createElement(
      "p",
      "shop-product-price",
      validPrice
        ? "৳" + priceValue.toLocaleString("en-BD")
        : "দাম জানতে যোগাযোগ করুন"
    );

    const description = createElement(
      "p",
      "shop-product-description",
      product.description || ""
    );

    const stock = Number(product.stock);
    const validStock = Number.isFinite(stock) && stock > 0;

    const stockText = createElement(
      "p",
      validStock ? "shop-stock" : "shop-stock out",
      validStock ? `স্টকে আছে: ${stock}` : "স্টক শেষ"
    );

    const addButton = createElement(
      "button",
      "shop-add-button",
      validStock ? "🛒 Add to Cart" : "Out of Stock"
    );

    addButton.type = "button";
    addButton.disabled = !validStock || !validPrice;

    addButton.addEventListener("click", () => {
      const cart = readCart();

      const existing = cart.find(
        (item) => item.id === product.id
      );

      const currentQuantity = existing
        ? Math.max(0, Number(existing.quantity) || 0)
        : 0;

      if (currentQuantity >= stock) {
        showStatus(
          "দুঃখিত! এই পণ্যের যত স্টক আছে, ততটুকুই Cart-এ যোগ করা যাবে।",
          true
        );
        return;
      }

      if (existing) {
        existing.quantity = currentQuantity + 1;
        existing.price = priceValue;
        existing.stock = stock;
      } else {
        cart.push({
          id: product.id,
          name: product.name || "",
          code: product.code || "",
          price: priceValue,
          imageUrl,
          stock,
          quantity: 1
        });
      }

      if (saveCart(cart)) {
        showStatus("✅ পণ্য Cart-এ যোগ হয়েছে!");
        addButton.textContent = "✓ Added";

        setTimeout(() => {
          if (addButton.isConnected) {
            addButton.textContent = "🛒 Add to Cart";
          }
        }, 1200);
      }
    });

    details.append(code, name, price, description, stockText, addButton);
    card.append(image, details);
    productGrid.append(card);
  });
}

function updateCategories() {
  if (!categoryFilter) return;

  const selected = categoryFilter.value || "all";
  const categories = [
    ...new Set(
      allProducts.map((product) => product.category || "Other")
    )
  ].sort();

  categoryFilter.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "সব পণ্য";
  categoryFilter.append(allOption);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });

  categoryFilter.value = categories.includes(selected)
    ? selected
    : "all";
}

async function loadShopProducts() {
  if (!productGrid) {
    console.error("productGrid element not found in customer.html");
    return;
  }

  productGrid.replaceChildren(
    createElement("p", "shop-empty", "🤖 পণ্য লোড হচ্ছে...")
  );

  showStatus("Firebase থেকে পণ্য আনা হচ্ছে...");

  try {
    const snapshot = await getDocs(collection(db, "products"));

    allProducts = snapshot.docs
      .map((item) => ({
        id: item.id,
        ...item.data()
      }))
      .filter((product) => product.active !== false);

    updateCategories();
    renderProducts();
    updateCartCount();

    showStatus(
      allProducts.length
        ? `✅ ${allProducts.length}টি পণ্য লোড হয়েছে।`
        : "এখনো কোনো পণ্য যোগ করা হয়নি। Admin Panel থেকে পণ্য যোগ করো।"
    );
  } catch (error) {
    console.error("VYNTORA shop error:", error);

    showStatus(
      "পণ্য লোড হয়নি। Internet, Firebase Config এবং Firestore Rules পরীক্ষা করো।",
      true
    );

    productGrid.replaceChildren(
      createElement(
        "p",
        "shop-empty",
        "পণ্য লোড করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করো।"
      )
    );
  }
}

searchInput?.addEventListener("input", renderProducts);
categoryFilter?.addEventListener("change", renderProducts);

$("openCartBtn")?.addEventListener("click", () => {
  window.location.href = "cart.html";
});

updateCartCount();
loadShopProducts();
