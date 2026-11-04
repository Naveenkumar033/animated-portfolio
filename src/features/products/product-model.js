// Procedural 3D models of the five TranzLife products. Shapes follow the client's design boards and the
// printed labels are the real artwork lifted from those boards (see scripts/make-product-assets.py).
import * as THREE from 'three';
import { seeded } from '../../utils/math.js';
import decalGummies from '../../assets/products/decal-gummies.webp';
import decalInhaler from '../../assets/products/decal-inhaler.webp';
import decalInhalerLogo from '../../assets/products/decal-inhaler-logo.webp';
import decalRollon from '../../assets/products/decal-rollon.webp';
import decalReviva from '../../assets/products/decal-reviva.webp';
import decalLiver from '../../assets/products/decal-liver.webp';

const V2 = (x, y) => new THREE.Vector2(x, y);
const lin = hex => new THREE.Color(hex).convertSRGBToLinear();

/* ---------- textures (shared by every scene) ---------- */
const texCache = new Map();
function image(url){
  if (!texCache.has(url)){ const t = new THREE.TextureLoader().load(url); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; texCache.set(url, t); }
  return texCache.get(url);
}
function canvasTex(key, w, h, draw, srgb = true){
  if (!texCache.has(key)){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; texCache.set(key, t); }
  return texCache.get(key);
}
// pressed plant-fibre (the gummies eco cap)
const kraft = () => canvasTex('kraft', 512, 512, (g, w, h) => {
  const R = seeded(31); g.fillStyle = '#cfae84'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++){ const v = R(), a = R()*Math.PI; g.strokeStyle = v < .5 ? `rgba(120,86,50,${.06 + R()*.16})` : `rgba(250,232,200,${.08 + R()*.2})`;
    const x = R()*w, y = R()*h, l = 2 + R()*7; g.lineWidth = .6 + R()*1.1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a)*l, y + Math.sin(a)*l); g.stroke(); }
});
// the leaf embossed into the eco cap's top (used as a bump map)
const capLeaf = () => canvasTex('capLeaf', 512, 512, (g, w, h) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); g.translate(w/2, h/2); g.rotate(-.35);
  g.strokeStyle = '#3a3a3a'; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-170, 0); g.bezierCurveTo(-90, -95, 90, -95, 175, 0); g.bezierCurveTo(90, 95, -90, 95, -170, 0); g.stroke();
  g.lineWidth = 6; g.beginPath(); g.moveTo(-190, 8); g.lineTo(150, 0); g.stroke();
  for (let k = -3; k <= 3; k++){ if (!k) continue; const x = k*40; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 34, -Math.sign(k)*0 - 52 + Math.abs(k)*8); g.moveTo(x, 0); g.lineTo(x + 34, 52 - Math.abs(k)*8); g.stroke(); }
}, false);
// light oak (the liver booster's angled cap)
const oak = () => canvasTex('oak', 512, 512, (g, w, h) => {
  const R = seeded(7); const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#c99a63'); gr.addColorStop(.5, '#d7ad78'); gr.addColorStop(1, '#c08f58'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 140; i++){ let x = R()*w; g.strokeStyle = `rgba(${R() < .5 ? '120,78,40' : '235,205,160'},${.12 + R()*.22})`; g.lineWidth = .8 + R()*2.4; g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y <= h; y += 16){ x += (R() - .5)*2.4; g.lineTo(x, y); } g.stroke(); }
});

