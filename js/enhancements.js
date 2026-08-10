/* ==========================================================================
   STRIDE. Enhancements.js
   Four small features that all lean on the same "inject markup once, then
   reuse it" pattern already used by the command palette and detail panel
   elsewhere in this portfolio:
     1. Quick View. A modal so you can pick a size/color and add to bag
        without leaving the grid you're browsing.
     2. Recently Viewed. A localStorage list of product ids, rendered as
        a row wherever `renderRecentlyViewed()` is called.
     3. Size Guide. A static modal with a measurements table.
     4. Lightbox. A full-screen zoom for the product gallery image.
   ========================================================================== */

/* ---------------------------------------------------------------------
   Generic modal open/close (shared by Quick View and Size Guide)
--------------------------------------------------------------------- */
function openModal(id, triggerEl) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.open = "true";
  document.body.style.overflow = "hidden";
  el._release = trapFocus(el, triggerEl || document.activeElement);
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.open = "false";
  document.body.style.overflow = "";
  if (el._release) { el._release(); el._release = null; }
}

/* ---------------------------------------------------------------------
   RECENTLY VIEWED
--------------------------------------------------------------------- */
const RECENTLY_VIEWED_KEY = "stride-recently-viewed";

function trackRecentlyViewed(productId) {
  let ids = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
  ids = [productId, ...ids.filter((id) => id !== productId)].slice(0, 8);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
}

/** Renders into `containerEl`, skipping `excludeId` (usually the product
 * you're currently looking at). Hides the whole section if there's
 * nothing to show yet. */
function renderRecentlyViewed(containerEl, sectionEl, excludeId) {
  const ids = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]").filter((id) => id !== excludeId);
  const products = ids.map((id) => findProduct(id)).filter(Boolean).slice(0, 4);
  if (!products.length) { sectionEl.classList.add("hidden"); return; }
  sectionEl.classList.remove("hidden");
  containerEl.innerHTML = products.map(productCardHTML).join("");
  initScrollReveal();
  initQuickAdd(containerEl);
}

/* ---------------------------------------------------------------------
   QUICK VIEW. Injected once, reused for every product
--------------------------------------------------------------------- */
let qvSelectedSize = null;
let qvSelectedColor = null;

function ensureQuickViewMarkup() {
  if (document.getElementById("quick-view-modal")) return;
  const el = document.createElement("div");
  el.id = "quick-view-modal";
  el.className = "modal-overlay";
  el.dataset.open = "false";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.innerHTML = `
    <div class="modal-backdrop" data-qv-close></div>
    <div class="modal-panel grid sm:grid-cols-2 w-full max-w-2xl">
      <div id="qv-image" class="thumb-art !rounded-none sm:rounded-l-[24px] relative overflow-hidden" style="min-height:260px">
        <img id="qv-image-img" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover">
        <i class="fa-solid fa-shoe-prints thumb-fallback-icon"></i>
      </div>
      <div class="p-6 relative">
        <button data-qv-close class="absolute top-4 right-4 h-8 w-8 flex items-center justify-center" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        <p id="qv-category" class="font-mono text-[11px] uppercase text-ink-soft"></p>
        <p id="qv-name" class="font-display text-2xl mt-1"></p>
        <p id="qv-price" class="mt-2"></p>
        <div class="mt-4">
          <p class="font-mono text-[10px] uppercase text-ink-soft mb-2">Color: <span id="qv-color-label" class="text-ink font-bold"></span></p>
          <div id="qv-colors" class="flex gap-2"></div>
        </div>
        <div class="mt-4">
          <p class="font-mono text-[10px] uppercase text-ink-soft mb-2">Size</p>
          <div id="qv-sizes" class="flex flex-wrap gap-2"></div>
        </div>
        <button id="qv-add-btn" class="btn btn-ink w-full mt-6">Add to bag <i class="fa-solid fa-bag-shopping ml-1"></i></button>
        <a id="qv-full-link" href="#" class="block text-center font-mono text-[11px] text-ink-soft underline mt-3">View full details</a>
      </div>
    </div>`;
  document.body.appendChild(el);
  el.querySelectorAll("[data-qv-close]").forEach((btn) => btn.addEventListener("click", () => closeModal("quick-view-modal")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && el.dataset.open === "true") closeModal("quick-view-modal"); });
}

