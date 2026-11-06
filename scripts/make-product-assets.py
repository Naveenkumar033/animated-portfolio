"""Builds the product images used by the site from the client's five product design images.

Usage:  python scripts/make-product-assets.py path/to/designs-folder

The folder must contain gummies.png, inhaler.png, rollon.png, reviva.png and liver.png
(the TranzLife design boards supplied in Nov 2026). Writes to src/assets/products/:

  <id>.webp          square product shot for cards, the bag, the finder and the menu
  <id>-design.webp   the full design board, shown in the "View design" lightbox

Pixel boxes below match those boards; adjust them if a design changes.
The cut-outs for the hero and the product story come from scripts/make-product-cutouts.py.
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'products')
os.makedirs(OUT, exist_ok=True)
def load(name): return Image.open(os.path.join(SRC, name)).convert('RGB')

# ---------- square product shots (crop the product, blur-fill to a square) ----------
SHOTS = {
    'gummies': ('gummies.png', (292, 40, 716, 840)),
    'inhaler': ('inhaler.png', (230, 100, 1025, 1180)),
    'rollon':  ('rollon.png',  (0, 120, 1155, 1275)),
    'reviva':  ('reviva.png',  (262, 40, 982, 1000)),
    'liver':   ('liver.png',   (200, 40, 1010, 1000)),
}
def square(img, size=960, fill=None):
    w, h = img.size; s = max(w, h)
    bg = Image.new('RGB', (s, s), fill) if fill else img.resize((s, s), Image.LANCZOS).filter(ImageFilter.GaussianBlur(s/18))
    canvas = bg.copy()
    # feather the crop's edges into the blurred fill
    mask = Image.new('L', (w, h), 255); m = np.asarray(mask).astype(np.float32)
    f = max(1, int(min(w, h)*.05)); ramp = np.minimum(1, np.minimum(np.arange(w)[None, :], np.arange(w)[::-1][None, :])/f)
    if w < s: m *= ramp
    rampy = np.minimum(1, np.minimum(np.arange(h)[:, None], np.arange(h)[::-1][:, None])/f)
    if h < s: m *= rampy
    canvas.paste(img, ((s - w)//2, (s - h)//2), Image.fromarray((m).astype(np.uint8)))
    return canvas.resize((size, size), Image.LANCZOS)
for pid, (f, box) in SHOTS.items():
    square(load(f).crop(box), fill=(255, 255, 255) if pid == 'inhaler' else None).save(os.path.join(OUT, pid + '.webp'), 'WEBP', quality=84, method=6)
    full = load(f); full.thumbnail((1600, 1600), Image.LANCZOS)
    full.save(os.path.join(OUT, pid + '-design.webp'), 'WEBP', quality=84, method=6)
    print('shot', pid)