/* ---------- shared geometry helpers ---------- */
const radiusAt = (prof, y) => { for (let i = 1; i < prof.length; i++){ const a = prof[i - 1], b = prof[i]; if (y <= b.y || i === prof.length - 1){ const t = (y - a.y)/Math.max(1e-6, b.y - a.y); return a.x + (b.x - a.x)*Math.min(1, Math.max(0, t)); } } return prof[0].x; };
// a band of a lathe profile, resampled evenly in height so a texture maps straight onto it
const band = (prof, y0, y1, grow, n = 48) => Array.from({ length:n + 1 }, (_, k) => { const y = y0 + (y1 - y0)*k/n; return V2(radiusAt(prof, y)*grow, y); });
// a printed label on the front of a round body (u = angle, v = height)
function labelBand(prof, y0, y1, arc, grow, map, extra = {}){
  const m = new THREE.Mesh(new THREE.LatheGeometry(band(prof, y0, y1, grow), 96, -arc/2, arc), new THREE.MeshStandardMaterial({ map, transparent:true, roughness:.55, metalness:0, envMapIntensity:.6, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, ...extra }));
  m.renderOrder = 4; return m;
}
// see-through glass: a faint front shell plus a back shell for depth
function glassShell(geo, color, front = .12, back = .2){
  const f = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color:lin(color), roughness:.05, clearcoat:1, clearcoatRoughness:.04, envMapIntensity:1.6, transparent:true, opacity:front, depthWrite:false }));
  const b = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color:lin(color), roughness:.08, clearcoat:1, envMapIntensity:1.2, transparent:true, opacity:back, side:THREE.BackSide, depthWrite:false }));
  f.renderOrder = 3; b.renderOrder = 1; return [b, f];
}
// discard everything below a slanted plane (object space): y < y0 + k*x
function slantCut(mat, y0, k){
  mat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('void main() {', 'varying vec3 vObjPos;\nvoid main() {\n  vObjPos = position;');
    sh.fragmentShader = sh.fragmentShader.replace('void main() {', `varying vec3 vObjPos;\nvoid main() {\n  if (vObjPos.y < ${y0.toFixed(4)} + ${k.toFixed(4)}*vObjPos.x) discard;`);
  };
  mat.customProgramCacheKey = () => 'slant' + y0 + ':' + k;
  return mat;
}

/* ---------- gummies: raspberry-shaped, glossy ---------- */
function berryGeometry(rad, detail = 1){
  const g = new THREE.SphereGeometry(1, 30*detail, 22*detail), pos = g.attributes.position, n = 30, C = [];
  for (let i = 0; i < n; i++){ const y = 1 - 2*(i + .5)/n, r = Math.sqrt(1 - y*y), a = i*2.39996; C.push(new THREE.Vector3(Math.cos(a)*r, y, Math.sin(a)*r)); }
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++){
    v.fromBufferAttribute(pos, i).normalize(); let m = -1; for (const c of C){ const d = v.dot(c); if (d > m) m = d; }
    const t = Math.min(1, (1 - m)/.052), dome = Math.sqrt(Math.max(0, 1 - t*t)), k = 1 + .2*dome;
    pos.setXYZ(i, v.x*k*rad, v.y*k*rad*.86, v.z*k*rad);
  }
  g.computeVertexNormals(); return g;
}
const gummyMaterial = () => new THREE.MeshPhysicalMaterial({ roughness:.24, clearcoat:1, clearcoatRoughness:.18, envMapIntensity:.9 });

