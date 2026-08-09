/* ==========================================================================
   STRIDE. Build.js
   A step-by-step configurator modeled on how Nike By You / Adidas actually
   run theirs: pick a real base shoe first (its fit, sole, and price all
   carry over), then customize upper / sole / laces one panel at a time,
   then review before it goes in the bag. The live preview recolors your
   actual base-model photo region by region (upper / sole / laces each
   painted from their own hand-fit mask) via canvas so the shoe you see
   is real, not a flat illustration or a single blended tint.
   ========================================================================== */

const BUILD_COLORS = [
  { name: "Ink", hex: "#0B0B0C" },
  { name: "Cream", hex: "#F7F5EF" },
  { name: "Volt", hex: "#D7FF3F" },
  { name: "Flame", hex: "#FF4B2B" },
  { name: "Sky", hex: "#4CC9F0" },
  { name: "Grape", hex: "#7209B7" },
  { name: "Clay", hex: "#B5651D" },
  { name: "Moss", hex: "#606C38" },
];

const BASE_MODEL_IDS = ["quantum-pulse", "nitro-3-running", "retro-88-classic", "urban-glide-low", "aero-knit-runner", "peak-trail-mid"];

const STEPS = ["model", "upper", "sole", "laces", "review"];
const STEP_LABELS = ["Model", "Upper", "Sole", "Laces", "Review"];

const build = { modelId: null, upper: "#0B0B0C", sole: "#D7FF3F", laces: "#F7F5EF", size: null };
let stepIndex = 0;

function getBaseModel() {
  return findProduct(build.modelId) || findProduct(BASE_MODEL_IDS[0]);
}

/* ---------------------------------------------------------------------
   PER-PART PHOTO RECOLORING. Each base model has a real product photo
   plus three hand-fit alpha masks (upper / sole / laces — see
   images/build-masks/). We draw the real photo onto a canvas, then for
   each part: fill an offscreen canvas with the chosen color, clip it to
   that part's mask (destination-in), and composite it onto the photo
   with globalCompositeOperation "color" — which keeps all of the
   original photo's shading, texture and highlights and only replaces
   hue/saturation, exactly like recoloring a real shoe, region by
   region instead of one flat tint over the whole thing.
--------------------------------------------------------------------- */
const modelAssetCache = {};

function loadImg(src) {
  return new Promise((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = src;
  });
}

function getModelAssets(p) {
  if (modelAssetCache[p.id]) return modelAssetCache[p.id];
  const maskBase = `images/build-masks/${p.id}`;
  const promise = Promise.all([
    loadImg(`${p.image}.jpg`).then((img) => img || loadImg(`${p.image}.webp`)),
    loadImg(`${maskBase}-upper.png`),
    loadImg(`${maskBase}-sole.png`),
    loadImg(`${maskBase}-laces.png`),
  ]).then(([photo, upperMask, soleMask, lacesMask]) => ({ photo, upperMask, soleMask, lacesMask }));
  modelAssetCache[p.id] = promise;
  return promise;
}

