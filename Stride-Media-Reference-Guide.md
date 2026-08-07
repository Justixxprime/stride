# Stride — Full Video & Photo Reference Guide
One by one, every media slot on the site: what file goes where, what should be happening in it, search keywords to find a free stock match, and baby-step advice to make the whole site feel exotic, premium, high-tech, and alive.

## How the file-drop system works (read this once)
Every image and video slot on Stride already has a *smart loader* wired up — you never touch code, you just drop a correctly-named file into `/images/` or `/videos/` and it appears.

- **Images** — drop a file named exactly like the slot's base name, with any of: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`. The site tries them in that order and uses the first one that exists. `.webp` is the best balance of quality and file size for photography.
- **Videos** — drop `.mp4` first (universal support), and ideally also a `.webm` (smaller, sharper at the same file size). If no video is present, the site falls back to a still poster image, then to the gradient/icon placeholder that's already there today — so nothing ever looks "broken," it just looks less rich until you add the real thing.
- **Where to put them** — exactly the path shown, relative to the site root: `images/hero-shoe.jpg` goes in the `images/` folder, `videos/hero-loop.mp4` goes in `videos/`. Product photos go in `images/products/`, category tiles in `images/categories/`.
- **Aim for HD, not huge** — 1600–2000px on the long edge for images, 1080p (not 4K) for videos, compressed well. That's what reads as "high-tech and crisp" on screen without slow-loading a portfolio site.

## Where to find free stock (read this once too)
Since you're downloading rather than shooting, these are the best free libraries — all have shoe/fashion/sneaker content and all offer free commercial-use licenses (double-check the license note on each individual file before using it, since terms occasionally vary file-to-file):

**For photos:**
- **Pexels** (pexels.com) — the deepest sneaker/shoe catalog of the free sites, great studio product shots
- **Unsplash** (unsplash.com) — best for moody/editorial/lifestyle shots, less good for clean product-on-white
- **Pixabay** (pixabay.com) — huge volume, hit-or-miss quality, good for texture/detail/macro shots

**For video:**
- **Pexels Videos** (pexels.com/videos) — same site as the photos, best first stop for shoe motion/turntable clips
- **Pixabay Videos** (pixabay.com/videos)
- **Coverr** (coverr.co) — curated, cinematic, great for mood/atmosphere clips (auth pages, hero loops)
- **Mixkit** (mixkit.co) — clean, modern stock video, good for product/lifestyle

**How to search effectively:** stock libraries respond much better to short, literal keyword phrases than full sentences — use the **Search:** line under each item below exactly as written, then swap in your own words if the results don't fit. Search the video sites and photo sites separately even for the same subject, since their catalogs don't overlap.

---

## SECTION 1 — VIDEOS (9 total, one by one)