function gummiesJar(p, o){
  const G = new THREE.Group();
  const prof = [V2(0,0),V2(.8,0),V2(.94,.03),V2(.99,.14),V2(1,.4),V2(1.01,1.6),V2(1.02,2.55),V2(1.0,2.78),V2(.95,2.96),V2(.86,3.1),V2(.76,3.2),V2(.72,3.25),V2(.72,3.34)];
  const glass = new THREE.LatheGeometry(prof, 96);
  G.add(...glassShell(glass, '#f4f6f1', .1, .16));
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.9, .94, .07, 64), new THREE.MeshPhysicalMaterial({ color:lin('#eef2ec'), roughness:.08, transparent:true, opacity:.35, clearcoat:1 })); base.position.y = .04; G.add(base);
  // red, orange and amber gummies fill the jar
  const R = seeded(13), N = o.lite ? 80 : 150, geo = berryGeometry(.17, o.lite ? 1 : 1.2), pts = [];
  for (let tries = 0; pts.length < N && tries < 9000; tries++){
    const a = R()*Math.PI*2, y = .2 + R()*2.55, rmax = radiusAt(prof, y) - .2, rr = Math.sqrt(R())*Math.max(0, rmax);
    const v = new THREE.Vector3(Math.cos(a)*rr, y, Math.sin(a)*rr); if (pts.every(q => q.distanceTo(v) > .27)) pts.push(v);
  }
  pts.sort((a, b) => a.y - b.y);
  const gm = new THREE.InstancedMesh(geo, gummyMaterial(), pts.length), d = new THREE.Object3D(), c = new THREE.Color();
  pts.forEach((v, k) => { d.position.copy(v); d.rotation.set(R()*.8 - .4, R()*6.28, R()*.8 - .4); d.scale.setScalar(.9 + R()*.28); d.updateMatrix(); gm.setMatrixAt(k, d.matrix);
    c.set(p.gummy[k % p.gummy.length]).convertSRGBToLinear(); c.offsetHSL((R() - .5)*.02, 0, (R() - .5)*.04); gm.setColorAt(k, c); });
  G.add(gm);
  // frosted cream top with the diagonal edge, then the printed logo on it
  const cutY = 1.52, cutK = .37;
  const frost = new THREE.Mesh(new THREE.LatheGeometry(band(prof, .9, 3.34, 1.008, 80), 96), slantCut(new THREE.MeshStandardMaterial({ color:lin('#ebe3d2'), roughness:.68, metalness:0, envMapIntensity:.55, side:THREE.DoubleSide }), cutY, cutK));
  frost.renderOrder = 2; G.add(frost);
  const print = labelBand(prof, 1.55, 2.98, 2*Math.asin(.86), 1.014, image(decalGummies)); slantCut(print.material, cutY + .02, cutK); G.add(print);
  // pressed plant-fibre eco cap with an embossed leaf
  const kt = kraft();
  const capProf = [V2(.0,3.27),V2(.74,3.27),V2(.755,3.3),V2(.76,3.86),V2(.75,3.93),V2(.72,3.975),V2(.6,3.99),V2(0,3.995)];
  const capMat = new THREE.MeshStandardMaterial({ color:0xffffff, map:kt, bumpMap:kt, bumpScale:.012, roughness:.92, metalness:0, envMapIntensity:.35 });
  G.add(new THREE.Mesh(new THREE.LatheGeometry(capProf, 96), capMat));
  const top = new THREE.Mesh(new THREE.CircleGeometry(.6, 64), new THREE.MeshStandardMaterial({ color:0xffffff, map:kt, bumpMap:capLeaf(), bumpScale:.05, roughness:.92, envMapIntensity:.35 }));
  top.rotation.x = -Math.PI/2; top.position.y = 3.997; G.add(top);
  return { G, h:4.0 };
}

