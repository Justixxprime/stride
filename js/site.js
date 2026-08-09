/* ==========================================================================
   STRIDE. Site.js
   Shared on every page: mobile menu, scroll reveal, magnetic buttons,
   and a small generic "drawer" opener reused by the cart, filters, and
   mobile nav so every slide-out panel behaves identically.
   ========================================================================== */

/* ---------------------------------------------------------------------
   SMART IMAGES. Drop a photo in with ANY common extension and it just
   works, no need to match a hardcoded ".jpg" exactly. Every product/
   category image is referenced by its base path (no extension); this
   tries each real extension in turn and only falls back to the
   gradient/icon placeholder if none of them exist.
   Usage: <img data-src-base="images/products/nitro-3-running"
               src="images/products/nitro-3-running.jpg"
               onerror="imgTryNext(this)">
--------------------------------------------------------------------- */
const IMG_EXTS = ["webp", "avif", "jpg", "jpeg", "png"];
function imgTryNext(img) {
  const usingFallback = img.dataset.usingFallback === "1";
  const base = usingFallback ? img.dataset.fallback : img.dataset.srcBase;
  if (!base) { img.style.display = "none"; return; }
  const idx = parseInt(img.dataset.extIdx || "0", 10) + 1;
  if (idx >= IMG_EXTS.length) {
    if (!usingFallback && img.dataset.fallback) {
      img.dataset.usingFallback = "1";
      img.dataset.extIdx = "0";
      if (img.dataset.fallbackFilter) img.style.filter = img.dataset.fallbackFilter;
      img.src = `${img.dataset.fallback}.${IMG_EXTS[0]}`;
      return;
    }
    img.style.display = "none";
    markImgReady(img);
    return;
  }
  img.dataset.extIdx = String(idx);
  img.src = `${base}.${IMG_EXTS[idx]}`;
}

/* ---------------------------------------------------------------------
   IMAGE SKELETONS. Every .thumb-art (product cards, quick view,
   category tiles) shimmers via CSS by default and gets ".img-ready"
   the moment its image finishes — either loads successfully, or gives
   up entirely (imgTryNext running out of extensions/fallback, which
   hides the img and leaves the gradient + fallback icon showing, the
   existing behavior). Delegated at the document level with capture
   (img "load"/"error" don't bubble) so it also covers cards rendered
   after this runs, like the shop grid or Quick View modal.
--------------------------------------------------------------------- */
function markImgReady(img) {
  const wrap = img.closest(".thumb-art");
  if (wrap) wrap.classList.add("img-ready");
}
function initImageSkeletons() {
  document.querySelectorAll(".thumb-art img:not(.thumb-alt)").forEach((img) => {
    if (img.complete && (img.naturalWidth > 0 || img.style.display === "none")) markImgReady(img);
  });
  document.addEventListener("load", (e) => {
    if (e.target.tagName === "IMG" && e.target.closest(".thumb-art")) markImgReady(e.target);
  }, true);
  // imgTryNext() itself calls markImgReady() once it's exhausted every
  // extension and fallback, so a genuinely broken image still resolves
  // to "ready" (showing the gradient + icon) instead of shimmering forever.
  // safety net: never let a tile shimmer forever if something odd happens
  setTimeout(() => {
    document.querySelectorAll(".thumb-art:not(.img-ready)").forEach((el) => el.classList.add("img-ready"));
  }, 4000);
}
function smartImgTag(basePath, alt, extraAttrs, fallbackBase, fallbackFilter) {
  const fb = fallbackBase ? `data-fallback="${fallbackBase}"` : "";
  const ff = fallbackFilter ? `data-fallback-filter="${fallbackFilter}"` : "";
  return `<img data-src-base="${basePath}" data-ext-idx="0" ${fb} ${ff} src="${basePath}.${IMG_EXTS[0]}" alt="${alt}" ${extraAttrs || ""} onerror="imgTryNext(this)">`;
}

