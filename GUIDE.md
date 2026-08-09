# Stride — the complete beginner's guide

Same approach as the guides for your other two portfolio projects: read
this top to bottom once, then use it as a reference. Everything here is
plain HTML + Tailwind (via CDN, no build step) + hand-written JavaScript —
no shopping cart library, no framework, no backend. Every "order" and every
saved wishlist item lives in this browser's `localStorage`, which is
exactly what makes it safe to demo without a real payment system behind it.

---

## 1. What's in the folder, and why

```
stride/
├── index.html               ← homepage: hero, About, featured products, newsletter
├── shop.html                   ← full catalog with filters, sort, search
├── product.html                   ← single product page (reads ?id=... from the URL)
├── build.html                        ← Build Your Own configurator
├── journal.html                         ← editorial posts
├── how-its-built.html                      ← visitor-facing technical walkthrough
├── lookbook.html                              ← editorial full-bleed pages with parallax
├── faq.html                                      ← accordion FAQ
├── login.html                                       ← mock sign-in
├── signup.html                                          ← mock account creation
├── cart.html                                                ← full-page bag (the drawer is the quick version)
├── checkout.html                                               ← 3-step checkout wizard
├── order-confirmation.html                                        ← success page after checkout
├── wishlist.html                                                     ← saved items
├── account.html                                                         ← profile + order history + tracking + appearance
├── about.html                                                              ← brand story page
├── contact.html                                                               ← contact form + direct links
├── 404.html                                                                      ← not-found page (with an easter egg)
├── css/
│   └── style.css                                                                   ← the whole design system
├── js/
│   ├── site.js                                                                        ← shared: theme, drawers, cursor, transitions, reveal, ripple, scroll progress
│   ├── auth.js                                                                           ← mock login/session state
│   ├── enhancements.js                                                                       ← Quick View, Size Guide, size quiz, comparison, lightbox, recently viewed
│   ├── products.js                                                                               ← the product catalog (single source of truth)
│   ├── cart.js                                                                                       ← cart state + drawer + fly-to-cart animation
│   ├── wishlist.js                                                                                       ← wishlist state + heart button
│   ├── shop.js                                                                                              ← filter/sort logic for shop.html
│   ├── product-page.js                                                                                          ← gallery/swatches/tabs/schema for product.html
│   ├── build.js                                                                                                     ← the Build Your Own configurator logic
│   ├── checkout.js                                                                                                     ← the 3-step wizard
│   ├── account.js                                                                                                        ← order history + tracking timeline + auth state
│   └── confirmation.js                                                                                                      ← the success page's checkmark + confetti
└── images/
    ├── (hero/about/lookbook photos go directly here)
    └── products/ (product photos go here, one per product)
```

Every page is a complete, standalone HTML file — open any one of them
directly and it works. `js/products.js` is the one file every other page
depends on: it's a plain array of product objects, and everything else
(the homepage grid, the shop filters, the product detail page, cart line
items, the checkout summary) just reads from that same array.

### Three new pages, plus a lot of polish (latest)

- **`build.html`** — a "Build Your Own" configurator. Pick colors for the
  upper, sole, and laces and watch a live preview update instantly —
  not a flat illustration, your actual base-model product photo,
  recolored region by region (see section 17 for how). Add your build
  to the bag as a custom line item.
- **`journal.html`** — three short editorial posts, giving the brand an
  actual voice instead of just product cards.
- **`how-its-built.html`** — a visitor-facing, casual-toned walkthrough
  of how the site works technically (cart state, the fly-to-cart trick,
  dark mode, even the blank-page bug from an earlier round) — a cleaned
  up version of this guide, meant to be read by someone clicking around
  the live site, not digging through a zip file.
- **Size quiz** — three quick questions inside the Size Guide modal,
  ending in a recommended size.
- **Product comparison** — a "+ Compare" chip on every product card;
  pick up to three and a floating bar lets you open a side-by-side table.
- **Custom cursor** — a small dot with a lagging ring that grows over
  anything clickable (fine-pointer devices only, untouched on mobile).
- **Page transitions** — a brief wipe plays when you click to another
  page on the site, skipped automatically for external links, new-tab
  links, and mailto/tel links.
- **A scroll progress bar**, **button press ripples**, a **grain texture
  overlay**, and a **skip-to-content link** for keyboard users.
- **Confetti** on the order confirmation page.
- **Schema.org structured data** on product pages (invisible to
  visitors, readable by search engines and "view source").
- **Lazy-loaded images** below the fold, site-wide.
- **Stock urgency and a "N people viewing this" line** on the product
  page, both deterministic per product (not randomized on every load).
- **"Welcome back, [name]"** on the homepage once logged in, with the
  featured row leaning toward categories already in your wishlist.
- **Order tracking timeline** (Placed → Processing → Shipped →
  Delivered) on each order in Account — reuses the exact same stepper
  CSS built for checkout.
- **A 404 easter egg** — a small shoe icon walks off-screen.

### Earlier: Quick View, Size Guide, zoom, Recently Viewed

- **Quick View modal** — every product card now has an eye icon next to
  the wishlist heart. Click it to pick a color/size and add to bag
  without leaving the grid, on the homepage, Shop, and Wishlist. One
  shared modal (`js/enhancements.js`) is reused for every product, the
  same "build the markup once, refill it each time" approach as the
  command palette.