function calmInhaler(){
  const G = new THREE.Group(), w = 1, d = .6, bev = .06;
  const rr = (W, D, r) => { const s = new THREE.Shape(), x = W/2, y = D/2; s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.quadraticCurveTo(x, -y, x, -y + r); s.lineTo(x, y - r); s.quadraticCurveTo(x, y, x - r, y); s.lineTo(-x + r, y); s.quadraticCurveTo(-x, y, -x, y - r); s.lineTo(-x, -y + r); s.quadraticCurveTo(-x, -y, -x + r, -y); return s; };
  const soft = (hex, rough) => new THREE.MeshPhysicalMaterial({ color:lin(hex), roughness:rough, metalness:0, clearcoat:.35, clearcoatRoughness:.5, envMapIntensity:.7 });
  // body: a soft-touch grey stick
  const bodyH = 3.06, body = new THREE.ExtrudeGeometry(rr(w - 2*bev, d - 2*bev, .12), { depth:bodyH - 2*bev, bevelEnabled:true, bevelThickness:bev, bevelSize:bev, bevelSegments:4, curveSegments:10 });
  body.rotateX(-Math.PI/2); body.translate(0, bev, 0);
  G.add(new THREE.Mesh(body, soft('#5a5d60', .5)));
  // cap with the twin rounded tips
  const s = new THREE.Shape(), k = .9;
  s.moveTo(-.5*k, 0); s.lineTo(-.5*k, .49*k); s.absarc(-.3*k, .49*k, .2*k, Math.PI, 0, true); s.absarc(0, .49*k, .1*k, Math.PI, 2*Math.PI, false); s.absarc(.3*k, .49*k, .2*k, Math.PI, 0, true); s.lineTo(.5*k, 0); s.lineTo(-.5*k, 0);
  const cap = new THREE.ExtrudeGeometry(s, { depth:d - .2, bevelEnabled:true, bevelThickness:.1, bevelSize:.05, bevelSegments:6, curveSegments:24 });
  cap.translate(0, 0, -(d - .2)/2); cap.translate(0, bodyH + .02, 0);
  G.add(new THREE.Mesh(cap, soft('#4a4d50', .42)));
  const seam = new THREE.Mesh(new THREE.ExtrudeGeometry(rr(w - .1, d - .1, .1), { depth:.03, bevelEnabled:false }), new THREE.MeshStandardMaterial({ color:0x1c1d1e, roughness:.8 }));
  seam.geometry.rotateX(-Math.PI/2); seam.position.y = bodyH - .01; G.add(seam);
  // the teal CALM label and the small logo, printed on the flat front
  const front = d/2 + .003;
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(.7, 2.27), new THREE.MeshStandardMaterial({ map:image(decalInhaler), transparent:true, roughness:.6, envMapIntensity:.5, polygonOffset:true, polygonOffsetFactor:-2 }));
  lab.position.set(0, 1.59, front); G.add(lab);
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(.66, .2), new THREE.MeshStandardMaterial({ map:image(decalInhalerLogo), transparent:true, roughness:.6, polygonOffset:true, polygonOffsetFactor:-2 }));
  logo.position.set(0, .26, front); G.add(logo);
  return { G, h:bodyH + .02 + .69*k + .05 };
}

function calmRollOn(){
  const G = new THREE.Group();
  const prof = [V2(0,0),V2(.44,0),V2(.49,.03),V2(.5,.1),V2(.5,3.12)];
  G.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 72), new THREE.MeshPhysicalMaterial({ color:lin('#1a1a1a'), roughness:.18, clearcoat:1, envMapIntensity:1 })));
  // cream label all the way round, the printed front from the design
  const labelProf = [V2(.5,.46),V2(.5,3.1)];
  G.add(new THREE.Mesh(new THREE.LatheGeometry(band(labelProf, .46, 3.1, 1.008, 2), 96), new THREE.MeshStandardMaterial({ color:lin('#ece5d4'), roughness:.6, envMapIntensity:.5 })));
  G.add(labelBand(labelProf, .48, 3.1, 2.3, 1.016, image(decalRollon)));
  const capProf = [V2(0,3.12),V2(.505,3.12),V2(.51,3.15),V2(.51,4.32),V2(.49,4.41),V2(.43,4.45),V2(0,4.46)];
  G.add(new THREE.Mesh(new THREE.LatheGeometry(capProf, 72), new THREE.MeshPhysicalMaterial({ color:lin('#141414'), roughness:.22, clearcoat:1, clearcoatRoughness:.1, envMapIntensity:1.1 })));
  return { G, h:4.46 };
}

function revivaRollOn(){
  const G = new THREE.Group();
  const prof = [V2(0,0),V2(.44,0),V2(.49,.03),V2(.5,.1),V2(.5,2.8),V2(.47,2.9),V2(.38,2.96),V2(.32,3.0),V2(.32,3.32)];
  const amber = new THREE.MeshPhysicalMaterial({ color:lin('#5c240b'), roughness:.07, clearcoat:1, clearcoatRoughness:.03, envMapIntensity:1.5 });
  G.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 72), amber));
  for (let k = 0; k < 4; k++){ const t = new THREE.Mesh(new THREE.TorusGeometry(.322, .016, 8, 64), amber); t.rotation.x = Math.PI/2; t.position.y = 3.05 + k*.075; G.add(t); }
  // white roller housing and the steel ball
  const hous = [V2(0,3.3),V2(.33,3.3),V2(.33,3.36),V2(.3,3.4),V2(.29,3.55),V2(.26,3.6),V2(.19,3.62),V2(0,3.62)];
  G.add(new THREE.Mesh(new THREE.LatheGeometry(hous, 64), new THREE.MeshPhysicalMaterial({ color:lin('#f4f4f2'), roughness:.35, clearcoat:.4 })));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.2, 40, 28), new THREE.MeshStandardMaterial({ color:lin('#d9dcdf'), metalness:1, roughness:.12, envMapIntensity:1.6 }));
  ball.position.y = 3.62; G.add(ball);
  // dark green label all round, printed front from the design
  const labelProf = [V2(.5,.27),V2(.5,2.5)];
  G.add(new THREE.Mesh(new THREE.LatheGeometry(band(labelProf, .27, 2.5, 1.008, 2), 96), new THREE.MeshStandardMaterial({ color:lin('#1d4527'), roughness:.55, envMapIntensity:.5 })));
  G.add(labelBand(labelProf, .27, 2.5, 2.24, 1.016, image(decalReviva)));
  return { G, h:3.82 };
}

