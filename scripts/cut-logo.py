"""Cuts the TranzLife Biosciences logo out of a white-background image and exports the parts the site uses.

Usage:  python scripts/cut-logo.py path/to/logo-on-white.png

Writes to src/assets/logo/:
  logo-emblem.webp      banyan tree + infinity DNA
  logo-word.webp        TRANZLIFE wordmark + BIOSCIENCES line
  logo-word-light.webp  the same wordmark in cream (for dark green backgrounds), gold kept

The row bands below match the 1536x1024 logo supplied by the client (Nov 2026); adjust them for a different file.
A vector (SVG) logo from the designer will always look sharper than this cut-out.
"""
import os, sys
import numpy as np
from PIL import Image

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'logo')
os.makedirs(OUT, exist_ok=True)

im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
H, W = im.shape[:2]
# colour-to-alpha against white keeps the soft edges and the ground shadow
a = np.max((255 - im)/255, axis=2); a = np.clip((a - .03)/(1 - .03), 0, 1)
A = np.maximum(a, 1e-4)[..., None]; col = np.clip((im - 255*(1 - A))/A, 0, 255)
rgba = np.dstack([col, a*255]).astype(np.uint8); al = rgba[..., 3]

EMBLEM_ROWS, WORD_ROWS = (20, 574), (574, 812)
LEAF_BOX = (512, 574, 1129)  # the leaf over the "i" of LIFE pokes up into the emblem rows: rows 512-574, x >= 1129

def cut(mask, name, width, pad=6):
    ys, xs = np.where(mask > 6); y0, y1, x0, x1 = max(0, ys.min()-pad), min(H, ys.max()+pad+1), max(0, xs.min()-pad), min(W, xs.max()+pad+1)
    o = rgba[y0:y1, x0:x1].copy(); o[..., 3] = mask[y0:y1, x0:x1]
    img = Image.fromarray(o, 'RGBA')
    if img.width > width: img = img.resize((width, round(img.height*width/img.width)), Image.LANCZOS)
    return img

em = np.zeros_like(al); em[EMBLEM_ROWS[0]:EMBLEM_ROWS[1]] = al[EMBLEM_ROWS[0]:EMBLEM_ROWS[1]]
em[LEAF_BOX[0]:LEAF_BOX[1], LEAF_BOX[2]:] = 0
em[556:574, :330] = 0                                   # tip of the T's swash
wd = np.zeros_like(al); wd[WORD_ROWS[0]:WORD_ROWS[1]] = al[WORD_ROWS[0]:WORD_ROWS[1]]
wd[LEAF_BOX[0]:LEAF_BOX[1], LEAF_BOX[2]:] = al[LEAF_BOX[0]:LEAF_BOX[1], LEAF_BOX[2]:]

emblem = cut(em, 'logo-emblem.webp', 640); word = cut(wd, 'logo-word.webp', 1100)
o = np.asarray(word).astype(np.float32).copy(); r, g, b = o[..., 0], o[..., 1], o[..., 2]
gold = (r > 140) & (g > 100) & (b < 110) & (r > g)
o[~gold, :3] = np.array([236, 241, 228], np.float32)
light = Image.fromarray(o.astype(np.uint8), 'RGBA')
for img, name in [(emblem, 'logo-emblem.webp'), (word, 'logo-word.webp'), (light, 'logo-word-light.webp')]:
    img.save(os.path.join(OUT, name), 'WEBP', quality=90, method=6); print('wrote', name, img.size)
