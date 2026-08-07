/* ==========================================================================
   STRIDE. Wishlist.js
   Same localStorage-array pattern as cart.js, just simpler: a flat list
   of product ids. Any heart button anywhere in the site works off this.
   ========================================================================== */

const WISHLIST_KEY = "stride-wishlist";

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
  catch { return []; }
}
function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  document.querySelectorAll("[data-wishlist-badge]").forEach((el) => {
    el.textContent = list.length;
    el.classList.toggle("is-visible", list.length > 0);
  });
}
function isWishlisted(id) {
  return getWishlist().includes(id);
}
function toggleWishlist(id) {
  let list = getWishlist();
  const on = list.includes(id);
  list = on ? list.filter((x) => x !== id) : [...list, id];
  saveWishlist(list);
  return !on;
}

function syncWishlistButtons() {
  document.querySelectorAll("[data-wish-btn]").forEach((btn) => {
    const on = isWishlisted(btn.dataset.wishBtn);
    btn.classList.toggle("is-active", on);
    const icon = btn.querySelector("i");
    if (icon) icon.className = on ? "fa-solid fa-heart" : "fa-regular fa-heart";
  });
}

/* ---- the fly-to-wishlist micro-interaction ----
   Same idea as flyToCart (see cart.js): a small heart clone flies from
   the button that was clicked to the wishlist icon in the header, then
   the header icon itself gives a little pop so the eye has somewhere
   to land. */
function flyToWishlist(sourceEl) {
  const target = document.querySelector("[data-wishlist-open]");
  if (!sourceEl || !target) return;
  const startRect = sourceEl.getBoundingClientRect();
  const endRect = target.getBoundingClientRect();

  const clone = document.createElement("i");
  clone.className = "fa-solid fa-heart fly-heart-clone";
  clone.style.left = startRect.left + startRect.width / 2 - 9 + "px";
  clone.style.top = startRect.top + startRect.height / 2 - 9 + "px";
  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.left = endRect.left + endRect.width / 2 - 9 + "px";
    clone.style.top = endRect.top + endRect.height / 2 - 9 + "px";
    clone.style.transform = "scale(.3) rotate(18deg)";
    clone.style.opacity = "0.15";
  });
  setTimeout(() => clone.remove(), 650);

  target.classList.add("wish-bump");
  setTimeout(() => target.classList.remove("wish-bump"), 450);
}

document.addEventListener("DOMContentLoaded", () => {
  saveWishlist(getWishlist()); // just to paint the badge on load
  syncWishlistButtons();

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-wish-btn]");
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.wishBtn;
    const nowOn = toggleWishlist(id);
    syncWishlistButtons();
    btn.classList.add("heart-pop");
    setTimeout(() => btn.classList.remove("heart-pop"), 450);
    if (nowOn) flyToWishlist(btn);
    const p = findProduct(id);
    if (p) toast(nowOn ? `Added ${p.name} to wishlist` : `Removed ${p.name} from wishlist`);
  });
});