/* ---------------------------------------------------------------------
   SMART VIDEO. A cinematic background clip that degrades gracefully:
   video (mp4, then webm) -> poster photo (smart-loaded, same extension
   chain as images) -> whatever gradient/color is already behind it.
   Usage:
     <div class="relative ...">
       <img data-src-base="images/hero-loop-poster" ... class="absolute inset-0 ...">
       <video data-src-base="videos/hero-loop" data-video-poster="images/hero-loop-poster"
              class="absolute inset-0 ..." muted loop playsinline autoplay></video>
     </div>
   Respects prefers-reduced-motion (skips video, keeps the poster) and
   Save-Data / very slow connections (same).
--------------------------------------------------------------------- */
const VIDEO_EXTS = ["mp4", "webm"];
function initSmartVideos() {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ""));
  document.querySelectorAll("video[data-src-base]").forEach((video) => {
    if (reduceMotion || saveData) { video.remove(); return; }
    const base = video.dataset.srcBase;
    VIDEO_EXTS.forEach((ext) => {
      const source = document.createElement("source");
      source.src = `${base}.${ext}`;
      source.type = ext === "mp4" ? "video/mp4" : "video/webm";
      video.appendChild(source);
    });
    const fallback = () => { if (video.isConnected) video.remove(); };
    video.addEventListener("error", fallback);
    video.addEventListener("stalled", fallback);
    video.addEventListener("loadeddata", () => video.classList.add("is-loaded"));
    video.load();
    video.play().catch(() => {});
    // safety net: some browsers don't reliably fire 'error' on the
    // <video> element itself when every <source> 404s. If nothing has
    // actually started loading after a couple seconds, assume it's not
    // there and fall back to the photo/gradient behind it.
    setTimeout(() => { if (video.readyState === 0) fallback(); }, 2500);
  });
}

/* ---------------------------------------------------------------------
   GENERIC DRAWER. Any element with [data-drawer] + a trigger with
   [data-drawer-open="id"] and close buttons with [data-drawer-close]
   inside it. Used for the mobile menu, the cart, and the filter panel.
--------------------------------------------------------------------- */
function openDrawer(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.open = "true";
  document.body.style.overflow = "hidden";
  const trigger = document.querySelector(`[data-drawer-open="${id}"]`);
  el._release = trapFocus(el, trigger);
}
function closeDrawer(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.open = "false";
  document.body.style.overflow = "";
  if (el._release) { el._release(); el._release = null; }
  if (id === "mobile-nav") {
    const hb = document.getElementById("hamburger-btn");
    if (hb) hb.dataset.open = "false";
  }
}

function trapFocus(container, triggerEl) {
  const selector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusables = container.querySelectorAll(selector);
  if (focusables.length) focusables[0].focus();
  function onKeydown(e) {
    if (e.key !== "Tab") return;
    const items = [...container.querySelectorAll(selector)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener("keydown", onKeydown);
  return function release() {
    container.removeEventListener("keydown", onKeydown);
    if (triggerEl) triggerEl.focus();
  };
}

function initDrawers() {
  document.querySelectorAll("[data-drawer-open]").forEach((btn) => {
    btn.addEventListener("click", () => openDrawer(btn.dataset.drawerOpen));
  });
  document.querySelectorAll("[data-drawer]").forEach((drawer) => {
    drawer.querySelectorAll("[data-drawer-close]").forEach((btn) => btn.addEventListener("click", () => closeDrawer(drawer.id)));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll('[data-drawer][data-open="true"]').forEach((d) => closeDrawer(d.id));
  });
}

/* ---------------------------------------------------------------------
   MOBILE NAV HAMBURGER
--------------------------------------------------------------------- */
function initMobileNav() {
  const btn = document.getElementById("hamburger-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const isOpen = document.getElementById("mobile-nav").dataset.open === "true";
    if (isOpen) {
      closeDrawer("mobile-nav");
    } else {
      btn.dataset.open = "true";
      openDrawer("mobile-nav");
    }
  });
}

/* ---------------------------------------------------------------------
   MAGNETIC BUTTONS. The wrapped element nudges toward the cursor,
   snapping back to center with a spring transition on mouseleave.
--------------------------------------------------------------------- */
function initMagnetic() {
  if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.35;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = "translate(0,0)"; });
  });
}

