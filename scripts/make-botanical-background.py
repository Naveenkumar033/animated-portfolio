"""Generates src/assets/images/botanical-background.jpg: an original soft botanical
"intentional camera movement" image (blurred green fronds + flowing light strands).

Usage:  python scripts/make-botanical-background.py [output.jpg]
"""
import os, sys
import numpy as np, cv2
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'images', 'botanical-background.jpg')
rng = np.random.default_rng(7)
W, H = 1500, 1100
# soft white/sage base
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
base = np.zeros((H, W, 3), np.float32)
lum = 1.02 - .08*(xx/W) - .05*(yy/H)
base[...] = np.dstack([lum*246, lum*248, lum*240])[..., ::-1]   # BGR
img = base.copy()
# a fern-like frond rising from the bottom right, plus a second softer one
def frond(img, x0, y0, x1, y1, bend, n, size, cols, alpha):
    t = np.linspace(0, 1, n)
    px = x0 + (x1 - x0)*t + bend*np.sin(t*np.pi); py = y0 + (y1 - y0)*t
    layer = np.zeros_like(img); mask = np.zeros(img.shape[:2], np.float32)
    for k in range(n - 1):
        cv2.line(layer, (int(px[k]), int(py[k])), (int(px[k+1]), int(py[k+1])), cols[0], int(10*(1 - t[k]) + 3), cv2.LINE_AA)
        cv2.line(mask, (int(px[k]), int(py[k])), (int(px[k+1]), int(py[k+1])), 1, int(10*(1 - t[k]) + 3), cv2.LINE_AA)
    for k in range(4, n, 2):
        L = size*(1 - t[k]*.7)*(.8 + .4*rng.random())
        for sg in (-1, 1):
            ang = np.arctan2(py[k+1 if k+1 < n else k] - py[k-1], px[k+1 if k+1 < n else k] - px[k-1]) + sg*(1.0 + .3*rng.random())
            ex, ey = px[k] + np.cos(ang)*L, py[k] + np.sin(ang)*L
            c = cols[rng.integers(len(cols))]
            pts = np.array([[px[k], py[k]], [ (px[k] + ex)/2 + np.cos(ang + 1.57)*L*.12, (py[k] + ey)/2 + np.sin(ang + 1.57)*L*.12 ], [ex, ey], [ (px[k] + ex)/2 - np.cos(ang + 1.57)*L*.12, (py[k] + ey)/2 - np.sin(ang + 1.57)*L*.12 ]], np.int32)
            cv2.fillPoly(layer, [pts], c, cv2.LINE_AA); cv2.fillPoly(mask, [pts], 1, cv2.LINE_AA)
    m = (mask*alpha)[..., None]; img[:] = img*(1 - m) + layer*m
G = [(30, 78, 26), (40, 98, 34), (24, 60, 20), (58, 122, 50), (44, 104, 70)]     # BGR greens
frond(img, 1180, 1150, 900, -40, 140, 70, 230, G, .95)
frond(img, 1420, 1150, 1260, 200, -90, 50, 170, [(54, 110, 62), (70, 130, 80), (90, 140, 96)], .7)
frond(img, 980, 1150, 1110, 420, 60, 34, 130, [(60, 120, 70), (82, 140, 92)], .55)
frond(img, 1300, 900, 1180, 60, 110, 44, 150, [(34, 86, 30), (46, 104, 40)], .8)
# a few ochre glints along the stems
for k in range(14):
    x = 900 + rng.random()*420; y = 200 + rng.random()*860
    cv2.circle(img, (int(x), int(y)), int(4 + rng.random()*7), (60, 150, 190), -1, cv2.LINE_AA)
# intentional-camera-movement blur: integrate along a wavy, mostly vertical flow field
ang = -np.pi/2 + .28 + .32*np.sin(yy/210 + xx/390) + .12*np.sin(xx/140)
dx, dy = np.cos(ang), np.sin(ang)
acc = np.zeros_like(img); wsum = 0
steps, step = 46, 2.4
for sgn in (1, -1):
    X, Y = xx.copy(), yy.copy()
    for s in range(steps):
        w = np.exp(-(s/steps)**2*2.2)
        mx = cv2.remap(dx.astype(np.float32), X, Y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        my = cv2.remap(dy.astype(np.float32), X, Y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        X += sgn*mx*step; Y += sgn*my*step
        acc += w*cv2.remap(img, X, Y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT); wsum += w
blur = acc/wsum
noise = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), 1.6)
nacc = np.zeros_like(noise); nw = 0
for sgn in (1, -1):
    X, Y = xx.copy(), yy.copy()
    for s_ in range(40):
        mx = cv2.remap(dx.astype(np.float32), X, Y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        my = cv2.remap(dy.astype(np.float32), X, Y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        X += sgn*mx*2.5; Y += sgn*my*2.5
        nacc += cv2.remap(noise, X, Y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT); nw += 1
lic = nacc/nw; lic = (lic - lic.mean())/lic.std()
dark = 1 - blur.mean(2, keepdims=True)/255
blur = blur*(1 + lic[..., None]*.11*np.clip(dark*2.2 - .08, 0, 1))
# silky white light strands that follow the same flow
strand = np.zeros((H, W), np.float32)
for k in range(16):
    x, y = W*.35 + rng.random()*W*.62, H + 40; pts = []
    for s in range(260):
        a = -np.pi/2 + .28 + .32*np.sin(y/210 + x/390) + .12*np.sin(x/140)
        x += np.cos(a)*6; y += np.sin(a)*6; pts.append((x, y))
        if y < -40: break
    pts = np.array(pts, np.int32)
    cv2.polylines(strand, [pts], False, float(.35 + .65*rng.random()), int(1 + rng.random()*3), cv2.LINE_AA)
strand = .7*cv2.GaussianBlur(strand, (0, 0), 1.6) + .9*cv2.GaussianBlur(strand, (0, 0), 12)
out = blur + (255 - blur)*np.clip(strand*.62, 0, 1)[..., None]
# ochre filaments
fil = np.zeros((H, W), np.float32)
for k in range(9):
    x, y = 880 + rng.random()*420, H + 20; pts = []
    for s2 in range(220):
        a = -np.pi/2 + .28 + .32*np.sin(y/210 + x/390) + .12*np.sin(x/140)
        x += np.cos(a)*6; y += np.sin(a)*6; pts.append((x, y))
        if y < -20: break
    cv2.polylines(fil, [np.array(pts, np.int32)], False, 1.0, 1, cv2.LINE_AA)
fil = cv2.GaussianBlur(fil, (0, 0), 1.1)
out = out*(1 - fil[..., None]*.55) + np.array([70, 160, 200], np.float32)*fil[..., None]*.55
# gentle haze and grain
out = cv2.addWeighted(out, .82, cv2.GaussianBlur(out, (0, 0), 24), .18, 0)
out += rng.normal(0, 2.2, out.shape[:2]).astype(np.float32)[..., None]
out = np.clip(out, 0, 255).astype(np.uint8)
out = cv2.resize(out, (1280, 940), interpolation=cv2.INTER_AREA)
cv2.imwrite(OUT, out, [cv2.IMWRITE_JPEG_QUALITY, 80])
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