function openQuickView(productId, triggerEl) {
  ensureQuickViewMarkup();
  const p = findProduct(productId);
  if (!p) return;

  const qvWrap = document.getElementById("qv-image");
  qvWrap.style.background = p.gradient;
  qvWrap.classList.remove("img-ready");
  const qvImg = document.getElementById("qv-image-img");
  qvImg.style.display = "";
  qvImg.style.filter = "";
  qvImg.dataset.srcBase = p.image;
  qvImg.dataset.extIdx = "0";
  delete qvImg.dataset.usingFallback;
  qvImg.alt = p.name;
  qvImg.src = `${p.image}.${IMG_EXTS[0]}`;
  qvImg.onerror = () => imgTryNext(qvImg);
  document.getElementById("qv-category").textContent = p.category;
  document.getElementById("qv-name").textContent = p.name;
  document.getElementById("qv-price").innerHTML = p.compareAt
    ? `<span class="font-mono text-lg font-bold text-flame">${formatPrice(p.price)}</span> <span class="font-mono text-sm text-ink-soft line-through ml-1">${formatPrice(p.compareAt)}</span>`
    : `<span class="font-mono text-lg font-bold">${formatPrice(p.price)}</span>`;
  document.getElementById("qv-full-link").href = `product.html?id=${p.id}`;

  qvSelectedColor = p.colors[0].name;
  document.getElementById("qv-color-label").textContent = qvSelectedColor;
  document.getElementById("qv-colors").innerHTML = p.colors
    .map((c) => `<button type="button" class="qv-swatch ${c.name === qvSelectedColor ? "is-active" : ""}" data-qv-color="${c.name}" style="background:${c.hex}" title="${c.name}"></button>`)
    .join("");

  qvSelectedSize = p.sizes.find((s) => !p.outOfStock.includes(s));
  document.getElementById("qv-sizes").innerHTML = p.sizes
    .map((s) => {
      const oos = p.outOfStock.includes(s);
      return `<button type="button" class="size-chip !h-8 !min-w-8 !text-[11px] ${s === qvSelectedSize ? "is-active" : ""} ${oos ? "is-disabled" : ""}" data-qv-size="${s}" ${oos ? "disabled" : ""}>${s}</button>`;
    })
    .join("");

  document.getElementById("qv-colors").onclick = (e) => {
    const btn = e.target.closest("[data-qv-color]");
    if (!btn) return;
    qvSelectedColor = btn.dataset.qvColor;
    document.getElementById("qv-color-label").textContent = qvSelectedColor;
    document.getElementById("qv-colors").querySelectorAll(".qv-swatch").forEach((s) => s.classList.toggle("is-active", s === btn));
  };
  document.getElementById("qv-sizes").onclick = (e) => {
    const btn = e.target.closest("[data-qv-size]:not(.is-disabled)");
    if (!btn) return;
    qvSelectedSize = Number(btn.dataset.qvSize);
    document.getElementById("qv-sizes").querySelectorAll(".size-chip").forEach((s) => s.classList.toggle("is-active", s === btn));
  };
  document.getElementById("qv-add-btn").onclick = () => {
    addToCart(p.id, qvSelectedSize, qvSelectedColor, 1);
    flyToCart(document.getElementById("qv-image"));
    toast(`${p.name} added to bag`);
    closeModal("quick-view-modal");
  };

  openModal("quick-view-modal", triggerEl);
}