/* ---------------------------------------------------------------------
   SCROLL REVEAL
--------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]:not(.is-visible)");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------------
   TOAST (shared, supports an optional Undo button)
--------------------------------------------------------------------- */
function toast(message, undo) {
  const wrap = document.getElementById("toast-wrap");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "toast font-mono text-xs px-4 py-3 rounded-2xl shadow-lg bg-ink text-paper flex items-center gap-4";
  const msg = document.createElement("span");
  msg.textContent = message;
  el.appendChild(msg);
  if (undo) {
    const btn = document.createElement("button");
    btn.textContent = undo.label || "Undo";
    btn.className = "text-volt font-bold underline shrink-0";
    btn.addEventListener("click", () => { undo.onUndo(); el.remove(); });
    el.appendChild(btn);
  }
  wrap.appendChild(el);
  setTimeout(() => el.remove(), undo ? 5000 : 2600);
}

/* ---------------------------------------------------------------------
   ORDER TRACKING. A small deterministic "fake" fulfillment stage, shared
   by the order-confirmation page and the account order history so both
   show the same stage for the same order.
--------------------------------------------------------------------- */
const ORDER_STAGES = ["Placed", "Processing", "Shipped", "Delivered"];
function orderStageIndex(order) {
  const seed = order.id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return seed % ORDER_STAGES.length;
}
function trackingHTML(order) {
  const stageIdx = orderStageIndex(order);
  return `
    <div class="flex items-center pt-1 max-w-md">
      ${ORDER_STAGES.map((stage, i) => `
        ${i > 0 ? `<div class="step-line ${i <= stageIdx ? "is-done" : ""}"></div>` : ""}
        <div class="flex flex-col items-center gap-1.5 shrink-0">
          <div class="step-dot !h-6 !w-6 !text-[9px] ${i === stageIdx ? "is-active" : ""} ${i < stageIdx ? "is-done" : ""}">${i < stageIdx ? '<i class="fa-solid fa-check text-[8px]"></i>' : ""}</div>
          <span class="font-mono text-[9px] uppercase text-ink-soft">${stage}</span>
        </div>`).join("")}
    </div>`;
}

/* ---------------------------------------------------------------------
   BARCODE. Draws a believable-looking barcode out of random-width bars
   using a fixed seed so it's identical on every load.
--------------------------------------------------------------------- */
function renderBarcode(containerEl, seed = 42) {
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let html = "";
  for (let i = 0; i < 46; i++) {
    const w = rand() > 0.7 ? 3 : 1.5;
    html += `<span style="width:${w}px"></span>`;
  }
  containerEl.innerHTML = html;
}

/* ---------------------------------------------------------------------
   THEME. "light" | "dark" | "system", same mechanism as Pulse: colors
   are CSS variables, Tailwind's color names point at those variables, so
   toggling .dark on <html> repaints every themed utility class at once.
--------------------------------------------------------------------- */
const SYSTEM_DARK_QUERY = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

/* ---- "sunset" theme: auto dark mode timed to the visitor's actual local
   sunrise/sunset (via geolocation + the free sunrise-sunset.org API, no
   key needed). Falls back to the system preference until resolved, or
   if location access is denied. ---- */
function getSunCache() {
  try {
    const c = JSON.parse(localStorage.getItem("stride-sun-cache"));
    if (c && c.date === new Date().toDateString()) return c;
  } catch {}
  return null;
}
function computeIsAfterSunset(cache) {
  const now = Date.now();
  return now < new Date(cache.sunrise).getTime() || now > new Date(cache.sunset).getTime();
}
let sunsetTimerId = null;
function scheduleSunsetFlip(cache) {
  if (sunsetTimerId) clearTimeout(sunsetTimerId);
  const now = Date.now();
  const sunrise = new Date(cache.sunrise).getTime();
  const sunset = new Date(cache.sunset).getTime();
  const next = now < sunrise ? sunrise : now < sunset ? sunset : null;
  if (next) {
    sunsetTimerId = setTimeout(() => {
      if ((localStorage.getItem("stride-theme") || "system") === "sunset") applyTheme("sunset");
      scheduleSunsetFlip(cache);
    }, next - now + 1000);
  }
}
function refreshSunsetSchedule() {
  const cache = getSunCache();
  if (cache) { scheduleSunsetFlip(cache); return; }
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status !== "OK") return;
          const fresh = { date: new Date().toDateString(), sunrise: data.results.sunrise, sunset: data.results.sunset };
          localStorage.setItem("stride-sun-cache", JSON.stringify(fresh));
          if ((localStorage.getItem("stride-theme") || "system") === "sunset") applyTheme("sunset");
          scheduleSunsetFlip(fresh);
        })
        .catch(() => {});
    },
    () => { toast("Couldn't get your location, using your system theme instead"); },
    { timeout: 8000 }
  );
}

