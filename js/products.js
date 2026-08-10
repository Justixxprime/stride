/* ==========================================================================
   STRIDE. Products.js
   One shared catalog. Every page (home, shop, product detail, cart,
   wishlist) reads from this same array, so a price or name only ever
   needs to change in one place.

   `gradient` + `icon` are the fallback look for a product tile before a
   real photo exists. See the note in thumb-art's HTML. Drop a real photo
   at the path in `image` and it takes over automatically.
   ========================================================================== */

const PRODUCTS = [
  {
    id: "nitro-3-running",
    name: "Nitro 3 Running",
    category: "running",
    price: 159.95,
    compareAt: null,
    tag: "New",
    rating: 4.8,
    reviews: 214,
    colors: [{ name: "Frost", hex: "#D9E4EC" }, { name: "Ember", hex: "#E4572E" }],
    sizes: [7, 8, 9, 10, 11],
    outOfStock: [11],
    gradient: "linear-gradient(135deg,#F4A261,#E76F51)",
    image: "images/products/nitro-3-running",
    description: "A running shoe tuned for tempo runs: a springy nitrogen-infused midsole and a mesh upper that breathes on mile eight the same as mile one.",
  },
  {
    id: "flyer-lite-unisex",
    name: "Flyer Lite Unisex",
    category: "lifestyle",
    price: 150.2,
    compareAt: null,
    tag: null,
    rating: 4.6,
    reviews: 132,
    colors: [{ name: "Cloud", hex: "#EDEDED" }, { name: "Lilac", hex: "#B8A6D9" }],
    sizes: [6, 7, 8, 9, 10],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#A8DADC,#457B9D)",
    image: "images/products/flyer-lite-unisex",
    description: "Everyday-light and built to disappear on your foot. The Flyer Lite trades bulk for a low-profile foam stack that still bounces back.",
  },
  {
    id: "rider-fv-sneakers",
    name: "Rider FV Sneakers",
    category: "lifestyle",
    price: 250.0,
    compareAt: 290.0,
    tag: "Sale",
    rating: 4.9,
    reviews: 341,
    colors: [{ name: "Sunset", hex: "#F4A261" }, { name: "Ink", hex: "#22223B" }],
    sizes: [7, 8, 9, 10, 11, 12],
    outOfStock: [7],
    gradient: "linear-gradient(135deg,#9D4EDD,#5A189A)",
    image: "images/products/rider-fv-sneakers",
    description: "The silhouette that started it all. Full-length cushioning under a knit upper built to move with your foot, not against it.",
  },
  {
    id: "fandom-suede",
    name: "Fandom Suede Shoes",
    category: "casual",
    price: 120.95,
    compareAt: null,
    tag: null,
    rating: 4.5,
    reviews: 88,
    colors: [{ name: "Sand", hex: "#D8C3A5" }, { name: "Forest", hex: "#3A5A40" }],
    sizes: [6, 7, 8, 9, 10],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#8ECAE6,#219EBC)",
    image: "images/products/fandom-suede",
    description: "A soft suede upper over a stripped-back sole. Built for the days that don't need a running shoe, just a good one.",
  },
  {
    id: "velocity-nitro",
    name: "Velocity Nitro Shoes",
    category: "running",
    price: 110.3,
    compareAt: null,
    tag: "Bestseller",
    rating: 4.7,
    reviews: 502,
    colors: [{ name: "Volt", hex: "#D7FF3F" }, { name: "Charcoal", hex: "#333333" }],
    sizes: [7, 8, 9, 10, 11],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#FF6B6B,#C44569)",
    image: "images/products/velocity-nitro",
    description: "The pace shoe. A carbon-infused plate under the forefoot for a toe-off that feels like a rebound.",
  },
  {
    id: "fast-trac-apex",
    name: "Fast-Trac Apex Nitro",
    category: "trail",
    price: 130.0,
    compareAt: null,
    tag: null,
    rating: 4.4,
    reviews: 76,
    colors: [{ name: "Clay", hex: "#B5651D" }, { name: "Moss", hex: "#606C38" }],
    sizes: [8, 9, 10, 11, 12],
    outOfStock: [12],
    gradient: "linear-gradient(135deg,#F72585,#7209B7)",
    image: "images/products/fast-trac-apex",
    description: "An aggressive lug pattern for loose trail, wrapped around the same cushioned platform as the road shoes.",
  },
  {
    id: "aero-knit-runner",
    name: "Aero Knit Runner",
    category: "running",
    price: 139.5,
    compareAt: null,
    tag: "New",
    rating: 4.6,
    reviews: 59,
    colors: [{ name: "Sky", hex: "#90E0EF" }, { name: "Coral", hex: "#FF6B6B" }],
    sizes: [7, 8, 9, 10],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#00B4D8,#0077B6)",
    image: "images/products/aero-knit-runner",
    description: "A one-piece knit upper with zero seams against the foot, paired with a midsole tuned for daily mileage.",
  },
  {
    id: "urban-glide-low",
    name: "Urban Glide Low",
    category: "casual",
    price: 98.0,
    compareAt: 128.0,
    tag: "Sale",
    rating: 4.3,
    reviews: 145,
    colors: [{ name: "Bone", hex: "#EDE6D6" }, { name: "Ink", hex: "#22223B" }],
    sizes: [6, 7, 8, 9, 10, 11],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#FFB4A2,#E5989B)",
    image: "images/products/urban-glide-low",
    description: "Low-profile and clean, built for the days your feet are the last thing on your mind.",
  },
  {
    id: "peak-trail-mid",
    name: "Peak Trail Mid",
    category: "trail",
    price: 175.0,
    compareAt: null,
    tag: null,
    rating: 4.8,
    reviews: 61,
    colors: [{ name: "Slate", hex: "#5C677D" }, { name: "Rust", hex: "#BC6C25" }],
    sizes: [8, 9, 10, 11],
    outOfStock: [8],
    gradient: "linear-gradient(135deg,#606C38,#283618)",
    image: "images/products/peak-trail-mid",
    description: "Ankle support and an aggressive outsole for the trail days that go past the marked path.",
  },
  {
    id: "featherform-slip",
    name: "Featherform Slip-On",
    category: "casual",
    price: 84.0,
    compareAt: null,
    tag: null,
    rating: 4.2,
    reviews: 39,
    colors: [{ name: "Cream", hex: "#F1E9DB" }, { name: "Olive", hex: "#606C38" }],
    sizes: [6, 7, 8, 9],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#CDB4DB,#FFC8DD)",
    image: "images/products/featherform-slip",
    description: "No laces, no fuss. A stretch collar and a foam footbed that feels broken-in on day one.",
  },
  {
    id: "quantum-pulse",
    name: "Quantum Pulse Trainer",
    category: "running",
    price: 168.0,
    compareAt: null,
    tag: "Bestseller",
    rating: 4.9,
    reviews: 410,
    colors: [{ name: "Volt", hex: "#D7FF3F" }, { name: "Grape", hex: "#7209B7" }],
    sizes: [7, 8, 9, 10, 11, 12],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#3A0CA3,#4361EE)",
    image: "images/products/quantum-pulse",
    description: "The everyday trainer built to keep up with speed work one day and a long slow run the next.",
  },
  {
    id: "drift-canvas",
    name: "Drift Canvas Low",
    category: "casual",
    price: 76.5,
    compareAt: 92.0,
    tag: "Sale",
    rating: 4.1,
    reviews: 97,
    colors: [{ name: "White", hex: "#F8F9FA" }, { name: "Navy", hex: "#22223B" }],
    sizes: [6, 7, 8, 9, 10],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#8D99AE,#2B2D42)",
    image: "images/products/drift-canvas",
    description: "A canvas upper over a vulcanized sole. Simple, and built to actually wear in over a summer.",
  },
  {
    id: "coastal-slide",
    name: "Coastal Slide Sandal",
    category: "casual",
    price: 44.0,
    compareAt: null,
    tag: "New",
    rating: 4.4,
    reviews: 68,
    colors: [{ name: "Sand", hex: "#E9D8A6" }, { name: "Ocean", hex: "#3A86FF" }],
    sizes: [7, 8, 9, 10, 11, 12],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#3A86FF,#0B3D91)",
    image: "images/products/coastal-slide",
    description: "A contoured footbed slide for the walk from the car to the sand and back. Quick-dry straps, zero break-in time.",
  },
  {
    id: "summit-trekker",
    name: "Summit Trekker",
    category: "trail",
    price: 189.0,
    compareAt: null,
    tag: "Bestseller",
    rating: 4.9,
    reviews: 301,
    colors: [{ name: "Slate", hex: "#4A4E69" }, { name: "Rust", hex: "#B5651D" }],
    sizes: [7, 8, 9, 10, 11, 12],
    outOfStock: [7],
    gradient: "linear-gradient(135deg,#4A4E69,#22223B)",
    image: "images/products/summit-trekker",
    description: "A full boot for switchbacks and scree. Aggressive lugs, a reinforced toe cap, and a collar tall enough to keep the gravel out.",
  },
  {
    id: "pulse-court-mid",
    name: "Pulse Court Mid",
    category: "lifestyle",
    price: 134.5,
    compareAt: null,
    tag: null,
    rating: 4.5,
    reviews: 89,
    colors: [{ name: "Ink", hex: "#0B0B0C" }, { name: "Crimson", hex: "#D00000" }],
    sizes: [7, 8, 9, 10, 11],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#D00000,#370617)",
    image: "images/products/pulse-court-mid",
    description: "Mid-cut ankle support with a wide platform for quick cuts. Built for the court, worn well past it.",
  },
  {
    id: "featherweight-sprint",
    name: "Featherweight Sprint",
    category: "running",
    price: 172.0,
    compareAt: null,
    tag: "New",
    rating: 4.7,
    reviews: 56,
    colors: [{ name: "Volt", hex: "#D7FF3F" }, { name: "Cloud", hex: "#F7F5EF" }],
    sizes: [6, 7, 8, 9, 10, 11],
    outOfStock: [6],
    gradient: "linear-gradient(135deg,#D7FF3F,#606C38)",
    image: "images/products/featherweight-sprint",
    description: "Race-day light at under 200 grams. A thin, propulsive plate and almost no shoe between you and the road.",
  },
  {
    id: "boulevard-chelsea",
    name: "Boulevard Chelsea",
    category: "casual",
    price: 128.0,
    compareAt: 160.0,
    tag: "Sale",
    rating: 4.3,
    reviews: 74,
    colors: [{ name: "Espresso", hex: "#3E2723" }, { name: "Black", hex: "#0B0B0C" }],
    sizes: [7, 8, 9, 10, 11],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#3E2723,#1B120E)",
    image: "images/products/boulevard-chelsea",
    description: "A sneaker cut like a dress shoe. Clean welt, no laces, and a sole quiet enough for an office you still have to bike to.",
  },
  {
    id: "ridgeline-gtx",
    name: "Ridgeline GTX",
    category: "trail",
    price: 205.0,
    compareAt: null,
    tag: "Bestseller",
    rating: 4.8,
    reviews: 143,
    colors: [{ name: "Moss", hex: "#606C38" }, { name: "Charcoal", hex: "#283618" }],
    sizes: [8, 9, 10, 11, 12],
    outOfStock: [12],
    gradient: "linear-gradient(135deg,#606C38,#283618)",
    image: "images/products/ridgeline-gtx",
    description: "A waterproof membrane and an outsole cut for wet rock. The trail doesn't stop for weather, so neither does this.",
  },
  {
    id: "retro-88-classic",
    name: "Retro 88 Classic",
    category: "lifestyle",
    price: 98.0,
    compareAt: null,
    tag: null,
    rating: 4.6,
    reviews: 187,
    colors: [{ name: "Cream", hex: "#F7F5EF" }, { name: "Forest", hex: "#283618" }],
    sizes: [6, 7, 8, 9, 10, 11],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#F4A261,#9D4EDD)",
    image: "images/products/retro-88-classic",
    description: "The court silhouette from the year everything changed, reissued true to the original pattern down to the stitch count.",
  },
  {
    id: "cloudwalk-slip",
    name: "Cloudwalk Slip",
    category: "casual",
    price: 68.0,
    compareAt: null,
    tag: "New",
    rating: 4.4,
    reviews: 41,
    colors: [{ name: "Fog", hex: "#B8C0C2" }, { name: "Blush", hex: "#F4A9A8" }],
    sizes: [6, 7, 8, 9, 10],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#B8C0C2,#6C757D)",
    image: "images/products/cloudwalk-slip",
    description: "No laces, no fuss. A stretch knit collar and a memory-foam footbed for the errands that don't need a whole production.",
  },
  {
    id: "terra-cross-trainer",
    name: "Terra Cross Trainer",
    category: "running",
    price: 145.0,
    compareAt: null,
    tag: null,
    rating: 4.5,
    reviews: 112,
    colors: [{ name: "Clay", hex: "#B5651D" }, { name: "Steel", hex: "#495057" }],
    sizes: [7, 8, 9, 10, 11, 12],
    outOfStock: [],
    gradient: "linear-gradient(135deg,#B5651D,#6F4518)",
    image: "images/products/terra-cross-trainer",
    description: "Lateral stability for lifting days, enough cushion for the mile you tack on after. One shoe for a mixed session.",
  },
  {
    id: "nightfall-high",
    name: "Nightfall High",
    category: "lifestyle",
    price: 156.0,
    compareAt: null,
    tag: null,
    rating: 4.6,
    reviews: 63,
    colors: [{ name: "Ink", hex: "#0B0B0C" }, { name: "Grape", hex: "#7209B7" }],
    sizes: [7, 8, 9, 10, 11],
    outOfStock: [8],
    gradient: "linear-gradient(135deg,#7209B7,#3A0CA3)",
    image: "images/products/nightfall-high",
    description: "A high-top collar padded enough to forget it's there. Premium leather panels that only look better with a scuff or two.",
  },
];

