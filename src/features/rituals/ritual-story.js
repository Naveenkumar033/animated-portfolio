// Pinned ritual story: turning jar, gliding cards, five-jar finale.
import * as THREE from 'three';
import { PRODUCTS } from '../../data/products.js';
import { STORY } from '../../data/rituals.js';
import { jarLayer } from '../products/jar-layer.js';
import { gummyGeometry, studioLeaf } from '../products/product-model.js';
import { icon } from './icons.js';
import { $, $$ } from '../../utils/dom.js';
import { clamp, ease, lerp, seeded, smooth } from '../../utils/math.js';
import { reduce } from '../../utils/media.js';

function initStory(){
  const root = $('#seq'), pin = $('#seqPin'), canvas = $('#seqCanvas');
  if (!root || !canvas || typeof THREE === 'undefined') return null;
  const NP = PRODUCTS.length, L = jarLayer(canvas), jars = PRODUCTS.map((p, i) => L.jar(p, i));
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
  const cards = $$('.sc', root), notes = $$('.sn', root), labels = $$('.sl', root), final = $('#seqFinal');
  const rot = STORY.map((s, i) => (i % 2 ? 1 : -1)*(2 + R()*3));
  // title words fly in from the centre, like a burst
  const title = $('#seqTitle');
  { let n = 0; title.querySelectorAll('[data-split]').forEach(line => { const words = line.textContent.trim().split(/\s+/); line.innerHTML = words.map(w => `<span class="w" style="--i:${n++}">${w}</span>`).join(' '); });
    const ws = $$('.w', title), mid = (ws.length - 1)/2; ws.forEach((w, k) => w.style.setProperty('--dx', ((mid - k)*42).toFixed(0) + '%')); }
  const arcs = $$('.seq-arcs path', root).map(pth => ({ pth, len:pth.getTotalLength() }));

  // finale props: herbs and gummies that pop in around the lineup
  const props = [], gGeo = gummyGeometry(.17);
  const pcol = ['#8cc63f', '#e0a95c', '#9c86c9', '#a6d455', '#d6b04a', '#b9a6de', '#79b22f', '#f0d9b0'];
  const spots = [[.08,.36],[.17,.78],[.9,.34],[.83,.8],[.27,.28],[.73,.26],[.04,.66],[.96,.62],[.36,.86],[.64,.88],[.15,.52],[.86,.52]];
  spots.forEach(([x, y], k) => {
    const leaf = k % 3 === 0;
    const m = leaf ? studioLeaf(['#5d9a44', '#6fa84f', '#4f8a3c'][k % 3], L.T) : new THREE.Mesh(gGeo, new THREE.MeshPhysicalMaterial({ color:new THREE.Color(pcol[k % pcol.length]).convertSRGBToLinear(), roughness:.3, clearcoat:.9, clearcoatRoughness:.15 }));
    m.visible = false; L.scene.add(m);
    props.push({ m, leaf, x, y, sx:x < .5 ? -.15 : 1.15, sy:y + .35, s:(leaf ? 1.1 : .75) + R()*.5, r0:R()*6, d:k*.05 });
  });

  let mobile = false;
  const resize = () => { L.resize(); mobile = L.W < 760 || L.W/L.H < .9; };
  window.addEventListener('resize', resize); resize();

  const S0 = .03, ST = .148, DUR = .25, FIN = .8;
  const sOf = i => S0 + i*ST, cOf = i => sOf(i) + DUR/2, mOf = i => i < NP - 1 ? (cOf(i) + cOf(i + 1))/2 : 2;
  let cur = 0, tNow = 0, last = performance.now(), finAt = -1, finDir = 0, finV = 0, playing = false;
  (function frame(now){
    requestAnimationFrame(frame);
    const rect = root.getBoundingClientRect(), vh = window.innerHeight;
    if (rect.bottom < -vh*.2 || rect.top > vh*1.2){ last = now; return; }
    const dt = Math.min(.1, (now - last)/1000); last = now; tNow += Math.min(dt, .05);
    const target = clamp(-rect.top/Math.max(1, rect.height - vh), 0, 1);
    cur += (target - cur)*(1 - Math.exp(-dt*(reduce ? 60 : 10))); if (Math.abs(target - cur) < 1e-5) cur = target;
    const p = cur, W = L.W, H = L.H;

    // white arcs draw in, then draw away
    arcs.forEach((a, k) => { const st = .02 + k*.3, hd = clamp((p - st)/.22, 0, 1), tl = clamp((p - st - .2)/.22, 0, 1);
      a.pth.style.strokeDasharray = `${((hd - tl)*a.len).toFixed(1)} ${a.len.toFixed(1)}`; a.pth.style.strokeDashoffset = (-tl*a.len).toFixed(1); });

    // feature cards glide up past the jar
    cards.forEach((el, i) => { const t = clamp((p - sOf(i))/DUR, 0, 1), on = t > 0 && t < 1;
      el.style.visibility = on ? 'visible' : 'hidden';
      if (on){ const y = lerp(.66, -.66, ease.glide(t))*vh + (mobile ? vh*.2 : 0), xs = (i % 2 ? -1 : 1)*4*(1 - t); el.style.transform = `translate(${xs.toFixed(2)}%, calc(-50% + ${y.toFixed(1)}px)) rotate(${(rot[i]*t).toFixed(2)}deg)`; }
      const n = notes[i], vis = smooth(.22, .38, t)*(1 - smooth(.62, .78, t));
      n.style.opacity = vis.toFixed(3); n.style.transform = `translateY(${((.5 - t)*vh*.35).toFixed(1)}px) rotate(${(i % 2 ? 4 : -4)}deg)`; });

    // the finale plays once you reach it, and rewinds if you scroll back
    const fin = ease.io(clamp((p - FIN)/.12, 0, 1));
    if (p > .84 && !playing){ playing = true; final.classList.add('play'); finAt = now; finDir = 1; }
    if (p < .78 && playing){ playing = false; final.classList.remove('play'); finAt = now; finDir = -1; }
    if (finDir > 0) finV = clamp(finV + dt/1.3, 0, 1); else if (finDir < 0) finV = clamp(finV - dt/.45, 0, 1);

    // jars: one at a time in the glide, then all five line up
    const gap = Math.min(W*(mobile ? .19 : .16), mobile ? 120 : 270);
    jars.forEach((jar, i) => {
      const a = i === 0 ? -9 : mOf(i - 1), b = mOf(i);
      const grow = i === 0 ? 1 : ease.back(clamp((p - a)/.04, 0, 1)), shrink = 1 - ease.inn(clamp((p - (b - .035))/.035, 0, 1));
      const one = grow*shrink, spin = (1 - grow)*Math.PI*2.2 - (1 - shrink)*Math.PI*1.6;
      const side = i % 2 ? -1 : 1;
      const x1 = mobile ? W*.5 : W*.5 + side*W*.075, y1 = mobile ? H*.33 : H*.52, h1 = mobile ? Math.min(H*.34, W*.66)*(jar.tube ? 1.12 : 1) : H*(jar.tube ? .58 : .46);
      const row = mobile ? (i < 3 ? 0 : 1) : 0, col = mobile ? (i < 3 ? i - 1 : (i - 3) - .5) : i - 2;
      const x2 = W*.5 + col*(mobile ? W*.3 : gap), y2 = mobile ? H*(.5 + row*.24) : H*.67, h2 = (mobile ? H*.15 : H*.29)*(jar.tube ? 1.14 : 1);
      let x, y, h, sc, yaw;
      const yaw1 = (p - cOf(i))*7 + spin + Math.sin(tNow*.6)*.06, yaw2 = (i - 2)*-.18 + Math.sin(tNow*.5 + i)*.12;
      if (i === NP - 1){ x = lerp(x1, x2, fin); y = lerp(y1, y2, fin); h = lerp(h1, h2, fin); sc = one; yaw = lerp(yaw1, yaw2, fin); }
      else { const e = ease.back(clamp(fin*1.5 - i*.1, 0, 1)); x = x2; y = y2 + (1 - e)*H*.8; h = h2; sc = fin > 0 ? e : one; yaw = fin > 0 ? yaw2 : yaw1;
        if (fin <= 0){ x = x1; y = y1; h = h1; } }
      jar.G.visible = sc > .004;
      L.size(jar, h*sc); L.place(jar.G, x, y + Math.sin(tNow*.9 + i)*4);
      jar.G.rotation.set(.06*Math.sin((p - cOf(i))*9) + .04, yaw, (fin > 0 ? 0 : side*.05*Math.sin((p - cOf(i))*7)));
      const lb = labels[i]; if (lb){ lb.style.left = (x2/W*100).toFixed(2) + '%'; lb.style.top = ((y2 + h2*.62)/H*100).toFixed(2) + '%'; }
    });
    // herbs and gummies spring into place around the lineup
    const ppu = L.ppu();
    props.forEach((o, k) => { const e = ease.elastic(clamp((finV - o.d)/.7, 0, 1)); o.m.visible = finV > .01;
      L.place(o.m, lerp(o.sx, o.x, e)*W, lerp(o.sy, o.y, e)*H + Math.sin(tNow*1.1 + k)*5);
      o.m.position.z = 2; o.m.scale.setScalar(Math.max(.0001, o.s*(H*(mobile ? .05 : .075))/ppu*(o.leaf ? 1.3 : 1)*clamp(e, 0, 1.4)));
      o.m.rotation.set(o.r0 + tNow*.35, o.r0*.7 + tNow*.25, o.leaf ? .4 : o.r0); });
    L.renderer.render(L.scene, L.cam);
  })(performance.now());
  return { resize };
}

export { initStory };
