// Renders the photoreal studio product shots used in cards and the bag.
import * as THREE from 'three';
import { PRODUCTS } from '../../data/products.js';
import { gummyGeometry, makeBottle, studioLeaf } from './product-model.js';
import { radialCanvas } from '../../lib/canvas-art.js';
import { studioEnvCube } from '../../lib/environment.js';
import { seeded } from '../../utils/math.js';

function makeSweep(){
  const prof = [], R = 2.4, zf = 9, zw = -1.5;
  for (let k=0;k<=10;k++) prof.push([zf + (zw - zf)*(k/10), 0]);
  for (let k=1;k<=14;k++){ const ang = (k/14)*Math.PI/2; prof.push([zw - R*Math.sin(ang), R*(1 - Math.cos(ang))]); }
  for (let k=1;k<=8;k++) prof.push([zw - R, R + k*1.6]);
  const X = 22, pos = [], uv = [], idx = [];
  prof.forEach(([z,y], k) => { pos.push(-X,y,z, X,y,z); uv.push(0,k/(prof.length-1), 1,k/(prof.length-1)); if (k){ const a = (k-1)*2; idx.push(a,a+1,a+2, a+1,a+3,a+2); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

const SHOT_BG = { inhaler:'#cddcbf', lung:'#eaf0e2', calm:'#d6e1c8', immunity:'#eaf0e2', sleep:'#d9e2cd' };

async function renderStudioShots(onStep){
  const W = 1200, H = 900, out = {};
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, preserveDrawingBuffer:true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  const T = c => { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };
  const env = studioEnvCube();
  const rt = new THREE.WebGLRenderTarget(W/2, H/2); rt.texture.encoding = THREE.sRGBEncoding;
  const sweepGeo = makeSweep();

  for (let n = 0; n < PRODUCTS.length; n++){
    const p = PRODUCTS[n], tube = p.shape === 'tube';
    const scene = new THREE.Scene(); scene.environment = env; scene.background = new THREE.Color(SHOT_BG[p.id]).multiplyScalar(.8);
    const cam = new THREE.PerspectiveCamera(20, W/H, .5, 80); cam.position.set(0, tube ? 2.7 : 2.9, 12.8); cam.lookAt(0, tube ? .95 : .62, 0); cam.updateMatrixWorld(true);

    // sweep (floor + wall) with reflection of the product baked in the floor shader
    const floorMat = new THREE.MeshStandardMaterial({ color:new THREE.Color(SHOT_BG[p.id]).multiplyScalar(.8), roughness:.8, metalness:0, envMapIntensity:.08 });
    const refl = { uRefl:{ value:rt.texture }, uRes:{ value:new THREE.Vector2(W, H) }, uStr:{ value: tube ? .5 : .42 }, uContact:{ value:0 } };
    floorMat.onBeforeCompile = sh => { Object.assign(sh.uniforms, refl);
      sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'uniform sampler2D uRefl; uniform vec2 uRes; uniform float uStr; uniform float uContact;\nvoid main() {')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n vec2 ruv = gl_FragCoord.xy / uRes; vec4 rc = texture2D(uRefl, ruv); float fd = 1.0 - smoothstep(0.0, 0.26, uContact - ruv.y); float rs = uStr * fd * step(ruv.y, uContact + .002); gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - rc.a * rs) + rc.rgb * rs;'); };
    const sweep = new THREE.Mesh(sweepGeo, floorMat); sweep.receiveShadow = true; scene.add(sweep);

    // lights
    scene.add(new THREE.HemisphereLight(0xfff6e0, 0x8a9468, .34));
    const key = new THREE.DirectionalLight(0xfff0d2, .85); key.position.set(-5, 8, 6); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 9; key.shadow.blurSamples = 20; key.shadow.bias = -.0004;
    Object.assign(key.shadow.camera, { left:-6, right:6, top:6, bottom:-6, near:1, far:30 }); scene.add(key);
    const fill = new THREE.DirectionalLight(0xe6f0ff, .16); fill.position.set(6, 3, 7); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, .5); rim.position.set(3, 5, -7); scene.add(rim);

    // product + props
    const group = new THREE.Group(); scene.add(group);
    const bottle = makeBottle(p, n, T, { studio:true, baseAtZero:true });
    const sc = (tube ? 2.3 : 1.9) / bottle.userData.h;
    bottle.scale.setScalar(sc); bottle.rotation.set(0, tube ? -.32 : -.38, 0); bottle.position.set(tube ? -.15 : 0, 0, 0); group.add(bottle);
    const R = seeded(n*31 + 7);
    const addLeaf = (x, z, s, yaw, color) => { const l = studioLeaf(color, T); l.scale.set(s*.7, s, s); l.rotation.set(-Math.PI/2 + (R()-.5)*.35, 0, yaw); l.position.set(x, .02 + R()*.02, z); l.castShadow = true; l.receiveShadow = true; group.add(l); return l; };
    const gcol = p.leaf;
    if (tube){ addLeaf(1.35,.9,1.15,.6,'#5d9a44'); addLeaf(1.9,.2,1.0,-.5,'#6fa84f'); addLeaf(-1.5,.7,.95,2.5,'#4f8a3c'); addLeaf(-2.1,1.2,.85,1.5,'#6fa84f'); addLeaf(.9,1.7,.7,-1.2,'#7db35a'); }
    else { addLeaf(1.7,.6,1.0,.5,gcol); addLeaf(-1.8,.9,.9,2.3,gcol); addLeaf(2.3,1.2,.7,-.4,'#6a9f4a');
      const geo = gummyGeometry(.17), gcols = p.gummy || p.loose;
      [[1.15,1.15],[1.55,1.6],[-1.05,1.45]].forEach(([x,z],k) => { const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color:gcols[k%gcols.length], roughness:.28, clearcoat:.9, clearcoatRoughness:.15, envMapIntensity:.7 })); m.position.set(x, .15, z); m.rotation.set(R()*3, R()*3, R()*3); m.castShadow = true; m.receiveShadow = true; group.add(m); }); }

    // soft contact shadow
    const cs = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map:T(radialCanvas('rgba(10,16,8,.55)','rgba(10,16,8,0)',128)), transparent:true, depthWrite:false }));
    cs.rotation.x = -Math.PI/2; cs.position.set(bottle.position.x, .01, 0); cs.scale.set(tube ? .6 : 1.15, tube ? .6 : 1.15, 1); scene.add(cs);

    // reflection pass: mirrored product only
    const mirror = group.clone(true); mirror.scale.y = -1;
    mirror.traverse(o => { o.castShadow = false; o.receiveShadow = false; if (o.userData.glass){ o.material = new THREE.MeshPhysicalMaterial({ color:o.material.color, roughness:.05, transparent:true, opacity:.16, depthWrite:false }); } });
    scene.add(mirror);
    const v = new THREE.Vector3(0, 0, 0).project(cam); refl.uContact.value = v.y*.5 + .5;
    const bgc = scene.background; scene.background = null; renderer.setClearColor(0x000000, 0);
    sweep.visible = false; group.visible = false; cs.visible = false; mirror.visible = true;
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null);
    sweep.visible = true; group.visible = true; cs.visible = true; mirror.visible = false; scene.background = bgc;
    renderer.render(scene, cam);
    out[p.id] = canvas.toDataURL('image/jpeg', .93);

    scene.traverse(o => { if (o.geometry && o.geometry !== sweepGeo) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(m => { ['map','bumpMap'].forEach(k => m[k] && m[k].dispose()); m.dispose(); }); });
    if (onStep) onStep(n + 1, PRODUCTS.length);
    await new Promise(r => setTimeout(r, 16));
  }
  rt.dispose(); sweepGeo.dispose(); env.dispose(); renderer.dispose(); try { renderer.forceContextLoss(); } catch(e){}
  return out;
}

export { renderStudioShots };
