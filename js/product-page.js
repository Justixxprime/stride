/* ==========================================================================
   STRIDE. Product-page.js
   ========================================================================== */

function getProductIdFromURL() {
  return new URLSearchParams(window.location.search).get("id") || PRODUCTS[0].id;
}

let selectedSize = null;
let selectedColor = null;
let galleryImages = [];
let galleryIndex = 0;

/* ---------------------------------------------------------------------
   GALLERY. Up to 4 real photos per product: basePath, basePath-2,
   basePath-3, basePath-4 (any extension. See smartImgTag in site.js).
   A slot that doesn't have a real alt shot yet falls back to a
   filtered copy of the main photo, so the gallery always looks
   complete even before every angle has been shot.
--------------------------------------------------------------------- */
function buildGalleryImages(p) {
  return [
    { base: p.image },
    { base: `${p.image}-2`, fallback: p.image, filter: "brightness(1.15) saturate(.85)" },
    { base: `${p.image}-3`, fallback: p.image, filter: "hue-rotate(15deg)" },
    { base: `${p.image}-4`, fallback: p.image, filter: "sepia(.18) saturate(1.05)" },
  ];
}

function renderGallery(p) {
  galleryImages = buildGalleryImages(p);
  galleryIndex = 0;
  const n = galleryImages.length;

  document.getElementById("gallery-main").style.background = p.gradient;
  const track = document.getElementById("gallery-track");
  track.style.width = n * 100 + "%";
  track.innerHTML = galleryImages
    .map(
      (slot) => `
    <div class="shrink-0 h-full relative thumb-art" style="width:${100 / n}%; background:${p.gradient}">
      ${smartImgTag(slot.base, p.name, 'class="absolute inset-0 w-full h-full object-cover"', slot.fallback, slot.filter)}
    </div>`
    )
    .join("");

  document.getElementById("gallery-dots").innerHTML = galleryImages
    .map((_, i) => `<button type="button" class="gallery-dot ${i === 0 ? "is-active" : ""}" data-goto="${i}" aria-label="Photo ${i + 1}"></button>`)
    .join("");

  document.getElementById("gallery-thumbs").innerHTML = galleryImages
    .map(
      (slot, i) => `
    <button type="button" class="gallery-thumb tile aspect-square relative overflow-hidden thumb-art ${i === 0 ? "is-active" : ""}" data-goto="${i}" style="background:${p.gradient}" aria-label="Show photo ${i + 1}">
      ${smartImgTag(slot.base, `${p.name} view ${i + 1}`, 'class="absolute inset-0 w-full h-full object-cover"', slot.fallback, slot.filter)}
    </button>`
    )
    .join("");

  goToSlide(0, false);
}

function goToSlide(i, animate = true) {
  const n = galleryImages.length;
  galleryIndex = (i + n) % n;
  const track = document.getElementById("gallery-track");
  track.style.transition = animate ? "transform .35s cubic-bezier(.2,.8,.2,1)" : "none";
  track.style.transform = `translateX(-${galleryIndex * (100 / n)}%)`;
  document.querySelectorAll(".gallery-dot").forEach((d, i2) => d.classList.toggle("is-active", i2 === galleryIndex));
  document.querySelectorAll(".gallery-thumb").forEach((t, i2) => t.classList.toggle("is-active", i2 === galleryIndex));
}

function initGalleryInteractions() {
  const main = document.getElementById("gallery-main");
  if (!main || main.dataset.wired) return;
  main.dataset.wired = "1";

  document.getElementById("gallery-prev")?.addEventListener("click", (e) => { e.stopPropagation(); goToSlide(galleryIndex - 1); });
  document.getElementById("gallery-next")?.addEventListener("click", (e) => { e.stopPropagation(); goToSlide(galleryIndex + 1); });

  document.getElementById("gallery-dots").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-goto]");
    if (btn) goToSlide(Number(btn.dataset.goto));
  });
  document.getElementById("gallery-thumbs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-goto]");
    if (btn) goToSlide(Number(btn.dataset.goto));
  });

  main.addEventListener("click", (e) => {
    if (e.target.closest("#gallery-prev, #gallery-next, #gallery-dots")) return;
    const p = findProduct(getProductIdFromURL());
    if (p) openLightbox(p.gradient, galleryImages, galleryIndex);
  });

  // swipe to change photo on touch devices
  let startX = 0, startY = 0, dragging = false;
  main.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY; dragging = true;
  }, { passive: true });
  main.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
  }, { passive: false });
  main.addEventListener("touchend", (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goToSlide(galleryIndex + (dx < 0 ? 1 : -1));
  });
}