- **Size guide modal** — the "Size guide" link on the product page now
  actually opens a measurements chart (US/UK/EU/CM).
- **Click-to-zoom lightbox** — clicking the main product photo opens a
  full-screen zoomed view.
- **Recently viewed** — product pages now remember the last 8 products
  you looked at (in `localStorage`) and show them in a row at the
  bottom, excluding whichever product you're currently on.
- **More motion on the homepage**: every gradient tile (hero side tiles,
  About Us, Comfort Meets Fashion) now tilts in 3D on hover via the new
  `.tile-3d` class — CSS-only, so it works without any JavaScript
  re-initialization even where content is static.
- **Richer testimonials** — 3D tilt, a quote-mark icon, an initials
  avatar per review, and a staggered star pop-in animation that plays
  once each card scrolls into view.



- **Fixed: form inputs were unreadable in dark mode.** No input anywhere
  had an explicit background color, so every text box, email field, and
  textarea fell back to the browser's default white — while the text
  color correctly followed the theme and turned light in dark mode.
  Light text on a white box is invisible. Fixed globally with one CSS
  rule (`input, textarea, select` now explicitly follow the theme), low
  specificity on purpose so the few inputs with an intentional custom
  color (like the volt newsletter box) still override it correctly.
- **Fixed: wishlist hearts on product cards were invisible until
  hovered**, in dark mode. The heart sits on a small fixed-white circle
  (so it stays readable over any colorful product photo, regardless of
  site theme) but its icon color was still following the theme — light
  icon on white circle vanished. Now fixed to a constant dark icon,
  matching its constant light background.
- **Fixed the same class of bug on every volt-green element**
  (`Bestseller` badges, the newsletter button, "Place order" on
  checkout): text color was theme-reactive on a background that's always
  bright, so it went nearly invisible in dark mode. Volt is deliberately
  vibrant in both themes, so text on it now always stays dark.
- **More 3D motion**: the logo tilts in 3D on hover; product card photos
  now lift with a subtle `rotateX`/`rotateY` tilt instead of a flat
  scale; icon buttons rotate slightly on hover/press; the cart icon
  shakes when an item is added.
- **A trust-badge strip** on the Shop page (shipping, returns, secure
  checkout, rating).

### Contrast fixes and more motion (previous revision)

- **Fixed a page-breaking bug**: `404.html` and `order-confirmation.html`
  were rendering as a completely blank page. The cause: a "fade the page
  in on load" CSS rule set `body{opacity:0}` and relied on `site.js` to
  add a class that revealed it — but those two pages never loaded
  `site.js`, so the reveal never happened and the page stayed invisible
  forever. Replaced with a pure-CSS `@keyframes` animation that needs no
  JavaScript at all, and added `site.js` to both pages besides. See
  Section 8b for why this class of bug is worth understanding.
- **Fixed the mega menu**: it was positioned relative to the tiny "Shop"
  link itself, rendering as a small clipped box instead of a full-width
  panel. Switched to `position:fixed` anchored to the viewport.
- **Fixed the hamburger icon getting stuck as an "×"** when the mobile
  menu was closed via the backdrop or its own close button (only closing
  it by clicking the hamburger *again* used to reset the icon).
- **Fixed the product page tabs** (Description/Reviews/Shipping): clicking
  Reviews or Shipping updated the content but never visually looked
  selected — the click handler was toggling a class with no matching CSS
  rule instead of the actual visible utility classes.
- **Fixed both search boxes**: the homepage's "Product" search used to
  redirect to the shop page on literally every keystroke; it now filters
  the grid in place, instantly. The nav search box used to only work on
  Enter; it now shows a live results dropdown as you type, on every page.
- **Fixed a dark-mode contrast bug**: the volt-green "Get the next drop
  first" banner used theme-reactive text color, which flipped to a light
  cream in dark mode — nearly invisible against the (always-bright) volt
  background. Given fixed dark text instead, the same fix already applied
  to the footer.
- **Active nav highlighting** — the current page is now visually marked in
  both the desktop nav and the mobile drawer, in both themes.
- **Clear all**, on Wishlist and the full Bag page, plus **delete
  individual orders** (and clear all order history) on the Account page —
  all with the same Undo-toast pattern used elsewhere.
- **A branded loading intro** — a brief, pure-CSS splash screen with the
  Stride wordmark and a filling progress bar, on every page.
- **A richer About page** — a founder quote section, a 4-step "how a shoe
  gets made" process row, and tilt/spotlight/split-text animation applied
  throughout.
- **Footer now reflows to two columns on mobile** instead of stacking
  every section in one long single column.

### What's new in this revision

- **Dark / Light / System mode** — a 3-way toggle in the nav (and in
  Account → Appearance) using the exact same CSS-variable trick as your
  other two projects: Tailwind's color names point at `var(--ink)` etc.
  instead of fixed hex, so toggling `.dark` on `<html>` repaints
  everything at once. The one deliberate exception: the black
  footer band and the marquee ticker stay a *fixed* black regardless of
  theme — see Section 12 for why.
- **Log in / Sign up pages**, plus the nav account icon now shows an
  initials avatar when "logged in." Honest about what it is: no backend,
  see Section 11.
