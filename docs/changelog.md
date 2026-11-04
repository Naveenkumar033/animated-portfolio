# Changelog

## v9 (4 Nov 2026): the five real products
- The catalogue is now the client's five products:
  - TranzLife Gummies (60 gummies, sustainable dual-finish jar)
  - Calm Inhaler
  - Calm Period Relief Roll-On (rosemary, rose and peppermint)
  - Reviva Roll-On for diabetic foot care
  - Liver Booster Liquid (100 ml)
- Every product photo on the site is the client's own product image:
  - shop cards, finder match, menu card and bag
  - Why TranzLife cards and the benefits panel
- A "View design" button on the shop cards and the finder opens the full design board in a lightbox.
- Each product has its own 3D model, with the label artwork taken from its design:
  - gummies jar with a frosted diagonal top, kraft eco cap and raspberry gummies
  - grey twin-tip inhaler with the teal CALM label
  - black roll-on with the cream relief label
  - amber Reviva roll-on with a steel ball and dark green label
  - frosted green Liver Booster bottle with an angled oak cap
- Copy, finder needs, product story cards, benefits rows, herbs and the R&D board now match the new products.
- New `scripts/make-product-assets.py` rebuilds the product images and label artwork from the design files.
- Removed the browser-rendered studio shots (`features/products/studio-shots.js`) and the logo loader for labels (`app/brand.js`).

## v8 (4 Nov 2026): new logo, "Products" naming
- New TranzLife Biosciences logo (banyan tree with the infinity DNA). It appears in the top bar, loader, menu and footer, with a cream wordmark on dark green.
- The jar labels now print the real logo emblem and wordmark instead of typed text. The Cinzel font is no longer loaded.
- "Rituals" is now "Products" in the nav, dock, menu and footer. The section id is `#products`, and "Ritual Finder" is now "Product Finder".
- The matching copy now says "product" instead of "ritual".
- Code renamed to match:
  - `features/product-story/`
  - `features/finder/product-finder.js`
  - `data/product-story.js`
  - `styles/sections/product-story.css`
  - `assets/images/botanical-background.jpg`
  - `scripts/make-botanical-background.py`

## v7 (3 Nov 2026): project structure
- Restructured into a Vite + vanilla JS project with feature-first ES modules.
- Libraries now come from npm instead of CDNs:
  - three 0.128.0
  - gsap 3.12.5
  - lenis 1.1.13
- Split the CSS into tokens, base, components, sections and responsive files.
- Added unit tests (Vitest), `.env` options for a hosted checkout and a contact endpoint, and the asset-generation scripts.

## v6: minimal dock and botanical panel
- The dock rests as a single menu symbol with a scroll-progress ring. It unfolds on hover, or on the first tap on touch screens.
- The current section's name peeks out beside the dock.
- The brand story panel sits on an original motion-blur botanical background.

## v5: official logo and new menu
- Logo used in the top bar, loader, menu, footer and on every 3D jar label.
- New full-screen sage menu with a circular reveal and a featured-product card.

## v4: rebuilt in the style of the client's reference site
- Lenis smooth scroll.
- Hero with a white arc and fact bubbles.
- Pinned ritual story: each product's jar turns while feature cards glide past, ending in a five-jar finale.
- New sections: benefits table, shop, contact and footer.

## v1–v3
- First 3D site, photoreal studio renders and the molecule pipeline.
- DNA helix showcase experiments.