const GIFT_CARDS = [
  { id: "gift-card-25", name: "Stride Gift Card ($25)", category: "gift-card", price: 25, gradient: "linear-gradient(135deg,#D7FF3F,#606C38)", image: null, description: "Digital gift card, delivered by email. Never expires." },
  { id: "gift-card-50", name: "Stride Gift Card ($50)", category: "gift-card", price: 50, gradient: "linear-gradient(135deg,#4CC9F0,#3A0CA3)", image: null, description: "Digital gift card, delivered by email. Never expires." },
  { id: "gift-card-100", name: "Stride Gift Card ($100)", category: "gift-card", price: 100, gradient: "linear-gradient(135deg,#FF4B2B,#7209B7)", image: null, description: "Digital gift card, delivered by email. Never expires." },
  { id: "gift-card-150", name: "Stride Gift Card ($150)", category: "gift-card", price: 150, gradient: "linear-gradient(135deg,#F72585,#3A0CA3)", image: null, description: "Digital gift card, delivered by email. Never expires." },
];

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || GIFT_CARDS.find((p) => p.id === id);
}
function formatPrice(n) {
  return "$" + n.toFixed(2);
}

const TAG_STYLE = {
  New: "pill-dark",
  Sale: "pill" ,
  Bestseller: "pill-volt",
};