function liverBottle(){
  const G = new THREE.Group();
  const prof = [V2(0,0),V2(.4,0),V2(.47,.03),V2(.5,.12),V2(.5,2.9),V2(.48,2.98),V2(.44,3.04),V2(.42,3.06)];
  // frosted green glass
  G.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 80), new THREE.MeshPhysicalMaterial({ color:lin('#c7d585'), roughness:.5, metalness:0, clearcoat:.4, clearcoatRoughness:.35, envMapIntensity:.8, emissive:lin('#2e3a08'), emissiveIntensity:.25 })));
  G.add(labelBand(prof, .61, 2.66, 2.24, 1.012, image(decalLiver), { roughness:.5 }));
  // light oak cap with the angled top
  const cap = new THREE.CylinderGeometry(.43, .43, 1, 72, 1), pos = cap.attributes.position;
  for (let i = 0; i < pos.count; i++){ const y = pos.getY(i); if (y > 0) pos.setY(i, y + .13*pos.getX(i)/.43); }
  cap.computeVertexNormals(); cap.translate(0, 3.02 + .5, 0);
  const ot = oak();
  G.add(new THREE.Mesh(cap, new THREE.MeshStandardMaterial({ color:0xffffff, map:ot, roughness:.62, metalness:0, envMapIntensity:.5 })));
  return { G, h:4.16 };
}

const BUILDERS = { jar:gummiesJar, inhaler:calmInhaler, rollon:calmRollOn, reviva:revivaRollOn, liver:liverBottle };

// Builds a product, centred on its own middle. Returns a group with userData.h (its height).
function makeProduct(p, i, o = {}){
  const { G, h } = BUILDERS[p.model](p, o);
  G.position.y = -h/2;
  const g = new THREE.Group(); g.add(G);
  g.userData = { index:i, h };
  g.traverse(m => { m.userData.product = i; });
  return g;
}

// A curled leaf for scene dressing.
function studioLeaf(color){
  const sh = new THREE.Shape(); sh.moveTo(0,-.5); sh.bezierCurveTo(.3,-.28,.3,.22,0,.5); sh.bezierCurveTo(-.3,.22,-.3,-.28,0,-.5);
  const geo = new THREE.ShapeGeometry(sh, 12); const pos = geo.attributes.position;
  for (let i=0;i<pos.count;i++){ const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, x*x*1.1 + y*y*.25); } geo.computeVertexNormals();
  const t = canvasTex('leaf' + color, 128, 256, (g) => {
    const gr = g.createLinearGradient(0,0,0,256); gr.addColorStop(0, color); gr.addColorStop(1, '#2d5527'); g.fillStyle = gr; g.fillRect(0,0,128,256);
    g.strokeStyle = 'rgba(235,245,200,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(64,256); g.lineTo(64,6); g.stroke(); g.lineWidth = 1.5;
    for (let k=1;k<9;k++){ const y = 256 - k*26; g.beginPath(); g.moveTo(64,y); g.lineTo(18,y-26); g.moveTo(64,y); g.lineTo(110,y-26); g.stroke(); }
  });
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map:t, side:THREE.DoubleSide, roughness:.5, envMapIntensity:.5 }));
}

export { makeProduct, berryGeometry, gummyMaterial, studioLeaf };
