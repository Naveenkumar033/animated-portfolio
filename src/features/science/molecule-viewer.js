// Rotating 3D compound model in the Science section.
import * as THREE from 'three';
import { envCube } from '../../lib/environment.js';
import { gsap, hasGsap } from '../../lib/gsap.js';
import { $ } from '../../utils/dom.js';
import { lerp } from '../../utils/math.js';
import { reduce } from '../../utils/media.js';

function initMolecule(){
  const canvas = $('#molCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(35, 1, .1, 50); cam.position.set(0, 0, 15.5);
  scene.environment = envCube();
  scene.add(new THREE.HemisphereLight(0xf0f4e0, 0x1a281a, .6));
  const dl = new THREE.DirectionalLight(0xffe8c4, 1.6); dl.position.set(4, 6, 5); scene.add(dl);
  const holder = new THREE.Group(); scene.add(holder);
  let mol = null;
  const sphere = new THREE.SphereGeometry(1, 32, 24), cyl = new THREE.CylinderGeometry(.09, .09, 1, 12);
  function rng(seed){ let s = seed*9301 + 49297; return () => { s = (s*9301 + 49297) % 233280; return s/233280; }; }
  function build(herb){
    const R = rng(herb.seed), g = new THREE.Group();
    const main = new THREE.MeshPhysicalMaterial({ color:herb.color, roughness:.25, clearcoat:1, clearcoatRoughness:.15 });
    const cream = new THREE.MeshPhysicalMaterial({ color:0xefe4c5, roughness:.3, clearcoat:.8 });
    const gold = new THREE.MeshPhysicalMaterial({ color:0xe7c680, roughness:.2, metalness:.5, clearcoat:1 });
    const bondM = new THREE.MeshStandardMaterial({ color:0xcfd6c0, roughness:.4 });
    const atoms = [new THREE.Vector3()];
    // ring backbone
    const ringN = 6; for (let i=1;i<ringN;i++){ const a = i/ringN*Math.PI*2; atoms.push(new THREE.Vector3(Math.cos(a)*1.4-1.4, Math.sin(a)*1.4, (R()-.5)*.4)); }
    const bonds = []; for (let i=0;i<ringN;i++) bonds.push([i, (i+1)%ringN]);
    const extra = 7 + Math.floor(R()*7);
    for (let i=0;i<extra;i++){
      const from = Math.floor(R()*atoms.length); let v;
      for (let tries=0; tries<20; tries++){ const dir = new THREE.Vector3(R()-.5, R()-.5, R()-.5).normalize().multiplyScalar(1.35); v = atoms[from].clone().add(dir); if (atoms.every(a => a.distanceTo(v) > 1.05)) break; }
      atoms.push(v); bonds.push([from, atoms.length-1]);
    }
    const center = atoms.reduce((s, a) => s.add(a.clone()), new THREE.Vector3()).multiplyScalar(1/atoms.length);
    atoms.forEach((a, i) => { a.sub(center); const big = i < ringN || R() > .55; const m = new THREE.Mesh(sphere, i < ringN ? main : (R() > .7 ? gold : (big ? main : cream))); m.scale.setScalar(big ? .42 : .27); m.position.copy(a); g.add(m); });
    bonds.forEach(([a, b]) => { const A = atoms[a], B = atoms[b]; const m = new THREE.Mesh(cyl, bondM); m.position.copy(A).lerp(B, .5); m.scale.y = A.distanceTo(B); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), B.clone().sub(A).normalize()); g.add(m); });
    return g;
  }
  function show(herb){
    const next = build(herb); next.scale.setScalar(.001); holder.add(next);
    const old = mol; mol = next;
    if (hasGsap){ gsap.to(next.scale, { x:1, y:1, z:1, duration:1.1, ease:'elastic.out(1,.6)' }); gsap.fromTo(holder.rotation, { y:holder.rotation.y }, { y:holder.rotation.y + Math.PI, duration:1.2, ease:'power3.out' });
      if (old) gsap.to(old.scale, { x:.001, y:.001, z:.001, duration:.4, ease:'power2.in', onComplete:() => holder.remove(old) }); }
    else { next.scale.setScalar(1); if (old) holder.remove(old); }
  }
  const st = { drag:false, lx:0, ly:0, vx:.004, vy:0, visible:false };
  canvas.addEventListener('pointerdown', e => { st.drag = true; st.lx = e.clientX; st.ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!st.drag) return; st.vx = (e.clientX - st.lx)*.008; st.vy = (e.clientY - st.ly)*.008; st.lx = e.clientX; st.ly = e.clientY; });
  ['pointerup','pointercancel'].forEach(ev => canvas.addEventListener(ev, () => st.drag = false));
  new IntersectionObserver(es2 => es2.forEach(en => st.visible = en.isIntersecting)).observe(canvas);
  function resize(){ const r = canvas.getBoundingClientRect(); renderer.setSize(Math.max(1,r.width), Math.max(1,r.height), false); cam.aspect = r.width/Math.max(1,r.height); cam.updateProjectionMatrix(); }
  window.addEventListener('resize', resize); resize();
  (function loop(){ requestAnimationFrame(loop); if (!st.visible) return;
    holder.rotation.y += st.vx; holder.rotation.x += st.vy; if (!st.drag){ st.vx = lerp(st.vx, reduce ? 0 : .004, .03); st.vy = lerp(st.vy, 0, .05); holder.rotation.x = lerp(holder.rotation.x, .25, .01); }
    renderer.render(scene, cam); })();
  return { show };
}

export { initMolecule };