### 1. `videos/hero-loop` — Homepage hero background
**Where:** The very first thing anyone sees, full-bleed behind "REIMAGINED COMFORT."
**What's happening in it:** A single shoe in slow motion — a foot pushing off the ground, laces tightening in close-up, or a shoe rotating on a turntable with light sweeping across it. 6–10 second seamless loop, no visible cut when it repeats.
**Search:** `sneaker slow motion`, `running shoe turntable`, `shoe product video dark background`
**Baby steps to make it exotic:** Look for dark or gradient-lit backgrounds (matches the site's existing dark hero panels) and slow, steady camera moves rather than shaky handheld — that's the "high-tech product launch" look, not a lifestyle catalog look.

### 2. `videos/about-workshop` — About page
**Where:** The About page, next to the brand story.
**What's happening in it:** The "making of" — hands stitching, cutting foam, or a workbench with tools and half-built shoes. The human/craft counterpart to the hero's high-tech product shot.
**Search:** `shoemaker workshop`, `hands stitching leather`, `shoe factory craftsman`, `cobbler workbench`
**Baby steps:** Favor warm, practical-looking light over cold studio light — this one should feel handmade and intimate.

### 3. `videos/journal-featured` — Journal/blog landing page
**Where:** The big featured-article banner at the top of the Journal page.
**What's happening in it:** Whatever the top story is about — runners on a trail at golden hour, or a shoe on a design desk with sketches. Treat it like a magazine cover video.
**Search:** `runner golden hour trail`, `sneaker design sketch desk`, `running athlete sunrise`
**Baby steps:** Keep a small folder of 2–3 alternates so you can swap this to match whichever article is currently featured.

### 4. `videos/auth-login` — Login page side panel
**Where:** The decorative right-hand panel on the login screen (desktop only).
**What's happening in it:** Abstract, moody brand visuals — colored light, fabric texture, or a shoe emerging from shadow. Mood, not information.
**Search:** `abstract purple light background`, `moody smoke light loop`, `sneaker shadow reveal`
**Baby steps:** This is your most "exotic" slot — search for purple/magenta/blue-toned clips to match the gradient already coded there.

### 5. `videos/auth-signup` — Signup page side panel
**Where:** Same idea as login, opposite page.
**What's happening in it:** Same treatment as login, with a warm color story instead (the code already has an orange/coral gradient here vs. login's purple).
**Search:** `abstract warm orange light background`, `golden hour smoke loop`, `sunrise gradient background video`
**Baby steps:** If you're short on options, the exact same clip as auth-login often works here too — just look for one with a color-graded/warm-toned alternate, or pick a second clip with warm tones from the start.

### 6. `videos/lookbook-1` — Lookbook editorial opener
**Where:** First full-bleed panel on the Lookbook page.
**What's happening in it:** Editorial fashion-film energy — a model walking, a shoe in an interesting environment, intentionally artistic framing.
**Search:** `fashion film sneaker street`, `model walking city street slow motion`, `streetwear editorial video`
**Baby steps:** This is the one slot where you can pick something genuinely artistic/unusual — lookbook pages are where a brand shows off, not sells.

### 7. `videos/shop-banner` — Shop page top banner
**Where:** Wide banner above the product grid on the Shop page.
**What's happening in it:** Energetic, motion-heavy — multiple shoes flashing past, or a single shoe spinning fast with light trails.
**Search:** `sneaker light trails`, `product spin fast motion`, `dynamic sneaker collage video`
**Baby steps:** Look for faster-paced clips here than the hero video — this banner's job is pure energy, not cinematic calm.

### 8. `videos/sustainability` — Sustainability page
**Where:** Full-bleed video on the Sustainability page.
**What's happening in it:** Materials and process — recycled materials, an eco-sole close-up, plants/nature intercut with a factory floor.
**Search:** `recycled materials factory`, `sustainable manufacturing`, `eco friendly production close up`, `plant nature macro`
**Baby steps:** Natural light, green/earth tones, slower pacing — this page is about trust, not hype.

### 9. `videos/product-{product-id}` — Every individual product page (one per product, 22 total)
**Where:** The circular "motion" video that plays over the main image on each product detail page — the id comes from the product (e.g. `videos/product-nitro-3-running`).
**What's happening in it:** A short, tight loop of a single shoe — rotating on a turntable, or a close detail like the sole flexing or laces tightening.
**Search:** `sneaker turntable 360`, `shoe rotating white background`, `running shoe product spin`
**Baby steps, applies to all 22 products the same way:**
- Since you're sourcing stock rather than shooting your own, you likely can't get a turntable clip of *your specific* shoe design — the realistic approach is to pick **one clean, generic sneaker-turntable clip** and reuse it across every product page (or a small handful of clips split across running/trail/lifestyle/casual). Consistency matters more than uniqueness here.
- If you can only source a few, prioritize whichever products are tagged `"New"` — every product without a video just quietly falls back to its static photo, so a partial rollout is completely safe.

---

## SECTION 2 — FULL-BLEED HERO / EDITORIAL IMAGES (one by one)

### 10. `images/hero-shoe` — Homepage hero, main shoe image
**Where:** Sits in the same slot as the hero video, used if no video is present.
**What's happening:** A single hero-product still, same styling notes as `videos/hero-loop` above.
**Search:** `sneaker studio dark background`, `running shoe dramatic lighting`, `sneaker product photography black background`

