// Pinned product story: each real product (cut out of the client's design) comes forward while its card glides past,
// then all five line up.
import { PRODUCTS } from '../../data/products.js';
import { STORY } from '../../data/product-story.js';
import { CUTS } from '../products/product-images.js';
import { icon } from './icons.js';
import { $, $$ } from '../../utils/dom.js';
import { clamp, ease, lerp, seeded, smooth } from '../../utils/math.js';
import { reduce } from '../../utils/media.js';

function initStory(){
  const root = $('#seq'), pin = $('#seqPin'), layer = $('#seqProds');
  if (!root || !layer) return null;
  const NP = PRODUCTS.length;
  const R = seeded(19);

  // cards, notes and finale labels
  $('#seqCards').innerHTML = STORY.map((s, i) => `<article class="sc ${i % 2 ? 'sc-r' : 'sc-l'}" style="--c:${s.c}">
      <span class="sc-st">${icon(s.ic)}</span>
      <p class="sc-k">${PRODUCTS[i].no} · ${PRODUCTS[i].name}</p>
      <h3><span>${s.t[0]}</span><span>${s.t[1]}</span></h3>
      <p class="sc-d">${icon('spark', 'sc-i')}${s.d}</p>
    </article>`).join('');
  $('#seqNotes').innerHTML = STORY.map((s, i) => `<p class="sn ${i % 2 ? 'sn-l' : 'sn-r'}">${s.note}<svg viewBox="0 0 120 60" aria-hidden="true"><path d="${i % 2 ? 'M110 8C80 10 50 24 30 48m0 0l2-14m-2 14l13-5' : 'M10 8c30 2 60 16 80 40m0 0l-2-14m2 14l-13-5'}"/></svg></p>`).join('');
  $('#seqLabels').innerHTML = PRODUCTS.map(p => `<span class="sl">${p.short}</span>`).join('');
  layer.innerHTML = PRODUCTS.map(p => `<img class="sp" src="${CUTS[p.id]}" alt="" decoding="async">`).join('');
  const cards = $$('.sc', root), notes = $$('.sn', root), labels = $$('.sl', root), final = $('#seqFinal'), imgs = $$('.sp', layer);
  const rot = STORY.map((s, i) => (i % 2 ? 1 : -1)*(2 + R()*3));
  // title words fly in from the centre, like a burst
  const title = $('#seqTitle');
  { let n = 0; title.querySelectorAll('[data-split]').forEach(line => { const words = line.textContent.trim().split(/\s+/); line.innerHTML = words.map(w => `<span class="w" style="--i:${n++}">${w}</span>`).join(' '); });
    const ws = $$('.w', title), mid = (ws.length - 1)/2; ws.forEach((w, k) => w.style.setProperty('--dx', ((mid - k)*42).toFixed(0) + '%')); }
  const arcs = $$('.seq-arcs path', root).map(pth => ({ pth, len:pth.getTotalLength() }));

  let W = 1, H = 1, mobile = false;
  const resize = () => { const r = pin.getBoundingClientRect(); W = r.width || innerWidth; H = r.height || innerHeight; mobile = W < 760 || W/H < .9; };
  window.addEventListener('resize', resize); resize();
  // fit a product image inside a box (keeps the photo's own proportions)
  const ar = i => (imgs[i].naturalWidth || 1)/(imgs[i].naturalHeight || 1);
  function place(i, x, y, bw, bh, sc, op, blur, tilt){
    const a = ar(i); let h = bh, w = h*a; if (w > bw){ w = bw; h = w/a; }
    const el = imgs[i];
    el.style.width = w.toFixed(1) + 'px';
    el.style.transform = `translate3d(${(x - w/2).toFixed(1)}px, ${(y - h/2).toFixed(1)}px, 0) scale(${sc.toFixed(3)}) rotate(${tilt.toFixed(2)}deg)`;
    el.style.opacity = op.toFixed(3);
    el.style.filter = blur > .2 ? `blur(${blur.toFixed(1)}px) drop-shadow(0 24px 22px rgba(31,70,35,.22))` : 'drop-shadow(0 24px 22px rgba(31,70,35,.22))';
    el.style.visibility = op > .004 ? 'visible' : 'hidden';
  }

  const S0 = .03, ST = .148, DUR = .25, FIN = .8;
  const sOf = i => S0 + i*ST, cOf = i => sOf(i) + DUR/2, mOf = i => i < NP - 1 ? (cOf(i) + cOf(i + 1))/2 : 2;
  let cur = 0, last = performance.now(), playing = false;
  (function frame(now){
    requestAnimationFrame(frame);
    const rect = root.getBoundingClientRect(), vh = window.innerHeight;
    if (rect.bottom < -vh*.2 || rect.top > vh*1.2){ last = now; return; }
    const dt = Math.min(.1, (now - last)/1000); last = now;
    const target = clamp(-rect.top/Math.max(1, rect.height - vh), 0, 1);
    cur += (target - cur)*(1 - Math.exp(-dt*(reduce ? 60 : 10))); if (Math.abs(target - cur) < 1e-5) cur = target;
    const p = cur;

    // white arcs draw in, then draw away
    arcs.forEach((a, k) => { const st = .02 + k*.3, hd = clamp((p - st)/.22, 0, 1), tl = clamp((p - st - .2)/.22, 0, 1);
      a.pth.style.strokeDasharray = `${((hd - tl)*a.len).toFixed(1)} ${a.len.toFixed(1)}`; a.pth.style.strokeDashoffset = (-tl*a.len).toFixed(1); });

    // feature cards glide up past the product
    cards.forEach((el, i) => { const t = clamp((p - sOf(i))/DUR, 0, 1), on = t > 0 && t < 1;
      el.style.visibility = on ? 'visible' : 'hidden';
      if (on){ const y = lerp(.66, -.66, ease.glide(t))*vh + (mobile ? vh*.2 : 0), xs = (i % 2 ? -1 : 1)*4*(1 - t); el.style.transform = `translate(${xs.toFixed(2)}%, calc(-50% + ${y.toFixed(1)}px)) rotate(${(rot[i]*t).toFixed(2)}deg)`; }
      const n = notes[i], vis = smooth(.22, .38, t)*(1 - smooth(.62, .78, t));
      n.style.opacity = vis.toFixed(3); n.style.transform = `translateY(${((.5 - t)*vh*.35).toFixed(1)}px) rotate(${(i % 2 ? 4 : -4)}deg)`; });

    // the finale plays once you reach it, and rewinds if you scroll back
    const fin = ease.io(clamp((p - FIN)/.12, 0, 1));
    if (p > .84 && !playing){ playing = true; final.classList.add('play'); }
    if (p < .78 && playing){ playing = false; final.classList.remove('play'); }

    // products: one at a time (coming forward out of a blur), then all five line up
    const gap = Math.min(W*(mobile ? .19 : .16), mobile ? 120 : 270), blurMax = reduce ? 0 : 16;
    PRODUCTS.forEach((pr, i) => {
      const a = i === 0 ? -9 : mOf(i - 1), b = mOf(i);
      const grow = i === 0 ? 1 : ease.out(clamp((p - a)/.045, 0, 1)), shrink = 1 - ease.inn(clamp((p - (b - .035))/.035, 0, 1));
      const one = grow*shrink, side = i % 2 ? -1 : 1;
      const x1 = mobile ? W*.5 : W*.5 + side*W*.075, y1 = mobile ? H*.33 : H*.52;
      const bh1 = (mobile ? Math.min(H*.34, W*.66) : H*.5), bw1 = mobile ? W*.8 : W*.27;
      const row = mobile ? (i < 3 ? 0 : 1) : 0, col = mobile ? (i < 3 ? i - 1 : (i - 3) - .5) : i - 2;
      const x2 = W*.5 + col*(mobile ? W*.3 : gap), y2 = mobile ? H*(.5 + row*.24) : H*.67;
      const bh2 = mobile ? H*.17 : H*.31, bw2 = mobile ? W*.28 : gap*.92;
      let x, y, bw, bh, sc, op, bl;
      if (i === NP - 1){ x = lerp(x1, x2, fin); y = lerp(y1, y2, fin); bw = lerp(bw1, bw2, fin); bh = lerp(bh1, bh2, fin); sc = .7 + .3*one; op = one; bl = (1 - one)*blurMax; }
      else if (fin > 0){ const e = ease.back(clamp(fin*1.5 - i*.1, 0, 1)); x = x2; y = y2 + (1 - e)*H*.5; bw = bw2; bh = bh2; sc = .6 + .4*clamp(e, 0, 1.2); op = clamp(e*1.4, 0, 1); bl = (1 - clamp(e, 0, 1))*blurMax; }
      else { x = x1; y = y1 + (1 - grow)*H*.08 - (1 - shrink)*H*.06; bw = bw1; bh = bh1; sc = .72 + .28*one; op = one; bl = (1 - one)*blurMax; }
      const tilt = fin > 0 ? 0 : side*1.2*Math.sin((p - cOf(i))*7);
      place(i, x, y, bw, bh, sc, op, bl, tilt);
      const lb = labels[i]; if (lb){ lb.style.left = (x2/W*100).toFixed(2) + '%'; lb.style.top = ((y2 + bh2*.56)/H*100).toFixed(2) + '%'; }
    });
  })(performance.now());
  return { resize };
}

export { initStory };