let paintToken = 0;
async function paintPreviewCanvas() {
  const p = getBaseModel();
  const canvas = document.getElementById("build-preview-canvas");
  const img = document.getElementById("build-photo-img");
  if (!canvas) return;
  const myToken = ++paintToken;
  const { photo, upperMask, soleMask, lacesMask } = await getModelAssets(p);
  if (myToken !== paintToken) return; // a newer model/color change superseded this paint

  if (!photo) { canvas.style.display = "none"; return; } // real photo failed to load — plain <img> fallback (with its own onerror chain) stays visible instead

  canvas.width = photo.naturalWidth;
  canvas.height = photo.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(photo, 0, 0);

  [[upperMask, build.upper], [soleMask, build.sole], [lacesMask, build.laces]].forEach(([mask, color]) => {
    if (!mask) return;
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext("2d");
    octx.fillStyle = color;
    octx.fillRect(0, 0, off.width, off.height);
    octx.globalCompositeOperation = "destination-in";
    octx.drawImage(mask, 0, 0, off.width, off.height);

    ctx.globalCompositeOperation = "color";
    ctx.globalAlpha = 0.92;
    ctx.drawImage(off, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  });

  canvas.style.display = "";
  img.style.opacity = "0"; // keep the plain photo underneath as a silent fallback; hide it once the canvas has something to show
  markImgReady(img);
}

function paintPreview() {
  const glow = document.getElementById("build-glow");
  if (glow) glow.style.setProperty("--build-glow-color", build.upper);
  paintPreviewCanvas();
}

function updatePreviewPhoto() {
  const p = getBaseModel();
  const img = document.getElementById("build-photo-img");
  img.dataset.srcBase = p.image;
  img.dataset.extIdx = "0";
  delete img.dataset.usingFallback;
  img.alt = p.name;
  img.style.display = "";
  img.style.opacity = "1";
  img.src = `${p.image}.${IMG_EXTS[0]}`;
  img.onerror = () => imgTryNext(img);
  const canvas = document.getElementById("build-preview-canvas");
  if (canvas) canvas.style.display = "none";
  paintPreviewCanvas();
}

function renderModelTag() {
  const p = getBaseModel();
  const tag = document.getElementById("build-model-tag");
  tag.innerHTML = `
    <div class="tile thumb-art w-14 h-14 shrink-0 relative overflow-hidden" style="background:${p.gradient}">
      ${smartImgTag(p.image, p.name, 'loading="lazy"')}
      <i class="fa-solid fa-shoe-prints thumb-fallback-icon"></i>
    </div>
    <div class="min-w-0">
      <p class="font-mono text-[10px] uppercase text-ink-soft">Base model</p>
      <p class="font-semibold truncate">${p.name}</p>
      <p class="font-mono text-xs text-ink-soft">${formatPrice(p.price)} + $20 build fee</p>
    </div>`;
}

function renderModelGrid() {
  const wrap = document.getElementById("build-model-grid");
  wrap.innerHTML = BASE_MODEL_IDS.map((id) => {
    const p = findProduct(id);
    return `
    <button type="button" class="model-card ${id === build.modelId ? "is-active" : ""}" data-model="${id}">
      <div class="tile thumb-art aspect-square relative overflow-hidden mb-2" style="background:${p.gradient}">
        ${smartImgTag(p.image, p.name, 'loading="lazy"')}
        <i class="fa-solid fa-shoe-prints thumb-fallback-icon"></i>
        <i class="fa-solid fa-circle-check model-check"></i>
      </div>
      <p class="text-xs font-semibold leading-snug">${p.name}</p>
      <p class="font-mono text-[10px] text-ink-soft mt-0.5">${formatPrice(p.price)}</p>
    </button>`;
  }).join("");

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-model]");
    if (!btn) return;
    build.modelId = btn.dataset.model;
    wrap.querySelectorAll(".model-card").forEach((c) => c.classList.toggle("is-active", c === btn));
    renderModelTag();
    updatePreviewPhoto();
    updateNextEnabled();
  });
}

function renderBuildSwatches(id, prop) {
  const wrap = document.getElementById(id);
  wrap.innerHTML = BUILD_COLORS.map(
    (c) => `<button type="button" class="swatch ${c.hex === build[prop] ? "is-active" : ""}" data-color="${c.hex}" style="background:${c.hex}" title="${c.name}"></button>`
  ).join("");
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".swatch");
    if (!btn) return;
    build[prop] = btn.dataset.color;
    wrap.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("is-active", s === btn));
    paintPreview();
  });
}

function renderSizes() {
  const p = getBaseModel();
  const wrap = document.getElementById("build-sizes");
  wrap.innerHTML = p.sizes
    .map((s) => `<button type="button" class="size-chip ${s === build.size ? "is-active" : ""}" data-size="${s}">${s}</button>`)
    .join("");
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-size]");
    if (!btn) return;
    build.size = Number(btn.dataset.size);
    wrap.querySelectorAll(".size-chip").forEach((c) => c.classList.toggle("is-active", c === btn));
    updateNextEnabled();
  });
}