### 11. `images/hero-2` and 12. `images/hero-3` — Homepage supporting hero shots
**Where:** The small grid under/beside the main hero.
**What's happening:** Two more angles or two more products, in a similar mood to the main hero image.
**Search:** `sneaker 3/4 angle studio`, `sneaker close up stitching detail`, `shoe sole macro texture`
**Baby steps:** Pick images with similar lighting/background tone to slot 10 (dark or neutral studio) so the trio reads as one shoot, not three random finds.

### 13. `images/comfort-1`, 14. `images/comfort-2`, 15. `images/comfort-3` — "Why Stride" feature cards
**Where:** Three small feature cards on the homepage explaining comfort/quality.
**What's happening:** Close, tactile detail shots — cushioned insole, breathable mesh, midsole foam. Sell a *feeling*, not the whole shoe.
**Search:** `shoe insole close up`, `breathable mesh fabric macro`, `foam midsole cross section`, `sneaker cushion detail`
**Baby steps:** Look for soft, even lighting (no hard shadows) — that's what reads as "clean and premium" rather than dramatic.

### 16. `images/about-shoe` — About page intro
**Where:** Next to the About Us story text.
**What's happening:** A portrait-style shot of a signature shoe, more editorial than catalog.
**Search:** `sneaker artistic portrait`, `shoe editorial photography moody`

### 17. `images/about-wide` — About page wide banner
**Where:** Full-width banner on the About page (ultra-wide crop).
**What's happening:** A wide establishing shot — a workshop, a team at work, or a wide product flat-lay.
**Search:** `shoe workshop wide shot`, `sneaker flat lay collection`, `shoe factory interior wide`
**Baby steps:** Because the crop is so wide, pick an image with its main subject centered — anything important near the left/right edges will get cropped on some screens.

### 18. `images/lookbook-1`, 19. `images/lookbook-2`, 20. `images/lookbook-3` — Lookbook full-bleed panels
**Where:** Three large editorial panels down the Lookbook page.
**What's happening:** Fashion-editorial shots — models wearing shoes in real settings — each panel a different mood/location.
**Search:** `streetwear sneaker fashion`, `outdoor lifestyle sneaker photography`, `studio fashion sneaker bold color background`
**Baby steps:** Deliberately pick three with different settings (urban / outdoor-nature / bold studio color) so scrolling feels like flipping through a magazine instead of seeing the same shot three times.

### 21. `images/lookbook-g1`, 22. `images/lookbook-g2`, 23. `images/lookbook-g3`, 24. `images/lookbook-g4` — Lookbook "Behind the shots" grid
**Where:** A 4-image grid near the bottom of the Lookbook page. Each tile links straight through to one specific product page:
- `lookbook-g1` → **Nitro 3 Running**
- `lookbook-g2` → **Coastal Slide Sandal**
- `lookbook-g3` → **Terra Cross Trainer**
- `lookbook-g4` → **Nightfall High**

**What's happening:** Candid, "behind the scenes" style shots — a photographer's-eye view, a shoe mid-shoot with lighting gear visible.
**Search:** `behind the scenes photo shoot`, `product photography studio setup`, `photographer shooting sneaker`
**Baby steps:** Try to loosely match each tile's shoe type to its linked product (a running shoe photographed for g1, a sandal/beach setting for g2, etc.) so the click-through doesn't feel like a mismatch.

### 25. `images/drops/vol-01`, 26. `images/drops/vol-02`, 27. `images/drops/vol-03` — Limited Drops page
**Where:** Three drop-collection cards (Vol. 01, Vol. 02, Vol. 03 — Vol. 03 marked "coming soon").
**What's happening:** Each volume gets its own bold hero shot — think album covers for a shoe collection.
**Search:** `bold sneaker studio color background`, `sneaker dramatic colored lighting`, `shoe silhouette shadow`
**Baby steps:** For Vol. 03 ("coming soon"), search specifically for a silhouette/shadow/motion-blur shot rather than a clean reveal — the mystery is the point.