/* ---------------------------------------------------------------------
   SIZE GUIDE. One static modal, injected once, used from any page
--------------------------------------------------------------------- */
function ensureSizeGuideMarkup() {
  if (document.getElementById("size-guide-modal")) return;
  const el = document.createElement("div");
  el.id = "size-guide-modal";
  el.className = "modal-overlay";
  el.dataset.open = "false";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.innerHTML = `
    <div class="modal-backdrop" data-sg-close></div>
    <div class="modal-panel w-full max-w-lg p-6 sm:p-8">
      <div class="flex items-center justify-between mb-5">
        <p class="font-display text-2xl">Size guide</p>
        <button data-sg-close class="h-8 w-8 flex items-center justify-center" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <p class="text-sm text-ink-soft mb-5">Measurements in centimeters, foot length heel to longest toe. Between sizes? Size up for running styles. <button data-open-size-quiz class="underline font-semibold text-ink">Not sure? Take the 30-second quiz</button></p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead><tr class="font-mono text-[11px] uppercase text-ink-soft border-b border-line">
            <th class="py-2 pr-3">US</th><th class="py-2 pr-3">UK</th><th class="py-2 pr-3">EU</th><th class="py-2">CM</th>
          </tr></thead>
          <tbody>
            <tr class="border-b border-line"><td class="py-2 pr-3">6</td><td class="py-2 pr-3">5.5</td><td class="py-2 pr-3">39</td><td class="py-2">24.0</td></tr>
            <tr class="border-b border-line"><td class="py-2 pr-3">7</td><td class="py-2 pr-3">6.5</td><td class="py-2 pr-3">40</td><td class="py-2">24.8</td></tr>
            <tr class="border-b border-line"><td class="py-2 pr-3">8</td><td class="py-2 pr-3">7.5</td><td class="py-2 pr-3">41</td><td class="py-2">25.6</td></tr>
            <tr class="border-b border-line"><td class="py-2 pr-3">9</td><td class="py-2 pr-3">8.5</td><td class="py-2 pr-3">42</td><td class="py-2">26.4</td></tr>
            <tr class="border-b border-line"><td class="py-2 pr-3">10</td><td class="py-2 pr-3">9.5</td><td class="py-2 pr-3">43</td><td class="py-2">27.2</td></tr>
            <tr class="border-b border-line"><td class="py-2 pr-3">11</td><td class="py-2 pr-3">10.5</td><td class="py-2 pr-3">44</td><td class="py-2">28.0</td></tr>
            <tr><td class="py-2 pr-3">12</td><td class="py-2 pr-3">11.5</td><td class="py-2 pr-3">45</td><td class="py-2">28.8</td></tr>
          </tbody>
        </table>
      </div>
      <a href="size-guide.html" class="text-sm font-semibold text-volt-dark hover:underline mt-5 inline-block">Full measuring guide &rarr;</a>
    </div>`;
  document.body.appendChild(el);
  el.querySelectorAll("[data-sg-close]").forEach((btn) => btn.addEventListener("click", () => closeModal("size-guide-modal")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && el.dataset.open === "true") closeModal("size-guide-modal"); });
}

/* ---------------------------------------------------------------------
   LIGHTBOX. Full-screen zoom for the product gallery. Accepts the same
   image-slot array the gallery uses, so you can swipe/arrow through
   every real photo without leaving the zoomed view.
--------------------------------------------------------------------- */
let lbImages = [];
let lbIndex = 0;

function lbGoTo(i) {
  const n = lbImages.length;
  if (!n) return;
  lbIndex = (i + n) % n;
  lbRender();
}

function lbRender() {
  const art = document.getElementById("lightbox-art");
  const slot = lbImages[lbIndex];
  if (!art || !slot) return;

  const wrap = document.createElement("div");
  wrap.innerHTML = smartImgTag(slot.base, "", 'class="lb-incoming"', slot.fallback, slot.filter);
  const incoming = wrap.firstElementChild;
  art.appendChild(incoming);

  let swapped = false;
  const swap = () => {
    if (swapped) return;
    swapped = true;
    art.querySelectorAll("img").forEach((el) => { if (el !== incoming) el.remove(); });
    requestAnimationFrame(() => incoming.classList.remove("lb-incoming"));
  };
  if (incoming.complete && incoming.naturalWidth) {
    swap();
  } else {
    incoming.addEventListener("load", swap, { once: true });
    setTimeout(swap, 900);
  }

  const dots = document.getElementById("lightbox-dots");
  const nav = document.querySelectorAll("[data-lb-prev], [data-lb-next]");
  if (lbImages.length > 1) {
    dots.innerHTML = lbImages.map((_, i) => `<span class="lightbox-dot ${i === lbIndex ? "is-active" : ""}"></span>`).join("");
    nav.forEach((n) => (n.style.display = ""));
  } else {
    dots.innerHTML = "";
    nav.forEach((n) => (n.style.display = "none"));
  }
}

