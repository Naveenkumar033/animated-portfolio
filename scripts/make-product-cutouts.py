"""Cuts each product out of the client's design images, on its own (no carton, flowers or props), as a transparent WebP
for the hero and the product story.

Usage:  python scripts/make-product-cutouts.py path/to/designs-folder [--sr path/to/EDSR_x2.pb]

Needs:  pip install rembg onnxruntime   (the first run downloads the isnet-general-use model)
The folder must contain gummies.png, inhaler.png, rollon.png, reviva.png and liver.png.
Writes src/assets/products/<id>-cut.webp.

How: the whole design is segmented first, then only the product's own area is kept (the KEEP shapes below,
in design-image pixels). Adjust them if a design changes.
"""
import os, sys
import numpy as np
import cv2
from PIL import Image
from rembg import remove, new_session

SRC = sys.argv[1]
SR = sys.argv[sys.argv.index('--sr') + 1] if '--sr' in sys.argv else None
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'products')

# each shape is a rectangle (x0, y0, x1, y1) or a function (x, y) -> bool mask
KEEP = {
    'gummies': [(250, 30, 740, 880)],                         # the main jar on the board
    'inhaler': [(765, 0, 1005, 1254)],                        # the grey inhaler, not its carton
    'rollon':  [lambda x, y: (x >= 385) & (x < 1000) & (y >= 150) & (y < 452 - (x - 400)*.067)],  # the bottle above its gift box
    'reviva':  [(718, 0, 895, 432), (697, 432, 895, 1024)],   # the bottle in front of its carton (the cap lying beside it is left out)
    'liver':   [(752, 0, 990, 1024)],                         # the bottle, not its carton
}
UPRIGHT = {'rollon': 86.2}   # the roll-on lies on its side in the photo: stand it up, cap on top (degrees, counter-clockwise)

session = new_session('isnet-general-use')
sr = None
if SR:
    sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(SR); sr.setModel('edsr', 2)

for pid, shapes in KEEP.items():
    im = Image.open(os.path.join(SRC, pid + '.png')).convert('RGB')
    a = np.asarray(remove(im, session=session)).copy()
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]; keep = np.zeros((h, w), bool)
    for s in shapes:
        if callable(s): keep |= s(xx, yy)
        else: x0, y0, x1, y1 = s; keep[y0:y1, x0:x1] = True
    al = a[..., 3]; al[~keep] = 0; al[al < 18] = 0
    # drop loose fragments, keep every sizeable part (caps can be a separate piece)
    n, lab, st, _ = cv2.connectedComponentsWithStats((al > 10).astype(np.uint8), 8)
    if n > 1:
        areas = st[1:, cv2.CC_STAT_AREA]; ok = np.zeros(n, bool); ok[1:] = areas > areas.max()*.02
        al[:] = (al*cv2.dilate(ok[lab].astype(np.uint8), np.ones((5, 5), np.uint8))).astype(np.uint8)
    o = Image.fromarray(a, 'RGBA'); o = o.crop(o.getbbox())
    if pid in UPRIGHT: o = o.rotate(UPRIGHT[pid], resample=Image.BICUBIC, expand=True); o = o.crop(o.getbbox())
    if sr is not None and max(o.size) < 760:   # small source: upscale 2x
        rgb = cv2.cvtColor(np.asarray(o)[..., :3], cv2.COLOR_RGB2BGR)
        up = cv2.cvtColor(sr.upsample(rgb), cv2.COLOR_BGR2RGB)
        a2 = cv2.resize(np.asarray(o)[..., 3], (up.shape[1], up.shape[0]), interpolation=cv2.INTER_CUBIC)
        o = Image.fromarray(np.dstack([up, a2]), 'RGBA')
    o.thumbnail((1200, 1200), Image.LANCZOS)
    o.save(os.path.join(OUT, pid + '-cut.webp'), 'WEBP', quality=86, method=6, exact=True)
    print('cut', pid, o.size)
