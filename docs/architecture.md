# Architecture

## Page flow

`index.html` holds the markup for every section, in this order:

1. hero (`#home`)
2. Why TranzLife (`#insider`)
3. product story (`#products`)
4. benefits (`#benefits`)
5. pipeline (`#process`)
6. science (`#science`)
7. R&D lab (`#lab`)
8. product finder (`#finder`)
9. shop (`#shop`)
10. contact (`#contact`)
11. footer

JavaScript only fills in and animates that markup.

## Boot order (`src/main.js`)

1. **Static UI.** Cart and contact handlers, marquee, lab board, product finder buttons, dock and menu.
2. **Product images.** `features/products/product-images.js` imports the client's five product images into `thumbs`. The shop cards, finder, menu card, bag, Why TranzLife cards and benefits panel all use them. `components/lightbox.js` opens the full design board for any `[data-design]` button.
3. **Hero product.** `features/hero/hero-jar.js` places the real gummies jar (cut out of the design), after the web fonts load.
4. **Content that needs the images.** Shop grid, finder match, molecule viewer and herb picker.
5. **Scroll scenes.** The product story (`features/product-story`) and the molecule reactor (`features/pipeline`), plus `app/page-sections.js`, which tracks the current section and dispatches `tl:page` events.
6. **Smooth scroll and reveals.** Lenis smooth scroll, the ScrollTrigger reveals, then the intro timeline hides the loader.

A 25-second fail-safe always hides the loader, even if a 3D scene fails.

## How modules share things

- **`app/state.js`** holds the mutable shared objects:
  - `thumbs` (product image URLs, by product id)
  - `cart` (Map of id to quantity)
  - `state` (the Lenis instance and scene handles)

  ES module imports are read-only, so shared values live on these objects rather than as `let` exports.
- **Content lives in `src/data/`.** Features import it and never hard-code copy.
- **Events.**
  - `tl:page` fires when the current section or theme changes. The nav and dock listen to it.
  - `tl:goStage` jumps to a pipeline stage.
- **Product images.** Only the client's own product images are shown. `features/products/product-images.js` exports `SHOTS` (square shots), `CUTS` (transparent cut-outs for the hero and the product story) and `DESIGNS` (full boards for the lightbox).
- **3D.** Three.js is used only for the molecule scenes (science viewer and pipeline reactor).
  - `lib/environment.js` provides the reflection cube maps.

## Styles

`src/styles/main.css` imports the files in cascade order:

1. tokens
2. global base
3. components (logo, loader, nav, dock, menu, drawer)
4. sections
5. `responsive.css`

Colour themes are CSS custom properties. Adding `.t-green` or `.t-cream` to any element switches its palette.

## Assets

| File | Source |
|---|---|
| `src/assets/products/*` | Made by `scripts/make-product-assets.py` from the client's five product designs (Nov 2026): square product images and full design boards; `*-cut.webp` cut-outs by `scripts/make-product-cutouts.py` |
| `src/assets/logo/*` | Made by `scripts/cut-logo.py` from the client's banyan-tree logo (Nov 2026) |
| `src/assets/images/botanical-background.jpg` | Original image made by `scripts/make-botanical-background.py` |
| `src/assets/images/dna-helix.webp` | Client-supplied DNA reference image, cut out and upscaled. **Confirm usage rights before launch.** |
