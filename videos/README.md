Optional cinematic background clips. Any of these work — .mp4 or .webm
(the site tries both). Keep clips short, silent (they autoplay muted),
and loop-friendly. If a file isn't here, the photo/gradient behind it
just shows instead — nothing breaks.

  hero-loop.mp4          — homepage hero tile
  auth-login.mp4         — login page media panel
  auth-signup.mp4        — signup page media panel
  about-workshop.mp4     — About page full-bleed banner
  journal-featured.mp4   — Journal featured post banner
  lookbook-1.mp4         — Lookbook Chapter 01 panel
  shop-banner.mp4        — Shop page banner
  product-{id}.mp4       — Product page "In motion" banner, one per
                            product id (e.g. product-nitro-3-running.mp4)
                            — falls back to that product's own real
                            photo if the video isn't there yet (not a
                            plain gradient — the gradient is only the
                            very last resort if the photo fails too)
  sustainability.mp4     — Sustainability page banner

Filenames are matched exactly, including case — GitHub Pages is a
case-sensitive filesystem, so `Hero-Loop.mp4` will work fine in local
preview on a Mac/Windows machine but silently 404 once deployed. Keep
everything here lowercase-hyphenated, matching the `videos/...`
references in the HTML/JS exactly.

See GUIDE.md section 13b for the full reference, including images.
