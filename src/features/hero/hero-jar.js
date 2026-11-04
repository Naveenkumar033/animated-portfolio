// Hero 3D gummies jar that rises in and follows the pointer, with gummies orbiting it.
import * as THREE from 'three';
import { PRODUCTS } from '../../data/products.js';
import { jarLayer } from '../products/jar-layer.js';
import { berryGeometry, gummyMaterial } from '../products/product-model.js';
import { $ } from '../../utils/dom.js';
import { clamp, ease, seeded } from '../../utils/math.js';

function initHeroJar(){
  const canvas = $('#heroCanvas'), stage = $('#home'); if (!canvas || typeof THREE === 'undefined') return null;
  const L = jarLayer(canvas), p = PRODUCTS[0], jar = L.jar(p, 0);
  const R = seeded(5), props = [];
  const gGeo = berryGeometry(.17, 1.4);
  for (let k = 0; k < 7; k++){ const mat = gummyMaterial(); mat.color.set(p.gummy[k % p.gummy.length]).convertSRGBToLinear(); const m = new THREE.Mesh(gGeo, mat); L.scene.add(m); props.push({ m, a:k*1.05 + R(), r:1.25 + R()*.45, y:(R() - .5)*1.1, s:.55 + R()*.5, sp:.25 + R()*.25 }); }
  const mouse = { x:0, y:0, tx:0, ty:0 };
  window.addEventListener('pointermove', e => { mouse.tx = e.clientX/innerWidth - .5; mouse.ty = e.clientY/innerHeight - .5; });
  let at = -1, tNow = 0, last = performance.now(), mobile = false;
  const resize = () => { L.resize(); mobile = L.W < 760; };
  window.addEventListener('resize', resize); resize();
  (function frame(now){
    requestAnimationFrame(frame);
    const r = stage.getBoundingClientRect(); if (r.bottom < 0) { last = now; return; }
    const dt = Math.min(.05, (now - last)/1000); last = now; tNow += dt;
    mouse.x += (mouse.tx - mouse.x)*.05; mouse.y += (mouse.ty - mouse.y)*.05;
    const e = at < 0 ? 0 : ease.back(clamp((now - at)/1700, 0, 1)), sy = clamp(-r.top/Math.max(1, r.height), 0, 1);
    const sp = mobile ? $('.stage-space') : null;
    const cx = mobile ? L.W*.5 : L.W*.37, cy = mobile ? sp.offsetTop + sp.offsetHeight*.48 : L.H*.64, pxH = mobile ? Math.min(sp.offsetHeight*.66, L.W*.62) : L.H*.44;
    L.size(jar, pxH*(.6 + .4*e)); L.place(jar.G, cx + mouse.x*14, cy + (1 - e)*L.H*.5 + Math.sin(tNow*.9)*5 - sy*L.H*.12);
    jar.G.rotation.set(.05 + mouse.y*.12, -.35 + (1 - e)*-5 + Math.sin(tNow*.45)*.32 + mouse.x*.45 + sy*1.6, -.03 + Math.sin(tNow*.6)*.025);
    const u = pxH/L.ppu();
    props.forEach((o, k) => { const a = o.a + tNow*o.sp, rr = o.r*u*.42*(1 + (1 - e)*.6);
      o.m.position.set(jar.G.position.x + Math.cos(a)*rr, jar.G.position.y + o.y*u*.45 + Math.sin(tNow + k)*u*.03, Math.sin(a)*rr*.6);
      o.m.scale.setScalar(o.s*u*(o.leaf ? .16 : .1)*e); o.m.rotation.set(tNow*.4 + k, tNow*.3 + a, o.leaf ? .6 : k); });
    L.renderer.render(L.scene, L.cam);
  })(performance.now());
  return { start(){ if (at < 0) at = performance.now(); } };
}

export { initHeroJar };