- **Two new pages**: `lookbook.html` (full-bleed editorial panels with
  scroll parallax) and `faq.html` (accordion FAQ, three categories).
- **A mega menu on "Shop"** in the nav — hover or focus it and a
  category preview panel drops down.
- **New animation techniques**: a cursor-following spotlight glow on the
  homepage hero, a word-by-word text reveal on headlines, a 3D tilt
  effect on the lookbook gallery tiles, and scroll parallax on the
  lookbook's big images. Section 13 walks through each one.

---

## 2. Run it locally

```
cd stride
python3 -m http.server 8000
```
Then open `http://localhost:8000`. Try the whole flow end to end:
1. On the homepage, hover a product card — a "Quick add" button fades in.
2. Click it. Watch the little tile fly toward the cart icon and the badge
   pop. Open the cart (top right) — the item is there.
3. Go to **Shop**, tick a category, a size, drag the price slider. The
   grid updates instantly, with a chip for each active filter.
4. Click into a product. Change the color swatch, pick a size, hit **Add
   to bag**.
5. Open the cart drawer → **Checkout**. Fill in the three steps. On
   **Place order**, you land on a confirmation page with an animated
   checkmark.
6. Go to **Account** — your order is listed, read straight from
   `localStorage`.
7. Go back to the shop, tap a heart on a couple of shoes, then check
   **Wishlist**.

---

## 3. The fly-to-cart animation, explained slowly

This is the flashiest micro-interaction in the site, and it's simpler
than it looks. `flyToCart()` in `cart.js` does four things:

1. **Measure the start position.** `sourceEl.getBoundingClientRect()`
   asks the browser "where exactly on screen is this element, in pixels,
   right now?" — the product thumbnail you just clicked.
2. **Measure the end position.** Same call, but on the cart icon in the
   nav.
3. **Make a clone.** A brand-new, empty `<div>` is created, styled to
   look like the product thumbnail (same background gradient, same size),
   and positioned with `position:fixed` at exactly the start coordinates.
   It gets added to the very end of `<body>`, so it renders on top of
   everything else.
4. **Change its target styles one frame later.** Immediately setting the
   clone's final position wouldn't animate — the browser needs to paint
   the *starting* position first. So the code waits one
   `requestAnimationFrame`, then changes the clone's `left`/`top` to the
   cart icon's coordinates, shrinks its `width`/`height` down to 20px,
   fades its `opacity`, and rounds its corners into a circle. Because
   `.fly-clone` in `style.css` has `transition: all .7s ...`, the browser
   animates every one of those property changes smoothly instead of
   snapping. After 750ms, the clone is removed from the page entirely —
   the real cart badge count already updated the moment `addToCart()`
   ran, independent of however long the animation takes to finish.

The important idea: **the animation is purely visual and disconnected
from the actual state change.** `addToCart()` runs immediately, so the
cart is correct instantly even if you can't see the fly animation (say,
`prefers-reduced-motion` is on) — the flying clone is just a bonus for
the eye, never something the app's correctness depends on.

---

## 4. Cart and wishlist state — one pattern, two files

Both `cart.js` and `wishlist.js` follow the exact same shape:
- Read the current state from `localStorage` (a cart array, or a wishlist
  array of IDs).
- Every action (`addToCart`, `toggleWishlist`, etc.) modifies that array
  and immediately writes it back with `localStorage.setItem(...)`.
- A render function rebuilds the relevant bit of HTML from scratch every
  time state changes, rather than trying to surgically patch the DOM.

This "always re-render from state" approach is simpler to reason about
than manually finding-and-updating individual DOM nodes, and it's the
same idea behind Boardly's kanban board and Pulse's tables — just applied
here to a shopping cart instead of a task list.

**Cart line items are keyed by product + size + color**, not just product
id — see `lineId()` in `cart.js`. That's what lets "Rider FV, size 9,
Sunset" and "Rider FV, size 10, Ink" exist as two separate rows in the
same cart instead of colliding into one.

---

## 5. The filter UI on shop.html

`shop.js` keeps one `filters` object in memory:
```js
{ categories: Set, sizes: Set, colors: Set, maxPrice: number, sort: string }
```
Every control in the sidebar (a checkbox, a size chip, a color swatch, the
price slider) does the same three things on change: update the matching
piece of `filters`, toggle its own `.is-active` class so it looks
selected, and call `applyFilters()`. That function filters the full
`PRODUCTS` array against the current `filters` object, sorts what's left,
and re-renders the grid — no submit button, no page reload, the same
instant-apply idea used everywhere else in this portfolio (the command
palette, the dashboard search bars), just wired up to five different kinds
of controls instead of one text input.

The little chip row above the grid (`activeFilterChips()`) is built by
walking the same `filters` object and turning every non-empty piece of it
into a removable pill — click the × on a chip and it clears just that one
filter and re-applies.

The **mobile version is the exact same `buildFilterUI()` function**,
called a second time into a different container (`filters-mobile` inside
the slide-out drawer) — one function, two places it renders into, so the
filter logic never has to be written twice.

---

## 6. The checkout stepper

