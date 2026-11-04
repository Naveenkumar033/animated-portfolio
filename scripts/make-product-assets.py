"""Builds the product images used by the site from the client's five product design images.

Usage:  python scripts/make-product-assets.py path/to/designs-folder [--sr path/to/EDSR_x2.pb]

The folder must contain gummies.png, inhaler.png, rollon.png, reviva.png and liver.png
(the TranzLife design boards supplied in Nov 2026). Writes to src/assets/products/:

  <id>.webp          square product shot for cards, the bag, the finder and the menu
  <id>-design.webp   the full design board, shown in the "View design" lightbox
  decal-*.webp       printed artwork lifted from the designs for the 3D models' labels

Pixel boxes below match those boards; adjust them if a design changes.
--sr (optional) upscales the label artwork 2x with OpenCV's EDSR super-resolution model.
--shots-only skips the label artwork.
"""
import os, sys
import numpy as np
import cv2
from PIL import Image, ImageFilter

SRC = sys.argv[1]
SR = sys.argv[sys.argv.index('--sr') + 1] if '--sr' in sys.argv else None
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

# ---------- label artwork for the 3D models ----------
if '--shots-only' in sys.argv: sys.exit(0)
sr = None
if SR:
    sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(SR); sr.setModel('edsr', 2)
def up(a):
    return sr.upsample(a) if sr is not None else cv2.resize(a, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

def unwrap(a, half_angle, axis=1):
    """The photo shows a label on a cylinder; resample so columns (axis=1) are even in angle, not in chord."""
    n = a.shape[axis]; t = np.linspace(-half_angle, half_angle, n)
    src = (np.sin(t)/np.sin(half_angle) + 1)/2*(n - 1)
    idx = np.arange(a.shape[1 - axis], dtype=np.float32)
    if axis == 1: mx, my = np.meshgrid(src.astype(np.float32), idx)
    else: my, mx = np.meshgrid(src.astype(np.float32), idx, indexing='ij')
    return cv2.remap(a, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

def flatten(a, axis=1, sel=None):
    """Remove the curvature shading baked into the photo (per column, or per row with axis=0)."""
    f = a.astype(np.float32); lum = f.mean(2)
    m = sel(f) if sel is not None else np.ones(lum.shape, bool)
    prof = np.array([np.median(lum[:, i][m[:, i]]) if m[:, i].any() else np.nan for i in range(a.shape[1])]) if axis == 1 else \
           np.array([np.median(lum[i][m[i]]) if m[i].any() else np.nan for i in range(a.shape[0])])
    good = ~np.isnan(prof); prof = np.interp(np.arange(len(prof)), np.where(good)[0], prof[good])
    prof = cv2.GaussianBlur(prof.reshape(1, -1).astype(np.float32), (0, 0), max(2, len(prof)/40)).ravel()
    gain = np.median(prof)/np.maximum(prof, 1)
    f = f*(gain[None, :, None] if axis == 1 else gain[:, None, None])
    return np.clip(f, 0, 255).astype(np.uint8)

def feather(rgb, fx=.16, fy=.1):
    h, w = rgb.shape[:2]
    rx = np.clip(np.minimum(np.arange(w), np.arange(w)[::-1])/(w*fx), 0, 1)
    ry = np.clip(np.minimum(np.arange(h), np.arange(h)[::-1])/(h*fy), 0, 1)
    al = (np.outer(ry, rx)**1.2*255).astype(np.uint8)
    return np.dstack([rgb, al])

def save(rgba, name):
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, name), 'WEBP', quality=88, method=6, exact=True)
    print('decal', name, rgba.shape[1], 'x', rgba.shape[0])

def rgb(img, box): return np.asarray(img.crop(box))
def bgr(a): return cv2.cvtColor(np.ascontiguousarray(a), cv2.COLOR_RGB2BGR)
def rgbx(a): return cv2.cvtColor(a, cv2.COLOR_BGR2RGB)
# gummies: the print on the frosted top (logo, tagline, "A little better. Every day.")
g = rgb(load('gummies.png'), (330, 282, 630, 532))
g = flatten(unwrap(g, np.arcsin(.86)), 1, lambda f: f.mean(2) > 170)
save(feather(rgbx(up(bgr(g))), .18, .16), 'decal-gummies.webp')
# inhaler: teal pill label (cut to its pill shape) and the small logo near the base
inh = load('inhaler.png')
lab = rgbx(up(bgr(rgb(inh, (812, 554, 963, 1042))))); h, w = lab.shape[:2]
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); r = w/2
d = np.where(yy < r, np.hypot(xx - r, yy - r), np.where(yy > h - r, np.hypot(xx - r, yy - (h - r)), np.abs(xx - r))) - (r - 1.5)
save(np.dstack([lab, (np.clip(.5 - d/1.5, 0, 1)*255).astype(np.uint8)]), 'decal-inhaler.webp')
lg = rgb(inh, (792, 1058, 978, 1114)).astype(np.float32); lum = lg.mean(2)
bgl = np.median(lum); a = np.clip((lum - bgl - 12)/(150 - bgl), 0, 1)
save(np.dstack([np.full(lg.shape, 232, np.uint8), (a*255).astype(np.uint8)]), 'decal-inhaler-logo.webp')
# calm roll-on: the cream label of the lying bottle, flattened, then turned upright
ro = rgb(load('rollon.png'), (468, 272, 808, 392))
ro = flatten(unwrap(ro, np.arcsin(.9), axis=0), 0, lambda f: f.mean(2) > 180)
ro = np.ascontiguousarray(np.rot90(ro, 1))
save(feather(rgbx(up(bgr(ro))), .14, .04), 'decal-rollon.webp')
# reviva: the dark green label on the amber bottle
rv = rgb(load('reviva.png'), (707, 472, 883, 908))
rv = flatten(unwrap(rv, np.arcsin(.9)), 1, lambda f: (f[..., 1] > f[..., 0]) & (f.mean(2) < 90))
save(feather(rgbx(up(bgr(rv))), .12, .03), 'decal-reviva.webp')
# liver booster: the print on the frosted green bottle
lv = rgb(load('liver.png'), (770, 392, 966, 838))
lv = flatten(unwrap(lv, np.arcsin(.9)), 1, lambda f: (f.mean(2) > 150) & (f.mean(2) < 235))
save(feather(rgbx(up(bgr(lv))), .16, .08), 'decal-liver.webp')
