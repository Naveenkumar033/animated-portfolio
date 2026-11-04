// Builds the growing molecule for each pipeline stage.
import * as THREE from 'three';
import { NSTAGE } from '../../data/pipeline.js';
import { seeded } from '../../utils/math.js';

const ATOMCOL = { leaf:0x5fa23a, deep:0x2c6a34, gold:0xdba43f, sage:0x9cc27a, cream:0xeadba6, bark:0x8c6a3a, mint:0x5fbf9b, white:0xf6f2e4, lilac:0x9a86c9 };

const ring = (n, r, col, rad, z = 0) => Array.from({ length:n }, (_, i) => { const a = i/n*Math.PI*2; return [Math.cos(a)*r, Math.sin(a)*r, Math.sin(i*2.1)*z, col, rad]; });

const SEED = { atoms:[...ring(6, 1.25, 'leaf', .42, .25), [2.3, .9, .2, 'gold', .3]], bonds:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6]] };

const FRAGS = [
  { atoms:[[0,0,0,'gold',.4],[.85,-.62,.1,'white',.25],[-.85,-.62,-.1,'white',.25]], bonds:[[0,1],[0,2]], anchor:0 },
  { atoms:[[-1.15,0,0,'sage',.32],[0,0,0,'bark',.34],[1.15,0,0,'sage',.32]], bonds:[[0,1],[1,2]], anchor:0 },
  { atoms:ring(5, .95, 'cream', .3, .15), bonds:[[0,1],[1,2],[2,3],[3,4],[4,0]], anchor:0 },
  { atoms:[[0,0,0,'gold',.36],[.95,.55,0,'mint',.28],[-.95,.55,.1,'mint',.28],[0,-1.05,-.1,'mint',.28]], bonds:[[0,1],[0,2],[0,3]], anchor:3 },
  { atoms:[[-1.3,.35,0,'deep',.3],[-.45,-.25,.1,'deep',.34],[.45,.25,-.1,'deep',.34],[1.3,-.35,0,'mint',.3]], bonds:[[0,1],[1,2],[2,3]], anchor:0 },
  { atoms:[...ring(5, .85, 'gold', .28, .1), [0,0,.2,'cream',.36]], bonds:[[0,1],[1,2],[2,3],[3,4],[4,0],[5,0],[5,2],[5,3]], anchor:0 }
];

const THETA = [.35, -.45, .6, -.3, .5, -.55];

/* pick the viewing yaw (and pitch) that shows a molecule with the least atom overlap */
function bestView(pos, atoms, yawLo, yawHi, pitches){
  const ids = [...pos.keys()], P = ids.map(id => pos.get(id)), Rr = ids.map(id => atoms[id].rad), n = ids.length;
  let best = { sc:-1e9, yaw:yawLo, pitch:0 };
  const X = new Float32Array(n), Yv = new Float32Array(n);
  pitches.forEach(pitch => {
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    for (let yaw = yawLo; yaw <= yawHi; yaw += .04){
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (let i = 0; i < n; i++){ const v = P[i], a = v.x*cy + v.z*sy, z = -v.x*sy + v.z*cy; X[i] = a; Yv[i] = v.y*cp - z*sp; x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, Yv[i]); y1 = Math.max(y1, Yv[i]); }
      let sc = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++){ const d = Math.hypot(X[i] - X[j], Yv[i] - Yv[j]); sc += Math.min(1, d/((Rr[i] + Rr[j])*1.4)); }
      sc -= 1.1*Math.max(x1 - x0, (y1 - y0)*1.4) + Math.abs(pitch)*1.2;
      if (sc > best.sc) best = { sc, yaw, pitch };
    }
  });
  return best;
}