`checkout.js` treats the three steps as three `<section data-step="1">`,
`data-step="2"`, `data-step="3">` blocks that are just shown/hidden with
the `hidden` Tailwind class — `goToStep(n)` hides every section except the
one matching `n`. The stepper circles at the top react to the exact same
`n`: a step number less than the current one gets a checkmark and turns
volt-green (`.is-done`), the current one is solid black (`.is-active`),
and later ones stay a plain outline. The connecting line between two dots
animates its own fill using a `transform: scaleX()` transition, timed to
match.

**Validation is intentionally simple**: before advancing, `validateStep()`
just checks that every `[required]` field in the current step has a
non-empty value — good enough for a portfolio demo, not a substitute for
real server-side validation if this became a real store.

**Placing an order** does three things: builds a plain order object
(items, totals, name, email, a random order number), pushes it onto a
`stride-orders` array in `localStorage` (which is what `account.js` reads
later), and clears the cart. No network request happens anywhere — that's
the one piece you'd need to build for real, and Section 9 below explains
where.

---

## 7. Magnetic buttons

Any element with the class `.magnetic` gets this treatment in `site.js`:
```js
el.addEventListener("mousemove", (e) => {
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left - r.width / 2) * 0.35;
  const y = (e.clientY - r.top - r.height / 2) * 0.35;
  el.style.transform = `translate(${x}px, ${y}px)`;
});
```
On every mouse movement over the button, this works out how far the
cursor is from the button's *center* (not its edge), then nudges the
button 35% of that distance in the same direction — so the button seems
to lean toward your cursor without fully following it. `mouseleave`
resets the transform back to nothing, and because `.magnetic` has a CSS
`transition` on `transform`, that reset animates smoothly back to center
instead of snapping. It's skipped entirely on touch devices
(`matchMedia("(pointer: coarse)")`), since there's no cursor to react to
there.

---

## 8. Skeleton-free by design

Unlike Boardly and Pulse, most of Stride's data doesn't need a loading
skeleton — the product catalog is a plain in-memory array, not something
fetched over a network, so there's no meaningful delay to hide. If you
wire this up to a real API later (Section 9), that's the moment to bring
skeleton loading back for the shop grid and product page, using the same
`.skeleton` CSS class already defined in `style.css`.

---

## 8b. A lesson from a real bug: CSS and JS make two separate promises

Worth understanding even outside this project. The homepage used to fade
in on load via:
```css
body{ opacity:0; }
body.page-ready{ opacity:1; transition: opacity .4s ease; }
```
```js
// in site.js
document.body.classList.add("page-ready");
```
This works *only* on pages that actually run that line of JavaScript. Two
pages (`404.html`, `order-confirmation.html`) were built with a
deliberately minimal header and never got a `<script src="js/site.js">`
tag added — so `body{opacity:0}` applied from the CSS, and nothing ever
ran the JS that was supposed to undo it. The page rendered, the content
was all there in the DOM, it was just permanently invisible.

The fix — and the general lesson — is that **any effect that depends on
JavaScript running is only as reliable as your guarantee that the
JavaScript actually runs on every page that has the CSS.** Where possible,
prefer an approach the CSS can finish on its own:
```css
body{ animation: page-fade-in .4s ease forwards; }
@keyframes page-fade-in{ from{ opacity:0; } to{ opacity:1; } }
```
This animates automatically the moment the page paints — no class to add,
no script to remember to include, no way for it to end up "stuck." The
loading intro added in this revision (a brief branded splash screen with
a filling progress bar) follows the same principle for exactly this
reason — it's pure CSS `@keyframes`, so it always finishes and always
gets out of the way, with zero dependency on any script tag being present.

## 9. Dark, Light, and System mode

Identical mechanism to your other two projects: `style.css` defines two
full sets of CSS variables — `:root` for light, `html.dark` for dark —
and every page's `tailwind.config` points color names like `bg-paper` or
`text-ink` at those variables instead of fixed hex codes. The moment
`document.documentElement.classList.toggle('dark', ...)` runs, every
element using those classes repaints itself.

The three-way part (`light` / `dark` / `system`) works like this:
`localStorage` stores one of those three strings. `effectiveIsDark(pref)`
resolves what should *actually* render — if the stored preference is
`"system"`, it asks the browser directly via
`window.matchMedia('(prefers-color-scheme: dark)').matches`. A listener
on that same media query means if you have "System" selected and then
change your OS's theme while Stride is open, it updates live, no refresh
needed. The two-line anti-flash script at the very top of every
`<head>` — before any CSS even loads — reads the same stored preference
and applies `.dark` immediately, so there's no flash of the wrong theme
on load.

## 10. Why the footer and marquee ignore the theme toggle

Look closely and you'll notice the black footer band, the giant "STRIDE"
wordmark strip, and the scrolling marquee ticker at the top of the
homepage **stay black in both light and dark mode** — they don't use
`bg-ink` (which would flip to a light color in dark mode), they use a
fixed `bg-[#0B0B0C]`. That's deliberate: those two elements are the
site's signature "brand band," the same idea as a physical shoebox always
being the same color regardless of what room you're standing in. Letting
every themed color repaint *except* those two anchors keeps the brand
identity stable while the rest of the interface adapts — a small,
intentional exception rather than an oversight. If you'd rather they
adapt too, search `style.css` and the HTML files for `#0B0B0C` and
`#F7F5EF` and swap them back to `var(--ink)` / `var(--paper)`.

