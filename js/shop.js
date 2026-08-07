/* ==========================================================================
   STRIDE. Shop.js
   All filtering happens in memory against the PRODUCTS array. Every
   control (checkbox, size chip, swatch, price slider, sort dropdown)
   just updates one `filters` object and calls applyFilters(), no submit
   button anywhere, same "instant" philosophy as everything else in this
   portfolio, applied here to a full product grid instead of a table.
   ========================================================================== */

const filters = {
  categories: new Set(),
  sizes: new Set(),
  colors: new Set(),
  maxPrice: 300,
  sort: "featured",
  query: "",
};

const ALL_SIZES = [6, 7, 8, 9, 10, 11, 12];
const ALL_COLORS = [...new Map(PRODUCTS.flatMap((p) => p.colors).map((c) => [c.name, c])).values()];
const ALL_CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];

function matchesFilters(p) {
  if (filters.categories.size && !filters.categories.has(p.category)) return false;
  if (filters.sizes.size && !p.sizes.some((s) => filters.sizes.has(s))) return false;
  if (filters.colors.size && !p.colors.some((c) => filters.colors.has(c.name))) return false;
  if (p.price > filters.maxPrice) return false;
  if (filters.query) {
    const haystack = (p.name + " " + p.category + " " + p.description).toLowerCase();
    if (!haystack.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

function sortProducts(list) {
  const sorted = [...list];
  if (filters.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (filters.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
  else if (filters.sort === "newest") sorted.sort((a, b) => (a.tag === "New" ? -1 : 1) - (b.tag === "New" ? -1 : 1));
  return sorted;
}

function activeFilterChips() {
  const chips = [];
  if (filters.query) chips.push({ type: "query", value: filters.query, label: `"${filters.query}"` });
  filters.categories.forEach((c) => chips.push({ type: "categories", value: c, label: c }));
  filters.sizes.forEach((s) => chips.push({ type: "sizes", value: s, label: "Size " + s }));
  filters.colors.forEach((c) => chips.push({ type: "colors", value: c, label: c }));
  if (filters.maxPrice < 300) chips.push({ type: "maxPrice", value: 300, label: "Up to $" + filters.maxPrice });
  return chips;
}

function applyFilters() {
  const grid = document.getElementById("shop-grid");
  const results = sortProducts(PRODUCTS.filter(matchesFilters));

  document.getElementById("result-count").textContent = results.length;

  if (!results.length) {
    grid.innerHTML = "";
    document.getElementById("shop-empty").classList.remove("hidden");
    const emptyMsg = document.getElementById("shop-empty-message");
    if (emptyMsg) emptyMsg.textContent = filters.query ? `No shoes match "${filters.query}".` : "No shoes match these filters.";
  } else {
    document.getElementById("shop-empty").classList.add("hidden");
    grid.innerHTML = results.map(productCardHTML).join("");
    initScrollReveal();
  }

  const chipsWrap = document.getElementById("active-chips");
  const chips = activeFilterChips();
  document.getElementById("clear-all-btn").classList.toggle("hidden", chips.length === 0);
  chipsWrap.innerHTML = chips
    .map((c) => `<button class="chip is-active" data-chip-type="${c.type}" data-chip-value="${c.value}">${c.label}<i class="fa-solid fa-xmark"></i></button>`)
    .join("");
}

function buildFilterUI(rootId) {
  const root = document.getElementById(rootId);
  root.innerHTML = `
    <div class="mb-7">
      <p class="font-mono text-[11px] uppercase text-ink-soft mb-3">Category</p>
      <div class="space-y-2">
        ${ALL_CATEGORIES.map(
          (c) => `<label class="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" data-filter="categories" value="${c}" class="h-4 w-4 accent-[var(--ink)]">
            <span class="capitalize">${c}</span>
          </label>`
        ).join("")}
      </div>
    </div>
    <div class="mb-7">
      <p class="font-mono text-[11px] uppercase text-ink-soft mb-3">Size</p>
      <div class="grid grid-cols-4 gap-2">
        ${ALL_SIZES.map((s) => `<button type="button" class="size-chip" data-filter="sizes" value="${s}">${s}</button>`).join("")}
      </div>
    </div>
    <div class="mb-7">
      <p class="font-mono text-[11px] uppercase text-ink-soft mb-3">Color</p>
      <div class="flex flex-wrap gap-3">
        ${ALL_COLORS.map((c) => `<button type="button" class="swatch" data-filter="colors" value="${c.name}" style="background:${c.hex}" title="${c.name}"></button>`).join("")}
      </div>
    </div>
    <div class="mb-2">
      <div class="flex items-center justify-between mb-3">
        <p class="font-mono text-[11px] uppercase text-ink-soft">Max price</p>
        <p class="font-mono text-xs font-bold" id="price-label">$300</p>
      </div>
      <input type="range" min="20" max="300" step="10" value="300" id="price-range" class="w-full">
    </div>`;

  root.querySelectorAll('[data-filter="categories"]').forEach((el) =>
    el.addEventListener("change", () => { el.checked ? filters.categories.add(el.value) : filters.categories.delete(el.value); applyFilters(); })
  );
  root.querySelectorAll('[data-filter="sizes"]').forEach((el) =>
    el.addEventListener("click", () => {
      const v = Number(el.value);
      filters.sizes.has(v) ? filters.sizes.delete(v) : filters.sizes.add(v);
      el.classList.toggle("is-active");
      applyFilters();
    })
  );
  root.querySelectorAll('[data-filter="colors"]').forEach((el) =>
    el.addEventListener("click", () => {
      filters.colors.has(el.value) ? filters.colors.delete(el.value) : filters.colors.add(el.value);
      el.classList.toggle("is-active");
      applyFilters();
    })
  );
  const range = root.querySelector("#price-range");
  range.addEventListener("input", () => {
    filters.maxPrice = Number(range.value);
    root.querySelector("#price-label").textContent = filters.maxPrice >= 300 ? "$300+" : "$" + filters.maxPrice;
    applyFilters();
  });
}

function resetFilterUI() {
  document.querySelectorAll('[data-filter="categories"]').forEach((el) => (el.checked = false));
  document.querySelectorAll('[data-filter="sizes"], [data-filter="colors"]').forEach((el) => el.classList.remove("is-active"));
  document.querySelectorAll("#price-range").forEach((el) => (el.value = 300));
  document.querySelectorAll("#price-label").forEach((el) => (el.textContent = "$300+"));
}

document.addEventListener("DOMContentLoaded", () => {
  buildFilterUI("filters-desktop");
  buildFilterUI("filters-mobile");
  applyFilters();

  initQuickAdd(document.getElementById("shop-grid"));

  document.getElementById("sort-select")?.addEventListener("change", (e) => { filters.sort = e.target.value; applyFilters(); });

  document.getElementById("active-chips").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-chip-type]");
    if (!chip) return;
    const { chipType, chipValue } = chip.dataset;
    if (chipType === "maxPrice") { filters.maxPrice = 300; document.querySelectorAll("#price-range").forEach((el) => (el.value = 300)); document.querySelectorAll("#price-label").forEach((el) => (el.textContent = "$300+")); }
    else if (chipType === "query") { filters.query = ""; const nav = document.getElementById("nav-search"); if (nav) nav.value = ""; }
    else if (chipType === "sizes") { filters.sizes.delete(Number(chipValue)); document.querySelectorAll(`[data-filter="sizes"][value="${chipValue}"]`).forEach((el) => el.classList.remove("is-active")); }
    else if (chipType === "colors") { filters.colors.delete(chipValue); document.querySelectorAll(`[data-filter="colors"][value="${chipValue}"]`).forEach((el) => el.classList.remove("is-active")); }
    else if (chipType === "categories") { filters.categories.delete(chipValue); document.querySelectorAll(`[data-filter="categories"][value="${chipValue}"]`).forEach((el) => (el.checked = false)); }
    applyFilters();
  });

  document.getElementById("clear-all-btn").addEventListener("click", () => {
    filters.categories.clear(); filters.sizes.clear(); filters.colors.clear(); filters.maxPrice = 300; filters.query = "";
    const nav = document.getElementById("nav-search"); if (nav) nav.value = "";
    resetFilterUI();
    applyFilters();
  });
});