function colorName(hex) {
  const c = BUILD_COLORS.find((x) => x.hex === hex);
  return c ? c.name : hex;
}

function renderReview() {
  const p = getBaseModel();
  const rows = [
    ["Base model", p.name],
    ["Upper", colorName(build.upper)],
    ["Sole", colorName(build.sole)],
    ["Laces", colorName(build.laces)],
  ];
  document.getElementById("build-summary-rows").innerHTML = rows
    .map(([label, val]) => `<div class="flex items-center justify-between"><span class="text-ink-soft">${label}</span><span class="font-semibold">${val}</span></div>`)
    .join("");
  document.getElementById("build-total-price").textContent = formatPrice(p.price + 20);
  renderSizes();
}

/* ---------------------------------------------------------------------
   STEPPER. A small progress bar of numbered pills. Completed/visited
   steps are clickable to jump back; steps ahead of where you are stay
   inert until you reach them normally.
--------------------------------------------------------------------- */
let furthestStep = 0;

function renderStepper() {
  const wrap = document.getElementById("build-stepper");
  wrap.innerHTML = STEPS.map((key, i) => {
    const state = i === stepIndex ? "is-active" : i < stepIndex ? "is-done" : "";
    const clickable = i <= furthestStep;
    return `
      <div class="build-stepper-item ${state}">
        <button type="button" class="build-stepper-dot" data-step="${i}" ${clickable ? "" : "disabled"}>
          ${i < stepIndex ? '<i class="fa-solid fa-check"></i>' : i + 1}
        </button>
        <span class="build-stepper-label">${STEP_LABELS[i]}</span>
      </div>
      ${i < STEPS.length - 1 ? '<div class="build-stepper-line"></div>' : ""}`;
  }).join("");

  wrap.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(Number(btn.dataset.step)));
  });
}

function updateNextEnabled() {
  const btn = document.getElementById("build-next-btn");
  if (STEPS[stepIndex] === "model") btn.disabled = !build.modelId;
  else btn.disabled = false;
}

function goToStep(i) {
  if (i > furthestStep + 1) return;
  stepIndex = i;
  furthestStep = Math.max(furthestStep, i);
  document.querySelectorAll(".build-step").forEach((el, idx) => el.classList.toggle("hidden", idx !== stepIndex));
  document.getElementById("build-back-btn").classList.toggle("invisible", stepIndex === 0);
  const nextBtn = document.getElementById("build-next-btn");
  if (STEPS[stepIndex] === "review") { nextBtn.classList.add("hidden"); }
  else { nextBtn.classList.remove("hidden"); nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right ml-2"></i>'; }
  if (STEPS[stepIndex] === "review") renderReview();
  updateNextEnabled();
  renderStepper();
  window.scrollTo({ top: document.getElementById("build-stepper").getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  build.modelId = BASE_MODEL_IDS[0];

  renderModelGrid();
  renderModelTag();
  updatePreviewPhoto();
  renderBuildSwatches("build-upper-swatches", "upper");
  renderBuildSwatches("build-sole-swatches", "sole");
  renderBuildSwatches("build-laces-swatches", "laces");
  paintPreview();
  goToStep(0);

  document.getElementById("build-next-btn").addEventListener("click", () => {
    if (stepIndex < STEPS.length - 1) goToStep(stepIndex + 1);
  });
  document.getElementById("build-back-btn").addEventListener("click", () => {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  });

  document.getElementById("build-add-btn").addEventListener("click", () => {
    if (!build.size) { toast("Pick a size first"); return; }
    const p = getBaseModel();
    const label = `${p.name} (custom: ${colorName(build.upper)} / ${colorName(build.sole)} / ${colorName(build.laces)})`;
    const preview = document.getElementById("build-preview");
    if (preview) flyToCart(preview);
    addToCart(p.id, build.size, `Custom ${colorName(build.upper)}`, 1);
    toast(`${label} added to bag`);
    openDrawer("cart-drawer");
  });
});