## 11. The new animation techniques, explained

**Cursor spotlight** (`initSpotlight()` in `site.js`) — any element with
`[data-spotlight]` gets a `mousemove` listener that calculates the
cursor's position *as a percentage of that element's own width and
height* and writes it into two CSS custom properties, `--sx` and `--sy`.
A `.spotlight-glow` child element positioned with `inset:0` uses those
same two variables inside a `radial-gradient(... at var(--sx) var(--sy), ...)`
— so the glow's center literally *is* wherever the cursor is, recalculated
on every pixel of mouse movement, no JavaScript animation loop needed at
all, just CSS reading live variables.

**Word-by-word text reveal** (`initSplitText()`) — takes any
`[data-split-text]` heading, splits its text on whitespace, and wraps
each word in two nested `<span>`s: an outer one with `overflow:hidden`
(a mask, so nothing outside its box is visible) and an inner one that
starts pushed down 110% via `transform: translateY(110%)`. Because the
outer span clips anything that overflows it, the word starts completely
hidden below its own baseline. Adding a `.split-ready` class to the
parent — timed one animation frame after the split happens — transitions
every inner span back to `translateY(0)`, with each word's CSS
`transition-delay` staggered slightly later than the last (via
`:nth-child`), so the words appear to rise into place one after another
instead of all at once.

**3D tilt** (`initTilt()`) — on the lookbook gallery, each tile's
`mousemove` handler works out how far the cursor is from the tile's
center as a fraction from -0.5 to 0.5 on each axis, then applies that as
a small `rotateX`/`rotateY` on a `.tilt-inner` child (the parent needs
`perspective` set in CSS for the 3D rotation to actually look
three-dimensional rather than just skewed). `mouseleave` resets it back
to flat.

**Scroll parallax** (the inline script at the bottom of `lookbook.html`)
— on every scroll event, each `[data-parallax]` image's distance from the
vertical center of the viewport is measured, then a small fraction of
that distance is applied as a `translateY`, so the background image
drifts slightly slower or faster than the page scrolls past it — the
classic parallax illusion, done with about six lines of math.



## 12. Making it real (optional next steps), and being honest about login

`login.html` and `signup.html` check what they should now — see section
16 for the full rundown — signup rejects a duplicate email, login
rejects a wrong password, and the password is stored as a SHA-256 hash,
not plain text. What it still isn't: a server anywhere verifying any
of this. Everything lives in `localStorage` in the one browser it was
created in — genuinely correct *logic*, just no backend behind it. If
you want a real one (a database, sessions that follow you across
devices), Boardly's Supabase setup (a free database + real
authentication, explained start to finish in that project's
`GUIDE.md`) is a solid template to follow here too.

Other things worth making real:

- **Real product photos**: see `images/products/README.md` and
  `images/README.md` — drop files in with the right names and they
  replace every gradient placeholder automatically, site-wide.
- **A real backend**: swap the `PRODUCTS` array in `products.js` for a
  `fetch()` call to a real product API, and swap `checkout.js`'s
  `placeOrder()` to `POST` to a real payment/order endpoint instead of
  writing straight to `localStorage`. Every render function downstream
  keeps working unchanged, because they were already written to just
  read from whatever `PRODUCTS`/`getCart()` currently return.
- **Real accounts across devices**: Boardly's Supabase setup (see that
  project's `GUIDE.md`) is a solid template if you want sign-up/login
  to follow someone between their phone and laptop, rather than living
  in one browser.

---

## 13. Personalize before you publish

- [x] Real contact info (email, WhatsApp, Instagram, Facebook, LinkedIn,
      GitHub, portfolio) — already filled into the footer and contact page.
- [x] Your name, Obioma Chibueze Justice — footer credit and
      `<meta name="author">` on every page.
- [ ] **Product photos** — currently colored-gradient placeholders with a
      shoe icon; see Section 13b for exactly where to drop real ones in.
- [ ] **Product data** — every name, price, and description in
      `js/products.js` is invented; edit freely.

## 13b. Images — the complete reference

**Any format works now.** Every image tag on the site is "smart" — it
tries `.jpg`, `.jpeg`, `.png`, `.webp`, then `.avif` in turn and uses
whichever one actually exists. You never have to rename a file to match
an exact extension; just drop it in with the right *base name* from the
list below and it appears, replacing the gradient placeholder
automatically, everywhere that image is used.

**Videos work the same way.** Any `<video data-src-base="videos/x">` on
the site tries `.mp4` then `.webm`, and if neither exists it just
removes itself and falls back to the photo/gradient sitting behind it.
Keep clips short and muted (they autoplay silently, loop, and skip
themselves entirely on slow connections or when the visitor's OS has
"reduce motion" turned on). Current video slots, all optional:

| Spot | Base name |
|---|---|
| Homepage hero tile | `videos/hero-loop` |
| Login page media panel | `videos/auth-login` |
| Signup page media panel | `videos/auth-signup` |
| About page full-bleed banner | `videos/about-workshop` |
| Journal featured post banner | `videos/journal-featured` |
| Lookbook Chapter 01 panel | `videos/lookbook-1` |
| Shop page banner | `videos/shop-banner` |
| Product page "In motion" banner | `videos/product-{id}` (e.g. `videos/product-nitro-3-running`) — falls back to the plain aurora background if that specific product doesn't have one |
| Sustainability page banner | `videos/sustainability` |

