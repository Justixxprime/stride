Drop real product photos here. Any format works — .jpg, .jpeg, .png,
.webp, or .avif — the site tries each in turn, so you never have to
rename a file to match an exact extension. Just match the base name to
the product's `image` field in js/products.js — the catalog now has 22
products across running, trail, lifestyle, and casual. For example:

  images/products/nitro-3-running.jpg     (or .webp, .avif, etc.)
  images/products/rider-fv-sneakers.avif

The moment a file exists at that base name, it replaces the
colored-gradient placeholder automatically on every page (home, shop
grid, product page, cart, checkout) — no code changes needed anywhere.

Extra angles for the product-page gallery (optional): add `-2`, `-3`,
`-4` to the same base name —

  images/products/nitro-3-running-2.jpg
  images/products/nitro-3-running-3.avif

Any slot you skip just reuses the main photo with a subtle tint, so the
gallery (with working thumbnails, swipe, and zoom) never looks broken.

See GUIDE.md section 13b for the full base-name list, including the
Shop category tiles in images/categories/.

Filenames are matched exactly, including case — GitHub Pages is a
case-sensitive filesystem, so double-check capitalization matches the
`image` field in js/products.js exactly once deployed, even if it
worked fine in local preview on a Mac/Windows machine.

**images/build-masks/** — not product photos themselves, but per-part
alpha masks (upper/sole/laces) for the 6 shoes used as Build Your Own
base models, named `<product-id>-upper.png`, `<product-id>-sole.png`,
`<product-id>-laces.png`. These are what let the Build page recolor
your actual product photo region by region instead of tinting the
whole image at once. See GUIDE.md section 17 if you add a 7th base
model — it needs the same three masks, at the same pixel dimensions
as its source photo.