/**
 * The product card used on the homepage, the shop grid, wishlist, and
 * "related products" rows. Front image is `image`; hovering swaps to a
 * second, slightly different framing built from the same fallback
 * gradient (a stand-in for a real "back of shoe" photo at
 * `image-alt.jpg`. See GUIDE.md for how to wire in real alternate shots).
 */
function productCardHTML(p) {
  const wished = isWishlisted ? isWishlisted(p.id) : false;
  const tagHTML = p.tag ? `<span class="pill ${TAG_STYLE[p.tag]} absolute top-3 left-3 z-10">${p.tag}</span>` : "";
  const priceHTML = p.compareAt
    ? `<span class="font-mono text-sm font-bold text-flame">${formatPrice(p.price)}</span> <span class="font-mono text-xs text-ink-soft line-through">${formatPrice(p.compareAt)}</span>`
    : `<span class="font-mono text-sm font-bold">${formatPrice(p.price)}</span>`;

  return `
    <div class="product-card" data-reveal>
      <a href="product.html?id=${p.id}" class="block">
        <div class="thumb-art tile relative" style="background:${p.gradient}">
          ${tagHTML}
          <button data-wish-btn="${p.id}" class="wish-btn icon-btn !h-9 !w-9 !border-0 bg-white/90 backdrop-blur ${wished ? "is-active" : ""}" aria-label="Add to wishlist">
            <i class="${wished ? "fa-solid" : "fa-regular"} fa-heart text-xs"></i>
          </button>
          ${smartImgTag(p.image, p.name, 'loading="lazy" class="product-photo"')}
          <i class="fa-solid fa-shoe-prints thumb-fallback-icon"></i>
          <button class="quick-view-btn icon-btn !h-9 !w-9 !border-0 bg-white/90 backdrop-blur z-10" data-quick-view="${p.id}" aria-label="Quick view" style="color:#0B0B0C">
            <i class="fa-regular fa-eye text-xs"></i>
          </button>
          <button class="quick-add btn btn-ink !py-1.5 !px-3 !text-[10px] sm:!py-2.5 sm:!px-5 sm:!text-xs" data-quick-add="${p.id}">Quick add <i class="fa-solid fa-plus ml-1"></i></button>
        </div>
      </a>
      <div class="mt-3 flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <a href="product.html?id=${p.id}" class="text-sm font-semibold hover:underline block truncate">${p.name}</a>
          <p class="font-mono text-[10px] text-ink-soft uppercase mt-0.5">${p.category}</p>
        </div>
        <div class="text-right shrink-0 whitespace-nowrap">${priceHTML}</div>
      </div>
      <button type="button" data-compare-toggle="${p.id}" class="chip !text-[10px] !py-1 !px-2.5 mt-2">+ Compare</button>
    </div>`;
}

/** Wires up every ".quick-add" button in a freshly-rendered grid: adds
 * the product's first available size/color straight to the cart, plays
 * the fly-to-cart animation from that card's thumbnail, and opens the
 * cart drawer briefly so the addition is obvious. */
function initQuickAdd(containerEl) {
  if (typeof syncCompareUI === "function") syncCompareUI();
  containerEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-quick-add]");
    if (!btn) return;
    e.preventDefault();
    const p = findProduct(btn.dataset.quickAdd);
    if (!p) return;
    const size = p.sizes.find((s) => !p.outOfStock.includes(s));
    const color = p.colors[0].name;
    const thumb = btn.closest(".product-card")?.querySelector(".thumb-art");
    if (thumb) flyToCart(thumb);
    addToCart(p.id, size, color, 1);
    toast(`${p.name} added to bag`);
  });
}