**Product photos** — `images/products/`, one base name per product,
matching the `image` field in `js/products.js`:

| Product | Base name |
|---|---|
| Nitro-3 Running | `images/products/nitro-3-running` |
| Flyer-Lite Unisex | `images/products/flyer-lite-unisex` |
| Rider FV Sneakers | `images/products/rider-fv-sneakers` |
| Fandom Suede | `images/products/fandom-suede` |
| Velocity Nitro | `images/products/velocity-nitro` |
| Fast-Trac Apex | `images/products/fast-trac-apex` |
| Aero-Knit Runner | `images/products/aero-knit-runner` |
| Urban Glide Low | `images/products/urban-glide-low` |
| Peak Trail Mid | `images/products/peak-trail-mid` |
| Featherform Slip | `images/products/featherform-slip` |
| Quantum Pulse (also shown on Build Your Own) | `images/products/quantum-pulse` |
| Drift Canvas | `images/products/drift-canvas` |
| Coastal Slide Sandal | `images/products/coastal-slide` |
| Summit Trekker | `images/products/summit-trekker` |
| Pulse Court Mid | `images/products/pulse-court-mid` |
| Featherweight Sprint | `images/products/featherweight-sprint` |
| Boulevard Chelsea | `images/products/boulevard-chelsea` |
| Ridgeline GTX | `images/products/ridgeline-gtx` |
| Retro 88 Classic | `images/products/retro-88-classic` |
| Cloudwalk Slip | `images/products/cloudwalk-slip` |
| Terra Cross Trainer | `images/products/terra-cross-trainer` |
| Nightfall High | `images/products/nightfall-high` |

**Product gallery — extra angles (optional).** The product page shows 4
photos with working thumbnails, dots, swipe, and zoom. Slot 1 is the
base name above; slots 2–4 are the same base name with `-2`, `-3`, `-4`
appended (e.g. `nitro-3-running-2.jpg`). Any slot you haven't shot yet
just reuses the main photo with a subtle tint so the gallery never looks
broken or empty.

**Shop category tiles** (the Shop dropdown in the nav) —
`images/categories/running`, `images/categories/trail`,
`images/categories/lifestyle`, `images/categories/casual`.

**Shop page banner** — `images/shop-banner` (the wide strip above the trust-badge row).

**Limited Drops page** — `images/drops/vol-01`, `images/drops/vol-02`, `images/drops/vol-03`.

**Everything else** (base names, drop into `images/` directly):
`hero-shoe`, `hero-2`, `hero-3` (homepage hero), `about-shoe`,
`about-wide` (About Us + homepage), `comfort-1`, `comfort-2`,
`comfort-3` ("Comfort Meets Fashion"), `lookbook-1`, `lookbook-2`,
`lookbook-3` (full-bleed panels), `lookbook-g1` … `lookbook-g4`
(gallery grid), `journal-featured` (Journal featured post banner),
`avatar` (nav account avatar once logged in).

**Don't like a photo, or want a different layout?** Tell me which shot
to swap or which section feels in the wrong spot — repositioning is a
markup change, not a photo problem, so I can reshuffle any of these
sections without you re-exporting anything.

---

## 14. Deploy it (same as your other two)

```
cd stride
git init
git add .
git commit -m "Initial commit: Stride shopping site"
git branch -M main
git remote add origin https://github.com/Justixxprime/stride.git
git push -u origin main
```
Then **Settings → Pages → Deploy from a branch → main → / (root)** on
GitHub, same as Boardly and Pulse. Add the live link to your portfolio.

---

## 15. What's new in this update

**8 new pages**, all built from the same header/nav/footer as everything
else, so they match without any extra work:

- `size-guide.html` — measuring instructions + the same size chart used
  in the product-page modal, plus fit notes per category.
- `stores.html` — a store locator with a map placeholder (swap for a
  real Google Maps / Mapbox embed) and a stockist list.
- `sustainability.html` — materials breakdown with count-up stats and a
  video banner slot (`videos/sustainability`).
- `gift-cards.html` — a **real** gift card flow: pick $25/$50/$100/$150,
  it actually adds to your cart and goes through checkout like any
  product. See "Gift cards" below for how this works under the hood.
- `press.html` — a press/wholesale inquiry form that opens a pre-filled
  email (same pattern as the Contact page).
- `rewards.html` — the 3-tier loyalty program explanation, linked from
  a new teaser card on `account.html`.
- `drops.html` — a live countdown timer to the next limited release,
  plus sold-out/coming-soon cards.
- `careers.html` — open roles placeholder with count-up stats.

The footer on **every page** now has Shop / Company / Support / Contact
columns linking to all of these — check `old_footer_grid` vs
`new_footer_grid` if you ever want to adjust the columns, since it's
one block repeated on every file.

**Gift cards, technically**: they're deliberately *not* in the main
`PRODUCTS` array (that would make them show up in the shop grid and
filters, which would look wrong next to actual shoes). They live in a
separate `GIFT_CARDS` array in `js/products.js`, and `findProduct()`
checks both arrays — so the cart, checkout, and order confirmation all
just work without knowing gift cards are a special case. Cart/checkout
templates show "Digital gift card" instead of a broken size/color line
whenever `line.size` is null.