### 28. `images/shop-banner` — Shop page banner (image fallback for the video)
**Where:** Same slot as `videos/shop-banner`, used if no video is present.
**What's happening:** A single dynamic still — multiple products, or one product with strong motion blur/light trails.
**Search:** `sneaker light trails photography`, `dynamic sneaker collage`

### 29. `images/journal-featured` — Journal banner (image fallback)
**Where:** Same slot as `videos/journal-featured`.
**What's happening:** A still matching whatever your current featured article is about.
**Search:** `runner golden hour`, `sneaker design desk sketch`

### 30. `images/auth-login` and 31. `images/auth-signup` — Login/Signup panels (image fallback)
**Where:** Same slots as the two auth videos.
**What's happening:** Stills matching those same moody/atmospheric visuals — purple for login, warm coral for signup.
**Search:** `abstract purple gradient background` (login), `abstract warm gradient background` (signup)

### 32. `images/products/quantum-pulse` — Homepage featured product
**Where:** A specifically-featured hero product shot on the homepage.
**What's happening:** Your single "flagship" product shot — the best photo on the whole site.
**Search:** `premium sneaker studio green` (matches its Volt/Grape color story), `sneaker hero shot dramatic light`

---

## SECTION 3 — CATEGORY TILES / MEGA-MENU (4 total)
**Where:** The "Shop" dropdown mega-menu in the header (desktop) — 4 category tiles: Running, Trail, Lifestyle, Casual.

### 33. `images/categories/running`
**What's happening:** Mid-stride motion on a track or road, shoe visibly in action.
**Search:** `runner mid stride track`, `running shoes action shot`

### 34. `images/categories/trail`
**What's happening:** Outdoors, texture-heavy terrain — a shoe gripping uneven ground.
**Search:** `trail running shoe mud`, `hiking boot rocky terrain`

### 35. `images/categories/lifestyle`
**What's happening:** Street style — a shoe as part of an outfit in an urban setting.
**Search:** `sneaker streetwear outfit`, `urban fashion sneaker`

### 36. `images/categories/casual`
**What's happening:** Relaxed, everyday context — a shoe by a door, on a porch, warm and unhurried.
**Search:** `casual shoes relaxed lifestyle`, `slip on shoes home`
**Baby steps for all 4 together:** Pick images with visibly different color temperatures (cool/blue for running, earthy for trail, neutral for lifestyle, warm for casual) so even as small dropdown thumbnails they're instantly tellable apart.

---

## SECTION 4 — PRODUCT PHOTOGRAPHY (all 22 products, one by one)
Every product supports up to 4 photos: `images/products/{product-id}.jpg`, `-2.jpg`, `-3.jpg`, `-4.jpg`. The **same 4-shot formula** applies to every product — listing every one below so none get missed, each with its category, color story, and a matching search phrase.

**The 4-shot formula (repeat for every product):**
1. **Slot 1 (cover shot)** — 3/4 angle, clean background. Shown everywhere on the site, so get this one right first.
2. **Slot 2** — straight-on side profile.
3. **Slot 3** — a detail/texture close-up (sole tread, laces, logo).
4. **Slot 4** — an on-foot or lifestyle context shot.

**A practical note on stock vs. real products:** free stock libraries won't have a photo of your exact fictional shoe by name — search by *category + color* instead (the phrases below) and pick the closest visual match, then stay consistent about which stock shoe you use across all 4 slots for that one product.