function ensureLightboxMarkup() {
  if (document.getElementById("lightbox-overlay")) return;
  const el = document.createElement("div");
  el.id = "lightbox-overlay";
  el.className = "lightbox-overlay";
  el.dataset.open = "false";
  el.innerHTML = `
    <button data-lb-close class="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    <button data-lb-prev class="nav-arrow nav-arrow-prev absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 9 12 15 18"></polyline></svg></button>
    <button data-lb-next class="nav-arrow nav-arrow-next absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg></button>
    <div id="lightbox-art" class="lightbox-art aspect-square w-[500px] max-w-[90vw]"></div>
    <div id="lightbox-dots" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"></div>`;
  document.body.appendChild(el);

  el.addEventListener("click", (e) => { if (e.target === el || e.target.closest("[data-lb-close]")) closeModal("lightbox-overlay"); });
  el.querySelector("[data-lb-prev]").addEventListener("click", (e) => { e.stopPropagation(); lbGoTo(lbIndex - 1); });
  el.querySelector("[data-lb-next]").addEventListener("click", (e) => { e.stopPropagation(); lbGoTo(lbIndex + 1); });
  document.addEventListener("keydown", (e) => {
    if (el.dataset.open !== "true") return;
    if (e.key === "Escape") closeModal("lightbox-overlay");
    if (e.key === "ArrowLeft") lbGoTo(lbIndex - 1);
    if (e.key === "ArrowRight") lbGoTo(lbIndex + 1);
  });

  let sx = 0, sy = 0, swiping = false;
  el.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (!swiping) return;
    if (Math.abs(e.touches[0].clientX - sx) > Math.abs(e.touches[0].clientY - sy)) e.preventDefault();
  }, { passive: false });
  el.addEventListener("touchend", (e) => {
    if (!swiping) return;
    swiping = false;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) lbGoTo(lbIndex + (dx < 0 ? 1 : -1));
  });
}

function openLightbox(gradient, images, startIndex) {
  ensureLightboxMarkup();
  lbImages = Array.isArray(images) ? images : [{ base: images }];
  lbIndex = startIndex || 0;
  if (window.prefetchSmartImages) prefetchSmartImages(lbImages.map((s) => s.base));
  document.getElementById("lightbox-art").style.background = gradient;
  lbRender();
  openModal("lightbox-overlay");
}

/* ---------------------------------------------------------------------
   SIZE QUIZ. Three quick questions, a tiny point system, a recommended
   size at the end. Not trying to be a real fit algorithm, just enough
   interaction to feel like a real feature rather than a static chart.
--------------------------------------------------------------------- */
const SIZE_QUIZ_QUESTIONS = [
  {
    q: "What's your usual US shoe size?",
    options: [
      { label: "7 or smaller", value: 7 },
      { label: "8 – 9", value: 8.5 },
      { label: "10 – 11", value: 10.5 },
      { label: "12 or larger", value: 12 },
    ],
  },
  {
    q: "Which are you shopping for?",
    options: [
      { label: "Running shoes", value: 0.5 },
      { label: "Trail shoes", value: 0.5 },
      { label: "Everyday / lifestyle", value: 0 },
      { label: "Casual, around the house", value: -0.5 },
    ],
  },
  {
    q: "How do your usual shoes fit?",
    options: [
      { label: "Snug, I size up", value: 0.5 },
      { label: "True to size", value: 0 },
      { label: "Roomy, I size down", value: -0.5 },
    ],
  },
];