function buildChain(){
  const THREEV = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const R = seeded(11);
  const atoms = [], bonds = [], stages = [];
  const addAtom = (def, stage) => { atoms.push({ stage, base:new THREE.Color(ATOMCOL[def[3]]), rad:def[4], frames:{}, dock:null }); return atoms.length - 1; };
  // seed
  let cur = new Map();
  const seedIds = SEED.atoms.map(d => addAtom(d, -1));
  const sc0 = SEED.atoms.reduce((s, d) => s.add(THREEV(d)), new THREE.Vector3()).multiplyScalar(1/SEED.atoms.length);
  SEED.atoms.forEach((d, i) => cur.set(seedIds[i], THREEV(d).sub(sc0)));
  SEED.bonds.forEach(([i, j]) => bonds.push({ i:seedIds[i], j:seedIds[j], stage:-1, t0:-1, t1:-1 }));
  const frames = [new Map(cur)];
  const Y = new THREE.Vector3(0,1,0);
  const YAW = [0]; let PITCH = 0;
  for (let k = 0; k < NSTAGE; k++){
    const F = FRAGS[k], yaw = YAW[k];
    const w = new THREE.Vector3(Math.cos(THETA[k]), Math.sin(THETA[k])*.65, .32).normalize();
    const d = w.clone().applyAxisAngle(Y, -yaw);
    // anchor atom on the molecule: the outermost along d
    let aId = -1, best = -1e9; cur.forEach((v, id) => { const s = v.dot(d); if (s > best){ best = s; aId = id; } });
    const ids = F.atoms.map(def => addAtom(def, k));
    const loc = F.atoms.map(THREEV);
    const cen = loc.reduce((s, v) => s.add(v), new THREE.Vector3()).multiplyScalar(1/loc.length);
    let u = loc[F.anchor].clone().sub(cen); if (u.length() < .01) u.set(1,0,0); u.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(u, d.clone().negate());
    const tw = new THREE.Quaternion().setFromAxisAngle(d, (R() - .5)*1.6);
    q.premultiply(tw);
    const bondLen = (atoms[aId].rad + F.atoms[F.anchor][4]) + .55;
    const placed = new Map(); let push = 0;
    for (let tries = 0; tries < 8; tries++){
      placed.clear(); const origin = cur.get(aId).clone().add(d.clone().multiplyScalar(bondLen + push));
      F.atoms.forEach((def, i) => placed.set(ids[i], loc[i].clone().sub(loc[F.anchor]).applyQuaternion(q).add(origin)));
      let ok = true; placed.forEach((pv, pid) => { cur.forEach((cv, cid) => { if (cid !== aId && pv.distanceTo(cv) < (atoms[pid].rad + atoms[cid].rad)*1.5) ok = false; }); });
      if (ok) break; push += .25;
    }
    const aDock = ids[F.anchor];
    F.bonds.forEach(([i, j]) => bonds.push({ i:ids[i], j:ids[j], stage:k, t0:-1, t1:-1 }));
    bonds.push({ i:aId, j:aDock, stage:k, t0:.46, t1:.58 });
    // ring closure: closest atom pair across the join (not the primary bond)
    let rb = null, rd = 1e9; placed.forEach((pv, pid) => { if (pid === aDock) return; cur.forEach((cv, cid) => { if (cid === aId) return; const dd = pv.distanceTo(cv); if (dd < rd){ rd = dd; rb = [cid, pid]; } }); });
    if (rb && rd < 2.5) bonds.push({ i:rb[0], j:rb[1], stage:k, t0:.64, t1:.74 });
    const pre = new Map(cur); placed.forEach((v, id) => pre.set(id, v));
    const cn = new THREE.Vector3(); pre.forEach(v => cn.add(v)); cn.multiplyScalar(1/pre.size);
    const shift = cn.clone().negate();
    let Rpre = 0; pre.forEach((v, id) => { Rpre = Math.max(Rpre, v.length() + atoms[id].rad); });
    const next = new Map(); pre.forEach((v, id) => next.set(id, v.clone().add(shift)));
    let Rpost = 0; next.forEach((v, id) => { Rpost = Math.max(Rpost, v.length() + atoms[id].rad); });
    const J = cur.get(aId).clone().add(placed.get(aDock)).multiplyScalar(.5);
    stages.push({ ids, aId, aDock, d, placed, shift, J, Rpre, Rpost, ring:rb && rd < 2.5 ? rb : null, start:cur.size });
    cur = next; frames.push(new Map(cur));
    const last = k === NSTAGE - 1, bv = bestView(cur, atoms, YAW[k] + .5, YAW[k] + 2.7, last ? [-.4,-.25,-.1,0,.1,.25,.4] : [0]);
    YAW.push(bv.yaw); if (last) PITCH = bv.pitch;
  }
  return { atoms, bonds, stages, frames, yaw:YAW, pitch:PITCH };
}

export { buildChain };