function effectiveIsDark(pref) {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  if (pref === "sunset") {
    const cache = getSunCache();
    if (cache) return computeIsAfterSunset(cache);
  }
  return SYSTEM_DARK_QUERY ? SYSTEM_DARK_QUERY.matches : false;
}
function applyTheme(pref) {
  document.documentElement.classList.toggle("dark", effectiveIsDark(pref));
  document.querySelectorAll("[data-theme-set]").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.themeSet === pref));
}
function setThemePreference(pref) {
  localStorage.setItem("stride-theme", pref);
  applyTheme(pref);
  if (pref === "sunset") refreshSunsetSchedule();
}
function initTheme() {
  const pref = localStorage.getItem("stride-theme") || "system";
  applyTheme(pref);
  document.querySelectorAll("[data-theme-set]").forEach((el) => el.addEventListener("click", () => setThemePreference(el.dataset.themeSet)));
  if (pref === "sunset") refreshSunsetSchedule();
  if (SYSTEM_DARK_QUERY) {
    SYSTEM_DARK_QUERY.addEventListener("change", () => {
      const p = localStorage.getItem("stride-theme") || "system";
      if (p === "system") applyTheme(p);
    });
  }
}

/* ---------------------------------------------------------------------
   NAV SCROLL SHADOW
--------------------------------------------------------------------- */
function initNavShadow() {
  const header = document.getElementById("site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------------------
   CURSOR SPOTLIGHT. Any [data-spotlight] zone gets a soft volt-green
   glow that follows the mouse, purely via two CSS custom properties.
--------------------------------------------------------------------- */
function initSpotlight() {
  document.querySelectorAll("[data-spotlight]").forEach((zone) => {
    zone.addEventListener("mousemove", (e) => {
      const r = zone.getBoundingClientRect();
      zone.style.setProperty("--sx", ((e.clientX - r.left) / r.width) * 100 + "%");
      zone.style.setProperty("--sy", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });
}

/* ---------------------------------------------------------------------
   3D TILT. Any [data-tilt] wrapper rotates slightly toward the cursor.
   Expects a `.tilt-inner` child that actually receives the transform.
--------------------------------------------------------------------- */
function initTilt() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const inner = el.querySelector(".tilt-inner") || el;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      inner.style.transform = `rotateX(${py * -8}deg) rotateY(${px * 8}deg) translateZ(0)`;
    });
    el.addEventListener("mouseleave", () => { inner.style.transform = "rotateX(0) rotateY(0)"; });
  });
}

/* ---------------------------------------------------------------------
   SCROLL-LINKED PARALLAX. Elements tagged [data-parallax="0.2"] drift at
   a fraction of scroll speed for a subtle layered-depth feel on the
   homepage hero. Skips entirely for reduced-motion or touch devices
   (no scroll-linked hover-ish effect to show there anyway).
--------------------------------------------------------------------- */
function initParallax() {
  const els = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!els.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  function update() {
    const vh = window.innerHeight;
    els.forEach((el) => {
      // if this element also does a scroll-reveal entrance, let that CSS
      // transition finish and settle at translateY(0) before we take over,
      // so the two transforms never fight each other
      if (el.hasAttribute("data-reveal") && !el.classList.contains("is-visible")) return;
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return; // skip work far off-screen
      const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
}

/* ---------------------------------------------------------------------
   WORD-BY-WORD TEXT REVEAL. Wraps each word of a [data-split-text]
   heading in nested spans so CSS can slide them up into view in
   sequence. Splitting happens once, on load.
--------------------------------------------------------------------- */
function initSplitText() {
  document.querySelectorAll("[data-split-text]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    const accentWord = (el.dataset.accentWord || "").toLowerCase();
    el.innerHTML = words
      .map((w) => {
        const isAccent = accentWord && w.replace(/[^\w]/g, "").toLowerCase() === accentWord;
        return `<span class="split-word"><span${isAccent ? ' class="font-accent italic font-normal"' : ""}>${w}</span></span> `;
      })
      .join("");
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("split-ready")));
  });
}