function renderProductPage() {
  const p = findProduct(getProductIdFromURL());
  if (!p) return;

  document.title = `${p.name} | Stride`;
  document.getElementById("crumb-name").textContent = p.name;

  const motionVideo = document.getElementById("product-motion-video");
  const motionPoster = document.getElementById("product-motion-poster");
  if (motionPoster) motionPoster.outerHTML = smartImgTag(p.image, p.name, 'id="product-motion-poster" class="absolute inset-0 w-full h-full object-cover"');
  if (motionVideo) {
    motionVideo.dataset.srcBase = `videos/product-${p.id}`;
    if (window.initSmartVideos) initSmartVideos();
  }

  // stock urgency. Deterministic "randomness" seeded from the product id so it
  // doesn't reshuffle every time you revisit the same page
  const seed = p.id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const stockLeft = 3 + (seed % 15);
  const stockEl = document.getElementById("stock-note");
  if (stockEl) {
    if (stockLeft <= 6) { stockEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-flame mr-1"></i>Only ${stockLeft} left across all sizes`; stockEl.classList.add("text-flame"); }
    else { stockEl.textContent = ""; }
  }
  const viewerEl = document.getElementById("viewer-count");
  if (viewerEl) viewerEl.textContent = 3 + (seed % 12);

  injectProductSchema(p);
  document.getElementById("product-name").textContent = p.name;
  document.getElementById("product-category").textContent = p.category;
  document.getElementById("product-desc").textContent = p.description;
  document.getElementById("product-rating-count").textContent = `${p.rating} (${p.reviews} reviews)`;
  document.querySelector("#product-stars").innerHTML = starIcons(p.rating);

  const priceWrap = document.getElementById("product-price");
  priceWrap.innerHTML = p.compareAt
    ? `<span class="font-mono text-2xl font-bold text-flame">${formatPrice(p.price)}</span> <span class="font-mono text-base text-ink-soft line-through ml-2">${formatPrice(p.compareAt)}</span>`
    : `<span class="font-mono text-2xl font-bold">${formatPrice(p.price)}</span>`;

  // gallery: real photos when they exist (basePath, basePath-2, -3, -4),
  // gracefully falling back to a filtered copy of the main shot for any
  // slot that isn't there yet. See renderGallery() below.
  renderGallery(p);

  selectedColor = p.colors[0].name;
  document.getElementById("color-swatches").innerHTML = p.colors
    .map((c) => `<button type="button" class="swatch ${c.name === selectedColor ? "is-active" : ""}" data-color="${c.name}" style="background:${c.hex}" title="${c.name}"></button>`)
    .join("");
  document.getElementById("selected-color-label").textContent = selectedColor;

  selectedSize = p.sizes.find((s) => !p.outOfStock.includes(s));
  document.getElementById("size-chips").innerHTML = p.sizes
    .map((s) => {
      const oos = p.outOfStock.includes(s);
      return `<button type="button" class="size-chip ${s === selectedSize ? "is-active" : ""} ${oos ? "is-disabled" : ""}" data-size="${s}" ${oos ? "disabled" : ""}>${s}</button>`;
    })
    .join("");

  document.getElementById("wish-btn-detail").dataset.wishBtn = p.id;
  syncWishlistButtons();

  document.getElementById("add-to-cart-btn").dataset.productId = p.id;

  // related products: same category, excluding this one
  const related = PRODUCTS.filter((r) => r.category === p.category && r.id !== p.id).slice(0, 4);
  document.getElementById("related-grid").innerHTML = related.map(productCardHTML).join("");
  initScrollReveal();
  initQuickAdd(document.getElementById("related-grid"));

  wireSwatchAndSizeClicks();
}

function starIcons(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => `<i class="fa-solid fa-star ${i < full ? "text-ink" : "text-line"} text-xs"></i>`).join("");
}

/** Adds a JSON-LD <script> tag describing the product, invisible to
 * visitors but readable by search engines and anyone who checks "view
 * source". A small, real detail that separates a demo from a site
 * that was actually built to be found. */
function injectProductSchema(p) {
  document.getElementById("product-schema")?.remove();
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.name,
    description: p.description,
    category: p.category,
    offers: {
      "@type": "Offer",
      price: p.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviews,
    },
  };
  const script = document.createElement("script");
  script.id = "product-schema";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function wireSwatchAndSizeClicks() {
  document.getElementById("color-swatches").addEventListener("click", (e) => {
    const btn = e.target.closest(".swatch");
    if (!btn) return;
    selectedColor = btn.dataset.color;
    document.getElementById("color-swatches").querySelectorAll(".swatch").forEach((s) => s.classList.toggle("is-active", s === btn));
    document.getElementById("selected-color-label").textContent = selectedColor;
  });
  document.getElementById("size-chips").addEventListener("click", (e) => {
    const btn = e.target.closest(".size-chip:not(.is-disabled)");
    if (!btn) return;
    selectedSize = Number(btn.dataset.size);
    document.getElementById("size-chips").querySelectorAll(".size-chip").forEach((s) => s.classList.toggle("is-active", s === btn));
  });
}

function initTabs() {
  const tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active", "border-ink", "text-ink");
        t.classList.add("text-ink-soft", "border-transparent");
      });
      tab.classList.add("is-active", "border-ink", "text-ink");
      tab.classList.remove("text-ink-soft", "border-transparent");
      document.querySelectorAll("[data-tab-panel]").forEach((p) => p.classList.add("hidden"));
      document.querySelector(`[data-tab-panel="${tab.dataset.tab}"]`)?.classList.remove("hidden");
    });
  });
}

function initQtyStepper() {
  const input = document.getElementById("qty-input");
  document.getElementById("qty-dec")?.addEventListener("click", () => (input.value = Math.max(1, Number(input.value) - 1)));
  document.getElementById("qty-inc")?.addEventListener("click", () => (input.value = Number(input.value) + 1));
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getProductIdFromURL();
  renderProductPage();
  initTabs();
  initQtyStepper();
  initGalleryInteractions();
  trackRecentlyViewed(id);
  renderRecentlyViewed(document.getElementById("recently-viewed-grid"), document.getElementById("recently-viewed-section"), id);

  document.getElementById("add-to-cart-btn")?.addEventListener("click", (e) => {
    const pid = e.currentTarget.dataset.productId;
    const qty = Number(document.getElementById("qty-input").value) || 1;
    const mainThumb = document.getElementById("gallery-main");
    if (mainThumb) flyToCart(mainThumb);
    addToCart(pid, selectedSize, selectedColor, qty);
    toast(`${findProduct(pid)?.name} added to bag`);
    openDrawer("cart-drawer");
  });

  document.getElementById("share-btn")?.addEventListener("click", async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: document.title, url });
      else { await navigator.clipboard.writeText(url); toast("Link copied to clipboard"); }
    } catch (err) {
      if (err.name !== "AbortError") toast("Couldn't copy the link");
    }
  });
});