| # | Product ID | Name | Category | Color story | Search keywords |
|---|---|---|---|---|---|
| 37 | `nitro-3-running` | Nitro 3 Running | Running | Frost / Ember | `running shoe orange`, `sneaker grey orange studio` |
| 38 | `flyer-lite-unisex` | Flyer Lite Unisex | Lifestyle | Cloud / Lilac | `white sneaker minimal`, `purple sneaker studio` |
| 39 | `rider-fv-sneakers` | Rider FV Sneakers | Lifestyle | Sunset / Ink | `bold color sneaker studio`, `black sneaker dramatic` |
| 40 | `fandom-suede` | Fandom Suede Shoes | Casual | Sand / Forest | `suede shoes tan`, `suede sneaker texture` |
| 41 | `velocity-nitro` | Velocity Nitro Shoes | Running | Volt / Charcoal | `neon green running shoe`, `high contrast sneaker studio` |
| 42 | `fast-trac-apex` | Fast-Trac Apex Nitro | Trail | Clay / Moss | `trail running shoe orange`, `trail shoe green outdoor` |
| 43 | `aero-knit-runner` | Aero Knit Runner | Running | Sky / Coral | `knit running shoe blue`, `mesh sneaker bright` |
| 44 | `urban-glide-low` | Urban Glide Low | Casual | Bone / Ink | `minimal low top sneaker`, `black white sneaker street` |
| 45 | `peak-trail-mid` | Peak Trail Mid | Trail | Slate / Rust | `hiking boot grey`, `trail shoe rust orange` |
| 46 | `featherform-slip` | Featherform Slip-On | Casual | Cream / Olive | `slip on shoe cream`, `slip on sneaker olive green` |
| 47 | `quantum-pulse` | Quantum Pulse Trainer | Running | Volt / Grape | `neon green purple sneaker`, `premium running shoe studio` |
| 48 | `drift-canvas` | Drift Canvas Low | Casual | White / Navy | `canvas sneaker white`, `canvas shoe navy blue` |
| 49 | `coastal-slide` | Coastal Slide Sandal | Casual | Sand / Ocean | `slide sandals beach`, `sandals sand blue` |
| 50 | `summit-trekker` | Summit Trekker | Trail | Slate / Rust | `hiking boot trail grey`, `trekking shoe outdoor` |
| 51 | `pulse-court-mid` | Pulse Court Mid | Lifestyle | Ink / Crimson | `retro basketball sneaker`, `court shoe red black` |
| 52 | `featherweight-sprint` | Featherweight Sprint | Running | Volt / Cloud | `lightweight running shoe green`, `sprint shoe white` |
| 53 | `boulevard-chelsea` | Boulevard Chelsea | Casual | Espresso / Black | `chelsea boot brown leather`, `leather boot black` |
| 54 | `ridgeline-gtx` | Ridgeline GTX | Trail | Moss / Charcoal | `rugged hiking boot green`, `waterproof trail boot` |
| 55 | `retro-88-classic` | Retro 88 Classic | Lifestyle | Cream / Forest | `retro sneaker 80s`, `vintage style sneaker green` |
| 56 | `cloudwalk-slip` | Cloudwalk Slip | Casual | Fog / Blush | `minimal slip on shoe grey`, `pastel sneaker soft` |
| 57 | `terra-cross-trainer` | Terra Cross Trainer | Running | Clay / Steel | `cross trainer shoe orange`, `off road running shoe` |
| 58 | `nightfall-high` | Nightfall High | Lifestyle | Ink / Grape | `high top sneaker black purple`, `dark moody sneaker studio` |

**Note on getting the IDs exactly right:** the filename must match the product's `id` field exactly (the left column above) — that's how the smart-loader finds the right photo for the right product automatically, no code changes needed.

---

## Pulling it all together — the "exotic, premium, high-tech" throughline
1. **Pick a consistent visual style across the products you source** (studio-white vs. dark-dramatic vs. color-block) so the catalog reads as one curated collection instead of a patchwork of random stock finds.
2. **Let each page's mood stay distinct** — hero/product = high-tech and crisp, About/Sustainability = warm and human, Lookbook = editorial, auth pages = moody/atmospheric.
3. **Motion where it's cheap, stillness where it matters** — video slots (hero, shop banner, product turntables) are where a subtle loop earns the most "wow" for the least effort; everywhere else, a great still photo does the job.
4. **HD but compressed** — 1600–2000px images, 1080p video, exported efficiently, so the site stays fast *and* looks high-tech.
5. **License check habit** — even on free sites, glance at the license line on each file before download (almost everything on Pexels/Pixabay/Unsplash/Coverr/Mixkit is free for commercial use with no attribution required, but it takes five seconds to confirm and saves a headache later).
