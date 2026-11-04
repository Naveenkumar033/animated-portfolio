// Pinned molecule pipeline scene with the vertical timeline.
import * as THREE from 'three';
import { NSTAGE, RX } from '../../data/pipeline.js';
import { buildChain } from './molecule-chain.js';
import { radialCanvas } from '../../lib/canvas-art.js';
import { envCube } from '../../lib/environment.js';
import { $, $$ } from '../../utils/dom.js';
import { clamp, lerp, seeded, smooth } from '../../utils/math.js';
import { reduce } from '../../utils/media.js';

function initReactor(getProgress){
  const canvas = $('#reactCanvas'), pin = $('#pin'), tag = $('#molTag');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.environment = envCube();
  const cam = new THREE.PerspectiveCamera(35, 1, .1, 80); cam.position.set(0, 0, 15);
  scene.add(new THREE.HemisphereLight(0xf2f5e2, 0x24351f, .6));
  const key = new THREE.DirectionalLight(0xfff0cf, 1.7); key.position.set(4, 7, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe6a8, .9); rim.position.set(-6, 2, -5); scene.add(rim);

  const T = c => { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; };
  const sparkTex = T(radialCanvas('rgba(255,244,214,1)', 'rgba(255,220,150,0)', 64));
  const world = new THREE.Group(); scene.add(world);
  const molG = new THREE.Group(); world.add(molG);
  const CH = buildChain();

  // meshes
  const sphere = new THREE.SphereGeometry(1, 40, 28), cyl = new THREE.CylinderGeometry(1, 1, 1, 18, 1, true);
  const atomMesh = CH.atoms.map(a => { const m = new THREE.Mesh(sphere, new THREE.MeshPhysicalMaterial({ color:a.base, roughness:.2, clearcoat:1, clearcoatRoughness:.12, envMapIntensity:1.2, emissive:0x000000 })); m.scale.setScalar(a.rad); m.visible = false; molG.add(m); return m; });
  const bondMat = new THREE.MeshStandardMaterial({ color:0xd7dfc8, roughness:.35, metalness:.05, envMapIntensity:.8 });
  const bondMesh = CH.bonds.map(() => { const m = new THREE.Mesh(cyl, bondMat); m.visible = false; molG.add(m); return m; });
  // flash, shock ring, sparks, byproduct
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map:sparkTex, color:0xffe2a0, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending })); flash.visible = false; molG.add(flash);
  const shock = new THREE.Mesh(new THREE.TorusGeometry(1, .011, 8, 120), new THREE.MeshBasicMaterial({ color:0xe0a53a, transparent:true, depthWrite:false })); shock.visible = false; molG.add(shock);
  const NS = 36, sp = new Float32Array(NS*3), sdir = []; { const R = seeded(5); for (let i=0;i<NS;i++){ const v = new THREE.Vector3(R()-.5, R()-.5, R()-.5).normalize().multiplyScalar(.6 + R()*1.2); sdir.push(v); } }
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sparks = new THREE.Points(sgeo, new THREE.PointsMaterial({ size:.34, map:sparkTex, color:0xffe6a8, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending })); sparks.frustumCulled = false; sparks.visible = false; molG.add(sparks);
  const by = new THREE.Group(); molG.add(by); by.visible = false;
  [[0,0,0,.2,0xf6f2e4],[.38,-.28,0,.13,0xbfe3ff],[-.38,-.28,0,.13,0xbfe3ff]].forEach(([x,y,z,r,c]) => { const m = new THREE.Mesh(sphere, new THREE.MeshPhysicalMaterial({ color:c, roughness:.15, clearcoat:1, envMapIntensity:1.2, transparent:true })); m.position.set(x,y,z); m.scale.setScalar(r); by.add(m); });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:sparkTex, color:0xffd98a, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0 })); halo.scale.setScalar(13); halo.position.z = -2; world.add(halo);
  const crown = new THREE.Mesh(new THREE.TorusGeometry(4.1, .02, 8, 160), new THREE.MeshBasicMaterial({ color:0xe7c680, transparent:true, opacity:0, depthWrite:false })); crown.rotation.x = 1.15; world.add(crown);

  // ambient drifting molecules (parallax on scroll)
  const AN = 30, amb = new THREE.InstancedMesh(sphere, new THREE.MeshStandardMaterial({ roughness:.4, transparent:true, opacity:.42, envMapIntensity:.6 }), AN), ambD = [];
  { const R = seeded(23), c = new THREE.Color(); for (let i=0;i<AN;i++){ ambD.push({ x:(R()-.5)*34, y:(R()-.5)*18, z:-4 - R()*12, s:.1 + R()*.24, sp:.4 + R()*1.2 }); c.setHex([0x5fa23a,0x2c6a34,0xdba43f,0x9cc27a][i%4]); amb.setColorAt(i, c); } }
  scene.add(amb); const ambM = new THREE.Matrix4(), ambS = new THREE.Vector3();

  // slides (the "pages" of the pipeline)
  const slidesEl = $('#slides'), ringEl = $('#wipeRing');
  const pipe = (k) => `<div class="pipe" aria-hidden="true"><div class="pipe-line"><i></i></div><ol>${RX.map((r, i) => `<li class="${i <= k ? 'lit' : ''}${i === k ? ' cur' : ''}"><em></em><b>${String(i+1).padStart(2,'0')}</b><span>${r.t}</span></li>`).join('')}</ol></div>`;
  slidesEl.innerHTML = RX.map((r, k) => `
    <article class="slide ${k % 2 === 0 ? 't-cream' : 't-green'}" data-k="${k}">
      <div class="halo"></div>
      <div class="slide-copy">
        <p class="eyebrow">The TranzLife pipeline</p>
        <p class="st-no"><b>${String(k+1).padStart(2,'0')}</b> / ${String(NSTAGE).padStart(2,'0')}</p>
        <h3 class="st-title">${r.t}</h3>
        <div class="eq"><span class="m">${r.a}</span><i>+</i><span class="m">${r.b}</span><i>→</i><span class="m out">${r.p}</span></div>
        <p class="st-desc">${r.d}</p>
        <div class="spec">${r.s.map(x => `<span>${x}</span>`).join('')}</div>
      </div>
      ${pipe(k)}
    </article>`).join('');
  const slides = $$('.slide', slidesEl);
  slides.forEach(s => s.addEventListener('click', e => { const li = e.target.closest('.pipe li'); if (li) window.dispatchEvent(new CustomEvent('tl:goStage', { detail:[...li.parentNode.children].indexOf(li) })); }));
  $$('.pipe li').forEach(li => li.style.pointerEvents = 'auto');

  // helpers
  const easeOutCubic = x => 1 - Math.pow(1 - x, 3), easeInCubic = x => x*x*x, easeIO = x => x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2;
  const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3*Math.pow(x - 1, 3) + c1*Math.pow(x - 1, 2); };
  const bump = (u, c, w) => Math.exp(-Math.pow((u - c)/w, 2));
  const Sk = CH.stages.map(s => Math.min(1, 3.35/s.Rpre)), Sk1 = CH.stages.map(s => Math.min(1, 3.35/s.Rpost));
  const spinAxis = new THREE.Vector3(.3, 1, .2).normalize(), up = new THREE.Vector3(0,1,0);
  const tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpC = new THREE.Color();
  const posCache = CH.atoms.map(() => new THREE.Vector3());
  const palCream = new THREE.Color(0x2c4a2c), palGreen = new THREE.Color(0xd7dfc8);
  let W = 1, H = 1, fit = 1, mobile = false, cur = 0, target = 0, visible = false, tNow = 0;

  function resize(){
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false); cam.aspect = W/H; cam.updateProjectionMatrix();
    const halfH = Math.tan(THREE.MathUtils.degToRad(17.5))*15, halfW = halfH*cam.aspect;
    mobile = W < 760 || cam.aspect < .9;
    if (!mobile){ world.position.set(halfW*.44, -.2, 0); fit = Math.min(1.05, (halfW*.5)/3.7, (halfH*.86)/3.7); }
    else { world.position.set(0, halfH*.3, 0); fit = Math.min(1, (halfW*.86)/3.7, (halfH*.4)/3.7); }
    halo.position.set(0, 0, -2); crown.scale.setScalar(Math.max(.55, fit*.9));
  }

  function apply(p){
    const s = clamp(p, 0, 1)*NSTAGE; const k = Math.min(NSTAGE - 1, Math.floor(s)); const u = Math.min(1, s - k);
    const ST = CH.stages[k], frame = CH.frames[k];
    const eShift = easeIO(clamp((u - .78)/.17, 0, 1));
    // jump phases
    const t1 = clamp((u - .04)/.38, 0, 1), t2 = clamp((u - .42)/.18, 0, 1);
    const gap = tmpV2.copy(ST.d).multiplyScalar(1.05);
    const off0 = ST.d.clone().multiplyScalar(10.5).add(new THREE.Vector3(0, 4.2, 0));
    const off = new THREE.Vector3();
    if (u < .42){ const e = easeOutCubic(t1); off.copy(off0).lerp(gap, e); off.y += Math.abs(Math.sin(t1*Math.PI*3))*(1.9*(1 - t1) + .28); }
    else off.copy(gap).multiplyScalar(1 - easeInCubic(t2));
    const theta = u < .42 ? (1 - easeIO(t1))*Math.PI*5 : 0;
    tmpQ.setFromAxisAngle(spinAxis, theta);
    const dockB = ST.placed.get(ST.aDock);
    const colF = easeOutCubic(clamp((u - .6)/.18, 0, 1));
    const snap = bump(u, .6, .025), pulse = 1 + .07*snap;
    // positions
    CH.atoms.forEach((a, id) => {
      const m = atomMesh[id];
      if (a.stage > k){ m.visible = false; return; }
      const pv = posCache[id];
      let scale = a.rad, col = a.base;
      if (a.stage < k){
        const base = frame.get(id); pv.copy(base).addScaledVector(ST.shift, eShift);
      } else { // joining fragment
        const dp = ST.placed.get(id); tmpV.copy(dp).sub(dockB).applyQuaternion(tmpQ); pv.copy(dockB).add(off).add(tmpV).addScaledVector(ST.shift, eShift);
        if (u < .04) scale = a.rad*.001;
      }
      if (k === 0 && a.stage === -1){ scale = a.rad*easeOutBack(clamp(p*NSTAGE/.1, 0, 1)); if (scale < .001) scale = .001; }
      m.visible = true; m.position.copy(pv); m.scale.setScalar(scale*(1 + .03*Math.sin(tNow*2 + id)));
      const mat = m.material;
      if (a.stage === k){ tmpC.copy(a.base).lerp(CH.atoms[ST.aId].base, .45*colF); mat.color.copy(tmpC); }
      else if (a.stage >= 0 && a.stage < k) mat.color.copy(a.base).lerp(CH.atoms[CH.stages[a.stage].aId].base, .45);
      else mat.color.copy(a.base);
      const glow = snap*.5 + (k === NSTAGE - 1 ? easeOutCubic(clamp((u - .8)/.2, 0, 1))*.22 : 0);
      mat.emissive.setRGB(glow*.9, glow*.7, glow*.3);
    });
    // bonds
    const tcream = (k % 2 === 0) ? 1 : 0, nextCream = ((k + 1) % 2 === 0) ? 1 : 0;
    const wp = u > .86 && k < NSTAGE - 1 ? easeIO((u - .86)/.14) : 0;
    const tc = lerp(tcream, nextCream, wp);
    bondMat.color.copy(palGreen).lerp(palCream, tc);
    CH.bonds.forEach((b, bi) => {
      const m = bondMesh[bi]; const A = atomMesh[b.i], B = atomMesh[b.j];
      if (CH.atoms[b.i].stage > k || CH.atoms[b.j].stage > k || (b.stage > k)){ m.visible = false; return; }
      let g = 1;
      if (b.stage === k && b.t0 >= 0) g = easeOutBack(clamp((u - b.t0)/(b.t1 - b.t0), 0, 1));
      else if (b.stage > k) g = 0;
      if (b.stage === -1 && k === 0) g = Math.min(1, A.scale.x > .01 ? 1 : 0);
      if (b.stage === k && b.t0 < 0 && u < .04) g = 0;
      if (g <= .001){ m.visible = false; return; }
      const pa = A.position, pb = B.position; tmpV.copy(pb).sub(pa); const L = tmpV.length(); if (L < .01){ m.visible = false; return; }
      tmpV.multiplyScalar(1/L); m.position.copy(pa).addScaledVector(tmpV, L*.5);
      m.quaternion.setFromUnitVectors(up, tmpV); m.scale.set(.085*(1 + .5*snap), L*Math.min(g, 1.04), .085*(1 + .5*snap)); m.visible = true;
    });
    // flash / shock / sparks / byproduct at the junction
    const J = tmpV2.copy(ST.J).addScaledVector(ST.shift, eShift);
    const fl = bump(u, .6, .022);
    flash.visible = fl > .02; flash.position.copy(J); flash.scale.setScalar(.8 + fl*5.5); flash.material.opacity = Math.min(1, fl*1.1);
    const ts = clamp((u - .58)/.22, 0, 1);
    shock.visible = ts > 0 && ts < 1; if (shock.visible){ shock.position.copy(J); shock.quaternion.copy(cam.quaternion); shock.scale.setScalar(.3 + easeOutCubic(ts)*3.3); shock.material.opacity = (1 - ts)*.8; }
    const tp = clamp((u - .58)/.28, 0, 1);
    sparks.visible = tp > 0 && tp < 1; if (sparks.visible){ for (let i=0;i<NS;i++){ const v = sdir[i], e = easeOutCubic(tp); sp[i*3] = J.x + v.x*e*2.6; sp[i*3+1] = J.y + v.y*e*2.6 - tp*tp*.6; sp[i*3+2] = J.z + v.z*e*2.6; } sgeo.attributes.position.needsUpdate = true; sparks.material.opacity = (1 - tp)*.95; }
    const tb = clamp((u - .6)/.34, 0, 1);
    by.visible = tb > 0 && tb < 1; if (by.visible){ const e = easeOutCubic(tb); by.position.copy(J).addScaledVector(tmpV.set(ST.d.x*.4 + .5, 1, ST.d.z*.4), 5.2*e); by.position.y += Math.sin(tb*Math.PI)*.8; by.rotation.set(tb*6, tb*8, 0); by.scale.setScalar(1 - tb*tb); by.children.forEach(c => c.material.opacity = 1 - tb*tb); }
    // group transform
    const sc = lerp(Sk[k], Sk1[k], eShift);
    const eY = easeIO(clamp((u - .78)/.22, 0, 1)), lastK = k === NSTAGE - 1;
    const yaw = CH.yaw[k] + eY*(CH.yaw[k + 1] - CH.yaw[k]) + Math.sin(p*60)*.035*(lastK ? 1 - eY : 1);
    molG.rotation.set(.18*Math.sin(p*18)*(lastK ? 1 - eY : 1) + (lastK ? CH.pitch*eY : 0), yaw, 0);
    molG.scale.setScalar(sc*fit*pulse*(k === NSTAGE - 1 ? 1 + .3*easeOutCubic(clamp((u - .8)/.2, 0, 1)) : 1));
    // finale glow
    const fin = k === NSTAGE - 1 ? easeOutCubic(clamp((u - .78)/.22, 0, 1)) : 0;
    halo.material.opacity = fin*.55; halo.scale.setScalar(11 + fin*5); crown.material.opacity = fin*.55; crown.rotation.z = p*30;
    // ambient bokeh
    amb.material.color.copy(palGreen).lerp(palCream, tc);
    const hW = Math.tan(THREE.MathUtils.degToRad(17.5))*15*cam.aspect, hH = Math.tan(THREE.MathUtils.degToRad(17.5))*15;
    ambD.forEach((a, i) => { const ax = a.x + Math.sin(tNow*.4*a.sp + i)*.5, ay = ((a.y + p*30*a.sp + 9) % 18) - 9;
      // keep the drifting atoms off the text column
      const vis = mobile ? smooth(-hH*.05, hH*.35, ay*(15/(15 - a.z))) : smooth(-hW*.1, hW*.2, ax*(15/(15 - a.z)));
      const sz = a.s*vis; tmpV.set(ax, ay, a.z); tmpQ.identity(); ambM.compose(tmpV, tmpQ, ambS.set(sz, sz, sz)); amb.setMatrixAt(i, ambM); });
    amb.instanceMatrix.needsUpdate = true;

    // ---- slide "pages": colour wipe from the bottom centre ----
    slides.forEach((el, i) => { const on = i === k || (i === k + 1 && wp > 0); if (el.hidden === on) el.hidden = !on; });
    const cs = slides[k], ns = slides[k + 1];
    cs.style.zIndex = 1; cs.style.clipPath = 'none';
    const diag = Math.hypot(W, H);
    if (ns && wp > 0){ const Rr = wp*diag*1.06; ns.style.zIndex = 2; ns.style.clipPath = `circle(${Rr}px at 50% 100%)`; const cp = $('.slide-copy', ns); cp.style.transform = `translateY(${(1 - wp)*36}px)`; cp.style.opacity = .35 + .65*wp;
      ringEl.style.display = 'block'; ringEl.style.width = ringEl.style.height = Rr*2 + 'px'; ringEl.style.left = (W/2 - Rr) + 'px'; ringEl.style.top = (H - Rr) + 'px'; ringEl.style.opacity = 1 - wp*.9; }
    else { ringEl.style.display = 'none'; if (ns){ ns.style.clipPath = 'circle(0px at 50% 100%)'; } }
    $('.slide-copy', cs).style.transform = ''; $('.slide-copy', cs).style.opacity = k === 0 ? clamp(p*NSTAGE/.06, 0, 1) : 1;
    // progress along the pipeline: pauses on each node, then travels to the next with the wipe
    const fill = (k + .5)/NSTAGE + wp/NSTAGE;
    pin.style.setProperty('--fill', fill.toFixed(4));
    // product tag
    const tagOn = u > .8 || (k === NSTAGE - 1 && u > .7);
    tag.textContent = RX[k].p; tag.classList.toggle('on', tagOn && wp < .5);
    const halfH = Math.tan(THREE.MathUtils.degToRad(17.5))*15, rpx = Math.min(H*.3, (3.5*sc*fit/halfH)*(H/2));
    tag.style.left = (W/2 + (world.position.x/(halfH*cam.aspect))*(W/2)) + 'px'; tag.style.top = (H/2 - (world.position.y/halfH)*(H/2) + rpx + 14) + 'px';
    lastTheme = wp > .6 ? (k + 1) % 2 === 0 ? 'cream' : 'green' : (k % 2 === 0 ? 'cream' : 'green');
    activeStage = wp > .5 ? Math.min(k + 1, NSTAGE - 1) : k;
  }
  let lastTheme = 'cream', activeStage = 0;

  let last = performance.now();
  function frame(now){
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last)/1000); last = now; tNow += dt;
    const st = getProgress();
    visible = st.visible; if (!visible) return;
    target = st.p; const diff = target - cur; cur += diff*(1 - Math.exp(-dt*(reduce ? 60 : 9)));
    if (Math.abs(target - cur) < 1e-5) cur = target;
    apply(cur);
    renderer.render(scene, cam);
  }
  window.addEventListener('resize', resize); resize(); apply(0);
  requestAnimationFrame(frame);
  return { resize, theme:() => lastTheme, stage:() => activeStage, count:NSTAGE };
}

export { initReactor };