let quizAnswers = [];

function ensureSizeQuizMarkup() {
  if (document.getElementById("size-quiz-modal")) return;
  const el = document.createElement("div");
  el.id = "size-quiz-modal";
  el.className = "modal-overlay";
  el.dataset.open = "false";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.innerHTML = `
    <div class="modal-backdrop" data-sq-close></div>
    <div class="modal-panel w-full max-w-md p-6 sm:p-8">
      <div class="flex items-center justify-between mb-5">
        <p class="font-display text-2xl">Find your size</p>
        <button data-sq-close class="h-8 w-8 flex items-center justify-center" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div id="size-quiz-body"></div>
    </div>`;
  document.body.appendChild(el);
  el.querySelectorAll("[data-sq-close]").forEach((btn) => btn.addEventListener("click", () => closeModal("size-quiz-modal")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && el.dataset.open === "true") closeModal("size-quiz-modal"); });
}

function renderQuizStep(step) {
  const body = document.getElementById("size-quiz-body");
  if (step >= SIZE_QUIZ_QUESTIONS.length) {
    const base = quizAnswers[0] || 9;
    const adjust = quizAnswers.slice(1).reduce((sum, v) => sum + v, 0);
    let recommended = Math.round((base + adjust) * 2) / 2;
    recommended = Math.max(6, Math.min(12, recommended));
    body.innerHTML = `
      <div class="text-center py-4">
        <p class="font-mono text-[11px] uppercase text-ink-soft mb-2">Recommended size</p>
        <p class="font-display text-6xl text-volt-dark">${recommended}</p>
        <p class="text-sm text-ink-soft mt-3 max-w-xs mx-auto">Based on your answers. If you're between sizes, we'd still lean toward sizing up for running styles.</p>
        <button data-sq-close class="btn btn-ink mt-6">Got it <i class="fa-solid fa-check ml-1"></i></button>
      </div>`;
    return;
  }
  const question = SIZE_QUIZ_QUESTIONS[step];
  body.innerHTML = `
    <p class="font-mono text-[11px] uppercase text-ink-soft mb-1">Question ${step + 1} of ${SIZE_QUIZ_QUESTIONS.length}</p>
    <p class="font-display text-xl mb-5">${question.q}</p>
    <div class="space-y-2.5">
      ${question.options.map((opt, i) => `<button type="button" class="quiz-option w-full text-left border border-line rounded-xl px-4 py-3 text-sm hover:border-ink" data-value="${opt.value}">${opt.label}</button>`).join("")}
    </div>`;
  body.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      quizAnswers.push(Number(btn.dataset.value));
      renderQuizStep(step + 1);
    });
  });
}

function openSizeQuiz(triggerEl) {
  ensureSizeQuizMarkup();
  quizAnswers = [];
  renderQuizStep(0);
  openModal("size-quiz-modal", triggerEl);
}

/* ---------------------------------------------------------------------
   PRODUCT COMPARISON. A lightweight "+ Compare" toggle on any product
   card feeds a floating bar; opening it renders a side-by-side table.
--------------------------------------------------------------------- */
let compareIds = [];
const COMPARE_MAX = 3;

function ensureCompareBar() {
  if (document.getElementById("compare-bar")) return;
  const bar = document.createElement("div");
  bar.id = "compare-bar";
  bar.className = "fixed bottom-5 left-1/2 -translate-x-1/2 z-40 tile-white px-5 py-3 flex items-center gap-4 hidden";
  bar.innerHTML = `
    <span class="text-sm font-medium"><span id="compare-count">0</span> selected to compare</span>
    <button id="compare-open-btn" class="btn btn-ink !py-2 !px-4 !text-xs">Compare</button>
    <button id="compare-clear-btn" class="font-mono text-[11px] text-ink-soft underline">Clear</button>`;
  document.body.appendChild(bar);
  document.getElementById("compare-clear-btn").addEventListener("click", () => { compareIds = []; syncCompareUI(); });
  document.getElementById("compare-open-btn").addEventListener("click", () => openCompareModal());
}

