import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

const cache = new Map();

export const characterMaterialRules = [
  [['skin', 'head', 'body'], 0.65, 0.02],
  [['hair'], 0.8, 0],
  [['eye'], 0.15, 0],
  [['teeth'], 0.4, 0],
  [['glasses'], 0.25, 0.15]
];

export function tuneSagarMaterials(scene) {
  scene.traverse((node) => {
    if (node.isMesh && node.material) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const m of mats) {
        if (!m.isMeshStandardMaterial) continue;
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        const name = (m.name || node.name || '').toLowerCase();
        const rule = characterMaterialRules.find(([keys]) => keys.some((k) => name.includes(k)));
        m.roughness = rule ? rule[1] : 0.75;
        m.metalness = rule ? rule[2] : 0;
      }
    }
    if (node.isSkinnedMesh) {
      node.frustumCulled = false;
    }
  });
  return scene;
}

export function tuneMacbookMaterials(scene) {
  scene.traverse((node) => {
    if (node.isMesh && node.material) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const m of mats) {
        if (m.isMeshPhysicalMaterial && m.transmission > 0) {
          m.opacity = 1 - 0.7 * m.transmission;
          m.transparent = true;
          m.transmission = 0;
        }
      }
    }
  });
  return scene;
}

const MIXAMO_ROOT_ROT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

export function keptInPlace(clip, name = 'anim', hipTranslation = new THREE.Vector3(0, 0.010773, 0.00026)) {
  if (!clip) return clip;
  const s = clip.clone();
  s.name = name;
  s.tracks = s.tracks.filter((t) => !t.name.endsWith('.scale') && (!t.name.endsWith('.position') || t.name.endsWith('Hips.position')));

  const hipPosTrack = s.tracks.find((t) => t.name.endsWith('Hips.position'));
  if (hipPosTrack) {
    const vals = hipPosTrack.values;
    for (let i = 0; i < vals.length; i += 3) {
      const yVal = -vals[i + 2] / 1.011 * hipTranslation.y;
      vals[i] = hipTranslation.x;
      vals[i + 1] = yVal;
      vals[i + 2] = hipTranslation.z;
    }
  }

  const hipQuatTrack = s.tracks.find((t) => t.name.endsWith('Hips.quaternion'));
  if (hipQuatTrack) {
    const q = new THREE.Quaternion();
    for (let i = 0; i < hipQuatTrack.values.length; i += 4) {
      q.fromArray(hipQuatTrack.values, i).premultiply(MIXAMO_ROOT_ROT);
      q.toArray(hipQuatTrack.values, i);
    }
  }
  return s;
}

export function sanitizeClip(clip, stripAllPositions = false) {
  if (!clip) return clip;
  const c = clip.clone();
  c.tracks = c.tracks.filter((t) => {
    if (t.name.endsWith('.scale')) return false;
    if (t.name.endsWith('.position')) {
      if (stripAllPositions) return false;
      return t.name.includes('Hips');
    }
    return true;
  });
  return c;
}

export function loadGLTF(url) {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url));
  }
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        cache.set(url, gltf);
        resolve(gltf);
      },
      undefined,
      reject
    );
  });
}

