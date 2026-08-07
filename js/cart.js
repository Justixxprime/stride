/* ==========================================================================
   STRIDE. Cart.js
   The cart lives in localStorage as a flat array of line items, each one
   keyed by product + size + color so "Rider FV, size 9, Sunset" and
   "Rider FV, size 10, Ink" are two separate lines. Every page that
   touches the cart (nav badge, drawer, cart.html, checkout.html) reads
   and writes through the same six functions below, so there's exactly
   one source of truth.
   ========================================================================== */

const CART_KEY = "stride-cart";

function lineId(productId, size, color) {
  return `${productId}__${size}__${color}`;
}

function lineDescriptor(line) {
  return line.size ? `Size ${line.size} &middot; ${line.color}` : "Digital gift card";
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, size, color, qty = 1) {
  const cart = getCart();
  const id = lineId(productId, size, color);
  const existing = cart.find((l) => l.lineId === id);
  if (existing) existing.qty += qty;
  else cart.push({ lineId: id, productId, size, color, qty });
  saveCart(cart);
  renderCartDrawer();
}

function removeFromCart(id) {
  saveCart(getCart().filter((l) => l.lineId !== id));
  renderCartDrawer();
}

function setQty(id, qty) {
  const cart = getCart();
  const line = cart.find((l) => l.lineId === id);
  if (!line) return;
  if (qty <= 0) return removeFromCart(id);
  line.qty = qty;
  saveCart(cart);
  renderCartDrawer();
}

function cartCount() {
  return getCart().reduce((sum, l) => sum + l.qty, 0);
}

function cartSubtotal() {
  return getCart().reduce((sum, l) => {
    const p = findProduct(l.productId);
    return p ? sum + p.price * l.qty : sum;
  }, 0);
}

/* ---- badge (nav cart icon) ---- */
function updateCartBadge() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-badge]").forEach((el) => {
    el.textContent = count;
    el.classList.toggle("is-visible", count > 0);
    el.classList.add("pop");
    setTimeout(() => el.classList.remove("pop"), 400);
    const icon = el.closest("[data-cart-open]")?.querySelector("i");
    if (icon) {
      icon.classList.add("icon-shake");
      setTimeout(() => icon.classList.remove("icon-shake"), 400);
    }
  });
}

/* ---- drawer markup ---- */
function cartLineHTML(line) {
  const p = findProduct(line.productId);
  if (!p) return "";
  return `
    <div class="flex gap-4 py-4 border-b border-line" data-line="${line.lineId}">
      <div class="thumb-art tile w-20 h-20 shrink-0" style="background:${p.gradient}">
        ${p.image ? smartImgTag(p.image, p.name, 'loading="lazy"') : '<i class="fa-solid fa-gift thumb-fallback-icon"></i>'}
        <i class="fa-solid fa-shoe-prints thumb-fallback-icon"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-semibold leading-snug">${p.name}</p>
          <button class="cart-remove text-ink-soft hover:text-flame shrink-0" data-id="${line.lineId}" aria-label="Remove"><i class="fa-regular fa-trash-can text-xs"></i></button>
        </div>
        <p class="font-mono text-[11px] text-ink-soft mt-1">${lineDescriptor(line)}</p>
        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center gap-3 border border-line rounded-full px-2 py-1">
            <button class="cart-dec w-5 h-5 flex items-center justify-center" data-id="${line.lineId}" aria-label="Decrease quantity"><i class="fa-solid fa-minus text-[9px]"></i></button>
            <span class="font-mono text-xs w-4 text-center">${line.qty}</span>
            <button class="cart-inc w-5 h-5 flex items-center justify-center" data-id="${line.lineId}" aria-label="Increase quantity"><i class="fa-solid fa-plus text-[9px]"></i></button>
          </div>
          <span class="font-mono text-sm font-bold">${formatPrice(p.price * line.qty)}</span>
        </div>
      </div>
    </div>`;
}

function renderCartDrawer() {
  const body = document.getElementById("cart-drawer-body");
  const footer = document.getElementById("cart-drawer-footer");
  if (!body) return;
  const cart = getCart();
  if (!cart.length) {
    body.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center h-full py-16">
        <i class="fa-solid fa-bag-shopping text-3xl text-line mb-4"></i>
        <p class="font-display text-lg">Bag is empty</p>
        <p class="text-sm text-ink-soft mt-1 max-w-[220px]">Whatever you add to your bag shows up right here.</p>
        <a href="shop.html" class="btn btn-ink mt-5">Start shopping</a>
      </div>`;
    if (footer) footer.classList.add("hidden");
    return;
  }
  body.innerHTML = cart.map(cartLineHTML).join("");
  if (footer) {
    footer.classList.remove("hidden");
    const subtotalEl = footer.querySelector("[data-cart-subtotal]");
    if (subtotalEl) subtotalEl.textContent = formatPrice(cartSubtotal());
  }
}

/* ---- the fly-to-cart micro-interaction ----
   Clones the clicked product's thumbnail, positions the clone exactly on
   top of the real thumbnail, then animates it (via a CSS transition on
   transform/opacity/border-radius) to land on the cart icon and shrink
   to nothing. Purely visual. The actual addToCart() call happens
   immediately, this just gives the eye something satisfying to follow.
--------------------------------------------------------------------- */
function flyToCart(sourceEl) {
  const cartIcon = document.querySelector("[data-cart-open]");
  if (!sourceEl || !cartIcon) return;
  const startRect = sourceEl.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();

  const clone = document.createElement("div");
  clone.className = "fly-clone";
  const bg = getComputedStyle(sourceEl).backgroundImage;
  clone.style.backgroundImage = bg && bg !== "none" ? bg : "linear-gradient(135deg,#333,#111)";
  clone.style.backgroundSize = "cover";
  clone.style.left = startRect.left + "px";
  clone.style.top = startRect.top + "px";
  clone.style.width = startRect.width + "px";
  clone.style.height = startRect.height + "px";
  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.left = endRect.left + endRect.width / 2 - 10 + "px";
    clone.style.top = endRect.top + endRect.height / 2 - 10 + "px";
    clone.style.width = "20px";
    clone.style.height = "20px";
    clone.style.opacity = "0.2";
    clone.style.borderRadius = "999px";
  });

  setTimeout(() => clone.remove(), 750);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCartDrawer();

  document.getElementById("cart-drawer-body")?.addEventListener("click", (e) => {
    const dec = e.target.closest(".cart-dec");
    const inc = e.target.closest(".cart-inc");
    const rem = e.target.closest(".cart-remove");
    if (dec) {
      const cart = getCart();
      const line = cart.find((l) => l.lineId === dec.dataset.id);
      if (line) setQty(line.lineId, line.qty - 1);
    } else if (inc) {
      const cart = getCart();
      const line = cart.find((l) => l.lineId === inc.dataset.id);
      if (line) setQty(line.lineId, line.qty + 1);
    } else if (rem) {
      const cart = getCart();
      const removed = cart.find((l) => l.lineId === rem.dataset.id);
      removeFromCart(rem.dataset.id);
      if (removed) toast(`Removed ${findProduct(removed.productId)?.name || "item"}`, {
        label: "Undo",
        onUndo: () => { addToCart(removed.productId, removed.size, removed.color, removed.qty); },
      });
    }
  });
});
