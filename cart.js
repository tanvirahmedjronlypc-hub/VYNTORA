
const CART_KEY = "vyntoraCart";

const $ = (id) => document.getElementById(id);

const cartItems = $("cartItems");
const itemCount = $("itemCount");
const subtotalElement = $("subtotal");
const totalElement = $("total");
const checkoutBtn = $("checkoutBtn");
const cartStatus = $("cartStatus");

const money = (amount) =>
  "৳" + Number(amount).toLocaleString("en-BD");

function readCart() {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(data)) return [];

    return data
      .filter((item) =>
        item &&
        typeof item.id === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0
      )
      .map((item) => ({
        ...item,
        quantity: Math.max(
          1,
          Math.min(99, Math.floor(Number(item.quantity) || 1))
        ),
        price: Number(item.price)
      }));
  } catch (error) {
    console.error("Cart read error:", error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error("Cart save error:", error);
    setStatus("Cart সংরক্ষণ করা যায়নি। Browser storage পরীক্ষা করো।");
    return false;
  }
}

function setStatus(message) {
  if (cartStatus) cartStatus.textContent = message;
}

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

function makeElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function renderCart() {
  const cart = readCart();

  cartItems.replaceChildren();

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  itemCount.textContent = String(count);
  subtotalElement.textContent = money(subtotal);
  totalElement.textContent = money(subtotal);

  checkoutBtn.disabled = cart.length === 0;

  if (!cart.length) {
    const empty = makeElement("div", "empty-state");
    const robot = makeElement("div", "empty-robot", "🤖");
    const title = makeElement("h2", "", "তোমার Cart খালি!");
    const message = makeElement(
      "p",
      "muted",
      "চলো, VYNTORA থেকে তোমার পছন্দের পণ্য খুঁজে নিই।"
    );
    const link = makeElement("a", "primary-button", "Explore Products");

    link.href = "customer.html#shopSection";
    empty.append(robot, title, message, link);
    cartItems.append(empty);
    return;
  }

  cart.forEach((item) => {
    const row = makeElement("article", "cart-item");

    const image = document.createElement("img");
    image.className = "product-image";
    image.alt = item.name || "VYNTORA product";
    image.loading = "lazy";

    const imageUrl = safeImageUrl(item.imageUrl);
    if (imageUrl) {
      image.src = imageUrl;
      image.addEventListener("error", () => {
        image.hidden = true;
      });
    } else {
      image.hidden = true;
    }

    const details = makeElement("div", "product-details");

    const name = makeElement(
      "h3",
      "product-name",
      item.name || "VYNTORA Product"
    );

    const code = makeElement(
      "p",
      "product-code",
      "Code: " + (item.code || "—")
    );

    const price = makeElement(
      "p",
      "product-price",
      money(item.price) + " × " + item.quantity
    );

    const actions = makeElement("div", "item-actions");
    const quantity = makeElement("div", "quantity");

    const minus = makeElement("button", "", "−");
    minus.type = "button";
    minus.setAttribute("aria-label", "Decrease quantity");

    const number = makeElement("span", "", String(item.quantity));

    const plus = makeElement("button", "", "+");
    plus.type = "button";
    plus.setAttribute("aria-label", "Increase quantity");

    const stock = Number(item.stock);
    const maxQuantity =
      Number.isFinite(stock) && stock > 0
        ? Math.min(99, Math.floor(stock))
        : 99;

    plus.disabled = item.quantity >= maxQuantity;

    minus.addEventListener("click", () => {
      const latest = readCart();
      const found = latest.find((p) => p.id === item.id);
      if (!found) return;

      if (found.quantity <= 1) {
        found.quantity = 1;
        setStatus("পণ্য বাদ দিতে Remove বাটন ব্যবহার করো।");
      } else {
        found.quantity -= 1;
        saveCart(latest);
        renderCart();
      }
    });

    plus.addEventListener("click", () => {
      const latest = readCart();
      const found = latest.find((p) => p.id === item.id);
      if (!found) return;

      const currentStock = Number(found.stock);
      const limit =
        Number.isFinite(currentStock) && currentStock > 0
          ? Math.min(99, Math.floor(currentStock))
          : 99;

      if (found.quantity >= limit) {
        setStatus("স্টকের সীমা অতিক্রম করা যাবে না।");
        return;
      }

      found.quantity += 1;
      if (saveCart(latest)) renderCart();
    });

    quantity.append(minus, number, plus);

    const remove = makeElement("button", "remove-button", "Remove ✕");
    remove.type = "button";

    remove.addEventListener("click", () => {
      const latest = readCart().filter((p) => p.id !== item.id);
      if (saveCart(latest)) {
        setStatus("পণ্য Cart থেকে সরানো হয়েছে।");
        renderCart();
      }
    });

    actions.append(quantity, remove);
    details.append(name, code, price, actions);
    row.append(image, details);
    cartItems.append(row);
  });
}

checkoutBtn.addEventListener("click", () => {
  const cart = readCart();

  if (!cart.length) {
    setStatus("Checkout করার আগে Cart-এ পণ্য যোগ করো।");
    return;
  }

  // Checkout page will be added in the next step.
  window.location.href = "checkout.html";
});

window.addEventListener("storage", (event) => {
  if (event.key === CART_KEY) renderCart();
});

renderCart();
