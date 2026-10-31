import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { loadGLTF, tuneSagarMaterials, sanitizeClip } from '../utils/assetLoader.js';
import { globalLighting } from './Lighting.js';

export class WhyDeskScene {
  constructor(canvasId = 'whyDeskCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    window.__whyDeskScene = this;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mixer = null;

    this.group = null;
    this.character = null;
    this.headBone = null;
    this.chair = null;
    this.desk = null;

    this.target = new THREE.Vector3(-0.14, 0.6, 0.4);
    this.fromDir = new THREE.Vector3(0.683, 0.36, 0.636).normalize();
    this.upVec = new THREE.Vector3(0, 1, 0);

    this.swing = 0;
    this.mouseTarget = 0;
    this.lastTime = performance.now();

    this.initScene();
    this.loadAssets();
    this.animate();
  }

  initScene() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 450;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 200);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping || THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    // Studio Lights from reference WhyScene
    const hemiLight = new THREE.HemisphereLight(0xe4ecfa, 0x8590b0, 2.3);
    const keyLight = new THREE.DirectionalLight(0xe2eafa, 3.4);
    keyLight.position.set(2.5, 3.5, -1.5);
    const fillLight = new THREE.DirectionalLight(0xa9bbdc, 1.7);
    fillLight.position.set(-2, 1.5, 2);
    const rimLight = new THREE.DirectionalLight(0xcfe0ff, 2.2);
    rimLight.position.set(-2, 2.6, -2.6);

    this.scene.add(hemiLight);
    this.scene.add(keyLight);
    this.scene.add(fillLight);
    this.scene.add(rimLight);

    globalLighting.register(hemiLight, keyLight, fillLight, rimLight);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Initial camera placement
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hFovRad = Math.atan(Math.tan(fovRad) * (width / height));
    const dist = 1 / Math.sin(Math.min(fovRad, hFovRad));
    const camOffset = new THREE.Vector3().copy(this.fromDir).multiplyScalar(dist);
    this.camera.position.copy(this.target).add(camOffset);
    this.camera.lookAt(this.target);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const r = this.canvas.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      this.mouseTarget = Math.max(-1, Math.min(1, ((e.clientX - centerX) / window.innerWidth) * 2));
    }, { passive: true });
  }

  onResize = () => {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const w = this.canvas.parentElement.clientWidth;
    const h = this.canvas.parentElement.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  createGroundShadow() {
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0,0,0,0.45)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.18)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      toneMapped: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(-0.2, 0.002, 0.32);
    shadowMesh.scale.set(1.6, 1.15, 1);
    this.group.add(shadowMesh);
  }

  createDeskLegs() {
    const legGeo = new THREE.BoxGeometry(0.035, 0.651, 0.035);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1b1b1b,
      roughness: 0.55,
      metalness: 0.2
    });
    const b = [-0.9, 0.37];
    const M = [0.37, 0.97];
    b.forEach((r) => {
      M.forEach((n) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(r, 0.3255, n);
        this.group.add(leg);
      });
    });
  }

  async loadAssets() {
    try {
      const [deskGltf, chairGltf, sagarGltf, animGltf] = await Promise.all([
        loadGLTF('/models/desk2.glb'),
        loadGLTF('/models/chair.glb'),
        loadGLTF('/models/sagar.glb'),
        loadGLTF('/models/anim/typing.glb')
      ]);

      // 1. Soft Ground Shadow
      this.createGroundShadow();

      // 2. 4 Desk Legs
      this.createDeskLegs();

      // 3. Desk Top & PC Setup
      // Exact reference coordinates: v = [-0.415, 0.676, 0.611], rotation: [0, Math.PI/2, 0], scale: 0.095
      const deskGroup = new THREE.Group();
      deskGroup.position.set(-0.415, 0.676, 0.611);

      this.desk = deskGltf.scene.clone(true);
      this.desk.rotation.set(0, Math.PI / 2, 0);
      this.desk.scale.setScalar(0.095);

      this.desk.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const m of mats) {
            if (m.isMeshStandardMaterial && m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b > 0.05 || m.emissiveMap)) {
              m.emissiveIntensity = 2.2;
            }
          }
        }
      });
      deskGroup.add(this.desk);
      this.group.add(deskGroup);

      // 4. Ergonomic Chair
      // Exact reference coordinates: x = [0.02, 0.724, -0.065], scale: 0.0427
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0.02, 0.724, -0.065);

      this.chair = chairGltf.scene.clone(true);
      this.chair.scale.setScalar(0.0427);
      chairGroup.add(this.chair);
      this.group.add(chairGroup);

      // 5. Developer Character in Seated Typing Position
      // Exact reference scale: SAGAR_MODEL_SCALE = 100, position: [0, 0, 0]
      const charGroup = new THREE.Group();
      charGroup.scale.setScalar(100);

      this.character = tuneSagarMaterials(SkeletonUtils.clone(sagarGltf.scene));
      this.headBone = this.character.getObjectByName('mixamorigHead') || this.character.getObjectByName('mixamorig:Head');
      charGroup.add(this.character);
      this.group.add(charGroup);

      // 6. Typing Animation Clip trimmed to [1.3s, 15.9s] loop
      this.mixer = new THREE.AnimationMixer(this.character);
      let typingClip = sanitizeClip(animGltf.animations[0]);
      typingClip = THREE.AnimationUtils.subclip(typingClip, 'typing', Math.round(30 * 1.3), Math.round(30 * 15.9), 30);
      const typingAction = this.mixer.clipAction(typingClip);
      typingAction.setLoop(THREE.LoopRepeat, Infinity);
      typingAction.play();

    } catch (err) {
      console.error('Error loading WhyDesk assets:', err);
    }
  }

  animate = (now = performance.now()) => {
    requestAnimationFrame(this.animate);
    const delta = Math.min((now - (this.lastTime || now)) * 0.001, 0.05);
    this.lastTime = now;

    if (this.mixer) {
      this.mixer.update(delta);
    }

    if (this.camera) {
      const fovRad = THREE.MathUtils.degToRad(this.camera.fov / 2);
      const hFovRad = Math.atan(Math.tan(fovRad) * (this.camera.aspect || 1));
      const dist = 1 / Math.sin(Math.min(fovRad, hFovRad));

      // Dynamic pointer parallax swing
      this.swing += (0.22 * this.mouseTarget - this.swing) * (1 - Math.exp(-3 * delta));
      const camOffset = new THREE.Vector3().copy(this.fromDir).applyAxisAngle(this.upVec, this.swing).multiplyScalar(dist);
      this.camera.position.copy(this.target).add(camOffset);
      this.camera.lookAt(this.target);
    }

    if (this.headBone) {
      this.headBone.rotation.y = THREE.MathUtils.lerp(this.headBone.rotation.y, this.mouseTarget * 0.25, 0.08);
      this.headBone.rotation.x = THREE.MathUtils.lerp(this.headBone.rotation.x, -0.12, 0.08);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