**Search actually works now.** The nav search box always linked to
`shop.html?q=...`, but the shop page used to just ignore that
parameter — clicking a search result showed the *entire* catalog, not
matches. Fixed: `filters.query` now genuinely filters by name,
category, and description, shows "results for 'x'", and has its own
clearable chip like every other filter.

**Journal** got topic filter chips (Materials / Process / Community)
instead of a separate page per category — simpler, and it's how a blog
with only a few posts should probably start anyway. Add `data-topic="…"`
to a new `<article>` and it's automatically filterable.

**The 3D shoe configurator** (Build Your Own) got a full rebuild since
the last version you had: a real anatomical shell instead of stacked
spheres, 10 selectable silhouettes (Runner, High-Top, Slip-On, Chunky,
Minimalist, Trail, Basketball, Skate, Retro, Platform), procedural
fabric/leather/rubber textures, a reflection floor, and a "Photo"
preview tab that tints your actual product photo as a faster
alternative to the full 3D view. See `js/shoe3d.js`.

*(Since then, the Build page dropped 3D entirely — see section 16.)*

---

## 16. Real accounts, real email, real balances

This update replaced several things that only *looked* functional with
ones that actually are — as real as they can be without a paid backend,
which is explained honestly below.

### Accounts (js/auth.js)
Signing up now creates a real account record — name, email, and a
**SHA-256 hash of the password** (via the browser's built-in
`crypto.subtle`, nothing sent anywhere) — stored in
`localStorage["stride-accounts"]`. Logging in looks the account up and
compares the hash. Concretely: a duplicate email is rejected on signup,
and a wrong password is rejected on login — neither happened before.
**The honest limit**: this is still entirely client-side. It's real
authentication logic, just with no server, so it only "remembers" you
in the one browser it's stored in, and anyone with dev tools open
technically can see the accounts list. Good enough for a portfolio
demo to *behave* correctly; not something to point real customers at
without a real backend (see section 12 for what that would take).

### Stride Credit — a real gift-card balance (gift-cards.html)
- **Add to your own balance**: instant, credits your logged-in
  account's `giftCardBalance` immediately.
- **Send as a gift**: generates a redemption code
  (`STRIDE-XXXX-XXXX`), stored in `localStorage["stride-giftcode-ledger"]`.
  If you enter a recipient email, it's emailed via Web3Forms (see
  below).
- **Redeem a code**: adds that code's balance to your account and
  marks it used — it can't be redeemed twice.
- **At checkout**: a "Use Stride Credit" toggle appears if you have a
  balance; applying it actually reduces the total, and completing the
  order actually deducts it from your account. Tested end-to-end:
  $50 balance → apply at checkout → order completes → balance is $0.

### Promo codes (checkout.html)
Three real codes wired up in `js/checkout.js` — `WELCOME10` (10% off),
`SAVE20` ($20 off), `FREESHIP` (free shipping). Add more by editing the
`VALID_PROMOS` object. Invalid codes show an error; valid ones actually
recalculate the order total live.

### Rewards that actually accrue (rewards.html + account.html)
Every completed order adds `Math.round(total)` points to your account
(1 point per dollar, roughly matching the Walker tier described on the
Rewards page). Your account page now shows your *real* tier and point
total instead of a static "0 points."