function syncCompareUI() {
  const bar = document.getElementById("compare-bar");
  if (!bar) return;
  bar.classList.toggle("hidden", compareIds.length === 0);
  document.getElementById("compare-count").textContent = compareIds.length;
  document.querySelectorAll("[data-compare-toggle]").forEach((btn) => {
    btn.classList.toggle("is-active", compareIds.includes(btn.dataset.compareToggle));
    btn.textContent = compareIds.includes(btn.dataset.compareToggle) ? "Comparing" : "+ Compare";
  });
}

function ensureCompareModal() {
  if (document.getElementById("compare-modal")) return;
  const el = document.createElement("div");
  el.id = "compare-modal";
  el.className = "modal-overlay";
  el.dataset.open = "false";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.innerHTML = `
    <div class="modal-backdrop" data-cmp-close></div>
    <div class="modal-panel w-full max-w-3xl p-6 sm:p-8">
      <div class="flex items-center justify-between mb-5">
        <p class="font-display text-2xl">Compare</p>
        <button data-cmp-close class="h-8 w-8 flex items-center justify-center" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div id="compare-table" class="overflow-x-auto"></div>
    </div>`;
  document.body.appendChild(el);
  el.querySelectorAll("[data-cmp-close]").forEach((btn) => btn.addEventListener("click", () => closeModal("compare-modal")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && el.dataset.open === "true") closeModal("compare-modal"); });
}

function openCompareModal() {
  ensureCompareModal();
  const products = compareIds.map((id) => findProduct(id)).filter(Boolean);
  const rows = [
    ["", ...products.map((p) => `<a href="product.html?id=${p.id}" class="font-display text-base hover:underline">${p.name}</a>`)],
    ["Category", ...products.map((p) => p.category)],
    ["Price", ...products.map((p) => formatPrice(p.price))],
    ["Rating", ...products.map((p) => `${p.rating} (${p.reviews})`)],
    ["Sizes", ...products.map((p) => p.sizes.join(", "))],
    ["", ...products.map((p) => `<button class="btn btn-ink !py-1.5 !px-3 !text-[11px]" data-quick-view="${p.id}">Quick add</button>`)],
  ];
  document.getElementById("compare-table").innerHTML = `
    <table class="w-full text-sm">
      ${rows.map((row) => `<tr class="border-b border-line last:border-0">${row.map((cell, i) => `<td class="py-3 pr-4 ${i === 0 ? "font-mono text-[11px] uppercase text-ink-soft whitespace-nowrap" : ""}">${cell}</td>`).join("")}</tr>`).join("")}
    </table>`;
  openModal("compare-modal");
}

document.addEventListener("DOMContentLoaded", () => {
  ensureSizeGuideMarkup();
  document.querySelectorAll("[data-open-size-guide]").forEach((btn) => btn.addEventListener("click", () => openModal("size-guide-modal", btn)));
  document.body.addEventListener("click", (e) => {
    const quizBtn = e.target.closest("[data-open-size-quiz]");
    if (quizBtn) { closeModal("size-guide-modal"); openSizeQuiz(quizBtn); }
  });

  ensureCompareBar();
  document.body.addEventListener("click", (e) => {
    const cmpBtn = e.target.closest("[data-compare-toggle]");
    if (cmpBtn) {
      const id = cmpBtn.dataset.compareToggle;
      if (compareIds.includes(id)) compareIds = compareIds.filter((x) => x !== id);
      else if (compareIds.length < COMPARE_MAX) compareIds.push(id);
      else toast(`You can compare up to ${COMPARE_MAX} at once`);
      syncCompareUI();
    }
  });

  // any product-card grid can opt into quick view via a [data-quick-view] button
  document.body.addEventListener("click", (e) => {
    const qvBtn = e.target.closest("[data-quick-view]");
    if (qvBtn) { e.preventDefault(); openQuickView(qvBtn.dataset.quickView, qvBtn); }
  });
});