/* ---------------------------------------------------------------------
   NAV LIVE SEARCH. As-you-type results dropdown under the nav search
   box, present on every page. Reuses the same PRODUCTS array as the shop
   filters (see products.js), no separate search index needed.
--------------------------------------------------------------------- */
function initNavSearch() {
  const input = document.getElementById("nav-search");
  const panel = document.getElementById("nav-search-results");
  if (!input || !panel || typeof PRODUCTS === "undefined") return;

  function render(query) {
    const q = query.trim().toLowerCase();
    if (!q) { panel.classList.remove("is-open"); panel.innerHTML = ""; return; }
    const matches = PRODUCTS.filter((p) => (p.name + " " + p.category).toLowerCase().includes(q)).slice(0, 6);
    if (!matches.length) {
      panel.innerHTML = `<p class="px-4 py-4 text-sm text-ink-soft">No shoes match "${query}"</p>`;
    } else {
      panel.innerHTML = matches
        .map(
          (p) => `<a href="product.html?id=${p.id}" class="nav-search-result">
            <span class="h-10 w-10 rounded-lg shrink-0" style="background:${p.gradient}"></span>
            <span class="min-w-0">
              <span class="block text-sm font-medium truncate">${p.name}</span>
              <span class="block font-mono text-xs text-ink-soft">${formatPrice(p.price)}</span>
            </span>
          </a>`
        )
        .join("") + `<a href="shop.html?q=${encodeURIComponent(query)}" class="block text-center font-mono text-[11px] uppercase py-3 border-t border-line text-ink-soft hover:text-ink">See all results</a>`;
    }
    panel.classList.add("is-open");
  }

  input.addEventListener("input", (e) => render(e.target.value));
  input.addEventListener("focus", () => { if (input.value.trim()) panel.classList.add("is-open"); });
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== input) panel.classList.remove("is-open");
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) window.location.href = `shop.html?q=${encodeURIComponent(input.value.trim())}`;
    if (e.key === "Escape") panel.classList.remove("is-open");
  });
}

/* ---------------------------------------------------------------------
   ACTIVE NAV LINK. Highlights whichever nav item matches the current
   page, in both the desktop bar and the mobile drawer, in both themes
   (styled with CSS variables so it repaints with the theme automatically).
--------------------------------------------------------------------- */
function initActiveNav() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  const currentSearch = window.location.search;
  document.querySelectorAll(".nav-link, #mobile-nav a[href], footer a[href], .simple-dropdown a[href]").forEach((link) => {
    const rawHref = link.getAttribute("href") || "";
    const [hrefPath, hrefQuery] = rawHref.split("#")[0].split("?");
    if (!hrefPath || hrefPath !== current) return;
    // a link with its own query string (e.g. shop.html?sale=1) only lights up
    // on an exact query match, so it doesn't also light up the plain "Shop" link
    if (hrefQuery) { if ("?" + hrefQuery === currentSearch) link.classList.add("is-current"); }
    else if (!hrefQuery) link.classList.add("is-current");
  });
  // the "More" dropdown trigger highlights when the current page is one of its links
  document.querySelectorAll(".nav-has-dropdown").forEach((wrap) => {
    if (wrap.querySelector(".simple-dropdown a.is-current")) {
      wrap.querySelector("button")?.classList.add("is-current");
    }
  });
}