### Real email — Web3Forms (js/site.js)
Contact and Press & Wholesale forms, and order receipts, all send
through [Web3Forms](https://web3forms.com) — a free service built
exactly for static sites like this one (no backend required).

**To turn it on:**
1. Go to web3forms.com and enter your email — you'll get an access key
   instantly, no account signup wall.
2. Open `js/site.js`, find `const WEB3FORMS_ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";`
   near the top, and paste your key in.
3. That's it — Contact, Press, and checkout receipts all use the same
   key automatically.

Until you paste in a real key, every form still works from the user's
side (loading state, then a friendly "email isn't connected yet"
message) — nothing throws an error, it just can't actually send.

**To also email customers a receipt** (not just you), turn on
**Autoresponder** in your Web3Forms dashboard settings — Web3Forms is
built to notify *you* by default; the autoresponder feature is what
sends a reply back to the person who submitted the form, which is what
makes the receipt actually land in the customer's inbox.

### Beautified, downloadable receipts (order-confirmation.html)
The "Download receipt" button opens a fully self-contained, styled
invoice (branded header, itemized table, real totals including any
promo/credit applied) in a new tab and triggers the browser's print
dialog — "Save as PDF" from there gives a genuinely nice-looking PDF
without needing a PDF-generation library. See `buildReceiptHTML()` in
`js/confirmation.js` if you want to restyle it.

### Creating your own discount codes (account.html)
`WELCOME10`/`SAVE20`/`FREESHIP` were hardcoded before — now there's a
real "Create a discount code" tool on the account page: name a code,
pick percent/flat/free-shipping, and it's usable at checkout
immediately (stored in `localStorage["stride-custom-promos"]`,
merged with the built-in three at validation time). Codes can be
removed from the same list.

### Recharging a gift code (account.html)
Also on the account page: paste in any gift code you've generated on
gift-cards.html (before it's redeemed) and add more balance to it —
the actual stored balance for that code goes up, same ledger the
"Redeem a code" flow reads from.

### Back to top
A small floating button (bottom-right) appears after scrolling down
about 600px, on every single page — injected once from `js/site.js`
(`initBackToTop()`), so it didn't need touching 26 HTML files.

---

## 17. Case-sensitivity, transparent overlays, real per-part color, and a proper install icon

A round of fixes aimed at bugs that only show up on the *live* GitHub
Pages site, not necessarily in local preview — plus one real design
upgrade to the Build page.

### The root cause behind a lot of "it looks broken on my phone"
GitHub Pages serves files from a case-sensitive filesystem (Linux).
Most local dev setups (Mac, Windows) are case-*insensitive*, so a
reference to `videos/hero-loop.mp4` happily finds `Hero-Loop.mp4` on
your machine and still 404s once deployed. All 31 files in `/videos`
had capitalized names while the code referenced them lowercase — every
video on the live site was silently failing. Renamed every file to
match the code exactly (`git mv`, verified byte-for-byte afterward).

### A debug leftover that defeated the fallback system
Every page had an inline stub —
`window.imgTryNext = function(img){ img.style.display = "none"; }` —
sitting *before* the real `imgTryNext` in `js/site.js` loaded. Since
images can start loading before deferred scripts finish, any image
that needed to fall back during that window got hard-hidden instead of
getting the intended graceful gradient+icon treatment. Removed from
every page.

### The transparent header / invisible drawer overlay bug
The theme colors (`--ink`, `--paper`, etc. in `css/style.css`) were
defined as hex strings. Tailwind's opacity-modifier syntax
(`bg-paper/95`, `bg-ink/50`, `text-ink-soft/70`...) needs the CSS
variable to hold bare `R G B` numbers so it can wrap it as
`rgb(var(--x) / alpha)` — a hex string there is invalid CSS, and the
browser just drops the whole rule. No error, just a background that
never renders. Verified directly with `getComputedStyle`: the sticky
header's background was computing to `rgba(0,0,0,0)` despite having
`bg-paper/95` applied, which is why scrolled content visibly bled
straight through the header instead of showing as a soft frosted-glass
blur. The exact same bug made the cart drawer's and mobile nav's dark
backdrop (`bg-ink/50`) invisible on every page.

**Fix:** added parallel `--x-rgb: "R G B"` custom properties (light +
dark mode) alongside the existing hex ones — nothing that already
uses `var(--ink)` elsewhere in the stylesheet was touched — and
updated the inline Tailwind color config on all 26 pages to use
`rgb(var(--x-rgb) / <alpha-value>)`. Re-verified: header now computes
`rgba(247,245,239,0.95)` as intended, and the drawer backdrops
visibly dim the page again.

### Build page: real per-part color instead of one flat tint
The old preview took the base model's real photo, desaturated it, and
laid a *single* blended color over the whole thing (65% upper + 25%
sole + 10% laces mixed into one flat wash) — and that tint bled onto
the studio background too, not just the shoe.

Now each of the 6 base models (`quantum-pulse`, `nitro-3-running`,
`retro-88-classic`, `urban-glide-low`, `aero-knit-runner`,
`peak-trail-mid`) has three hand-fit alpha masks — one each for
upper, sole, and laces — in `images/build-masks/<id>-{upper,sole,laces}.png`.
`js/build.js` draws the real photo onto a canvas, then for each part:
fills an offscreen canvas with the chosen color, clips it to that
part's mask, and composites it onto the photo with
`globalCompositeOperation = "color"` — which keeps all of the original
photo's shading, texture, and highlights and only swaps hue/saturation.
The background is never touched, since it isn't inside any mask. See
`paintPreviewCanvas()` in `js/build.js` if you add a 7th base model —
it needs the same three masks at the same pixel dimensions as its
source photo.

### "In motion" panels show a real photo now, not just a gradient
`product.html`'s "See it on foot" panel used to fall back to a flat
brand-gradient if the product's video wasn't available yet. It now
shows the product's own real photo as an immediate background/fallback
first (same smart-fallback pattern as everywhere else on the site),
with the gradient only as the last-resort safety net if even the photo
fails to load. Confirmed this covers all 22 real products, including
`rider-fv-sneakers`, the one product with no matching video file.

### A phone number field on the contact form
`contact.html` now has an optional phone field, wired into the
existing Web3Forms submission alongside name/email/topic/message.

### A real install icon (favicon.ico → home screen)
Added a proper icon set built from the existing brand mark (black
rounded square, volt-green swoosh): `favicon.ico` (multi-res),
`apple-touch-icon.png` for "Add to Home Screen" on iPhone, `icon-192`
/ `icon-512` PNGs plus a padded maskable variant for Android's
install/adaptive-icon system, and `site.webmanifest` (name, theme and
background color, standalone display) so Chrome on Android offers a
real install prompt. `theme-color` and `apple-mobile-web-app-*` meta
tags make the status bar / address bar area match the site's cream
background instead of the browser default. All of it lives in
`/icons/` + `favicon.ico` + `site.webmanifest` at the repo root, wired
identically into all 26 pages.