/* ---------------------------------------------------------------------
   SCROLL PROGRESS BAR
--------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   BACK TO TOP. A small floating button, bottom-right, that fades in
   after scrolling down a bit. Injected here so it's on every page
   automatically without editing 26 HTML files.
--------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.createElement("button");
  btn.id = "back-to-top";
  btn.type = "button";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(btn);
  const toggle = () => btn.classList.toggle("is-visible", window.scrollY > 600);
  document.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  toggle();
}

function initScrollProgress() {
  const bar = document.createElement("div");
  bar.id = "scroll-progress";
  document.body.appendChild(bar);
  const update = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = height > 0 ? (window.scrollY / height) * 100 + "%" : "0%";
  };
  document.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------------------------------------------------------------------
   CUSTOM CURSOR. A small dot plus a lagging ring that grows over
   anything clickable. Fine-pointer devices only (skipped on touch).
--------------------------------------------------------------------- */
function initCustomCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const dot = document.createElement("div");
  dot.id = "cursor-dot";
  const ring = document.createElement("div");
  ring.id = "cursor-ring";
  document.body.append(dot, ring);
  document.documentElement.classList.add("has-custom-cursor");

  let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + "px"; dot.style.top = mouseY + "px";
  });
  (function loop() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + "px"; ring.style.top = ringY + "px";
    requestAnimationFrame(loop);
  })();
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, input, select, textarea, .product-card, .tile-3d")) ring.classList.add("is-active");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a, button, input, select, textarea, .product-card, .tile-3d")) ring.classList.remove("is-active");
  });
  document.addEventListener("mouseleave", () => { dot.classList.add("is-hidden"); ring.classList.add("is-hidden"); });
  document.addEventListener("mouseenter", () => { dot.classList.remove("is-hidden"); ring.classList.remove("is-hidden"); });
}

/* ---------------------------------------------------------------------
   BUTTON RIPPLE
--------------------------------------------------------------------- */
function initRipple() {
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn, .icon-btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

/* ---------------------------------------------------------------------
   SKIP TO CONTENT
--------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   WEB3FORMS. Real email delivery for a static site, no backend.
   Get a free access key at https://web3forms.com (enter your email,
   the key arrives instantly) and paste it in below. Until you do,
   every submit still works and shows a friendly message. It just
   can't actually send anywhere.
   To also email a confirmation back to the *visitor* (e.g. a receipt),
   turn on "Autoresponder" in your Web3Forms dashboard settings. That's
   a toggle on their end, not something set here.
--------------------------------------------------------------------- */
const WEB3FORMS_ACCESS_KEY = "e49454cf-f88c-4226-936f-7ec5b49f78a9";

async function submitToWeb3Forms(fields) {
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
    return { success: false, configured: false, message: "Email isn't connected yet. Add a Web3Forms access key in js/site.js." };
  }
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, ...fields }),
    });
    const data = await res.json();
    return { success: !!data.success, configured: true, message: data.message || "" };
  } catch (err) {
    return { success: false, configured: true, message: "Network error. The message wasn't sent." };
  }
}

function initCountUp() {
  const els = document.querySelectorAll("[data-count-to]");
  if (!els.length) return;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    els.forEach((el) => { el.textContent = el.dataset.countTo + (el.dataset.countSuffix || ""); });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      const target = parseInt(el.dataset.countTo, 10);
      const suffix = el.dataset.countSuffix || "";
      const dur = 1200;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

function initSkipLink() {
  const link = document.createElement("a");
  link.href = "#";
  link.className = "skip-link";
  link.textContent = "Skip to content";
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector("main") || document.querySelectorAll("section")[0];
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
  document.body.insertBefore(link, document.body.firstChild);
}

document.addEventListener("DOMContentLoaded", () => {
  initImageSkeletons();
  initDrawers();
  initMobileNav();
  initMagnetic();
  initScrollReveal();
  initTheme();
  initNavShadow();
  initSpotlight();
  initTilt();
  initParallax();
  initSplitText();
  initNavSearch();
  initActiveNav();
  initScrollProgress();
  initCustomCursor();
  initRipple();
  initSkipLink();
  initSmartVideos();
  initCountUp();
  initBackToTop();
  document.querySelectorAll("[data-barcode]").forEach((el) => renderBarcode(el));
});
