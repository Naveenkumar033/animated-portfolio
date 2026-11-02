import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { loadGLTF, tuneSagarMaterials, sanitizeClip, keptInPlace } from '../utils/assetLoader.js';

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
    this.charGroup = null;
    this.character = null;
    this.headBone = null;
    this.chair = null;
    this.desk = null;
    this.standingShadow = null;
    this.typingAction = null;
    this.stretchAction = null;
    this.jumpAction = null;
    this.scrubProgress = 0;

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
      const [deskGltf, chairGltf, sagarGltf, typingGltf, stretchGltf, jumpGltf] = await Promise.all([
        loadGLTF('/models/desk2.glb'),
        loadGLTF('/models/chair.glb'),
        loadGLTF('/models/sagar.glb'),
        loadGLTF('/models/anim/typing.glb'),
        loadGLTF('/models/anim/armStretch.glb'),
        loadGLTF('/models/anim/jumping.glb')
      ]);

      // 1. Soft Ground Shadow under desk & chair
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

      // 5. Standing Contact Shadow (appears when character steps out to standing pose)
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = shadowCanvas.height = 128;
      const ctx = shadowCanvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(0,0,0,0.48)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.18)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
      }
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowGeo = new THREE.PlaneGeometry(0.85, 0.85);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false
      });
      this.standingShadow = new THREE.Mesh(shadowGeo, shadowMat);
      this.standingShadow.rotation.x = -Math.PI / 2;
      this.standingShadow.position.set(-0.26, 0.003, 0.42);
      this.group.add(this.standingShadow);

      // 6. Developer Character
      // Exact reference scale: SAGAR_MODEL_SCALE = 100
      this.charGroup = new THREE.Group();
      this.charGroup.scale.setScalar(100);

      this.character = tuneSagarMaterials(SkeletonUtils.clone(sagarGltf.scene));
      this.headBone = this.character.getObjectByName('mixamorigHead') || this.character.getObjectByName('mixamorig:Head');
      this.charGroup.add(this.character);
      this.group.add(this.charGroup);

      // 7. Animations Mixer
      this.mixer = new THREE.AnimationMixer(this.character);

      // (a) Typing loop
      let typingClip = sanitizeClip(typingGltf.animations[0]);
      typingClip = THREE.AnimationUtils.subclip(typingClip, 'typing', Math.round(30 * 1.3), Math.round(30 * 15.9), 30);
      this.typingAction = this.mixer.clipAction(typingClip);
      this.typingAction.setLoop(THREE.LoopRepeat, Infinity);
      this.typingAction.play();

      // (b) Arm Stretch standing pose
      let stretchClip = keptInPlace(stretchGltf.animations[0], 'stretch');
      this.stretchAction = this.mixer.clipAction(stretchClip);
      this.stretchAction.setLoop(THREE.LoopRepeat, Infinity);
      this.stretchAction.play();
      this.stretchAction.setEffectiveWeight(0);

      // (c) Jump forward & down transition to next section
      let jumpClip = keptInPlace(jumpGltf.animations[0], 'jump');
      this.jumpAction = this.mixer.clipAction(jumpClip);
      this.jumpAction.setLoop(THREE.LoopOnce, 1);
      this.jumpAction.clampWhenFinished = true;
      this.jumpAction.play();
      this.jumpAction.paused = true;
      this.jumpAction.setEffectiveWeight(0);

      // Apply initial scrub state
      this.updateScrub(this.scrubProgress || 0);

    } catch (err) {
      console.error('Error loading WhyDesk assets:', err);
    }
  }

  updateScrub(progress) {
    this.scrubProgress = Math.max(0, Math.min(1, progress || 0));
    if (!this.charGroup || !this.typingAction || !this.stretchAction || !this.jumpAction) return;

    const p = this.scrubProgress;

    if (p <= 0.38) {
      // Phase 1 (0 -> 0.38): Seated typing -> rises to stand in front of desk
      const t = p / 0.38;
      const ease = t * t * (3 - 2 * t);

      this.typingAction.setEffectiveWeight(1 - ease);
      this.stretchAction.setEffectiveWeight(ease);
      this.jumpAction.setEffectiveWeight(0);

      this.charGroup.position.x = THREE.MathUtils.lerp(0, -0.26, ease);
      this.charGroup.position.y = 0;
      this.charGroup.position.z = THREE.MathUtils.lerp(0, 0.42, ease);
      this.charGroup.rotation.set(0, THREE.MathUtils.lerp(0, 0.35, ease), 0);

      if (this.standingShadow) {
        this.standingShadow.material.opacity = THREE.MathUtils.lerp(0, 0.52, ease);
        this.standingShadow.position.x = this.charGroup.position.x;
        this.standingShadow.position.z = this.charGroup.position.z;
      }
    } else if (p <= 0.58) {
      // Phase 2 (0.38 -> 0.58): Confident standing stretch pose in front of desk (matching reference photo)
      this.typingAction.setEffectiveWeight(0);
      this.stretchAction.setEffectiveWeight(1);
      this.jumpAction.setEffectiveWeight(0);

      this.charGroup.position.set(-0.26, 0, 0.42);
      this.charGroup.rotation.set(0, 0.35, 0);

      if (this.standingShadow) {
        this.standingShadow.material.opacity = 0.52;
        this.standingShadow.position.set(-0.26, 0.003, 0.42);
      }
    } else {
      // Phase 3 (0.58 -> 1.0): Crouches and JUMPS forward & down out of the Why page towards next page!
      const u = (p - 0.58) / 0.42;
      const ease = u * u * (3 - 2 * u);

      const fade = Math.min(1, u * 3.2);
      this.typingAction.setEffectiveWeight(0);
      this.stretchAction.setEffectiveWeight(1 - fade);
      this.jumpAction.setEffectiveWeight(fade);

      // Scrub jump animation from anticipation crouch (0s) to takeoff (0.42s) to mid-air flight (1.15s)
      this.jumpAction.time = ease * 1.15;

      // Parabolic jump arc: initial lift off the ground, then descending leap downwards
      const jumpArcY = Math.sin(Math.PI * Math.min(1, u * 1.25)) * 0.32 - (u > 0.6 ? Math.pow((u - 0.6) / 0.4, 2) * 1.15 : 0);

      this.charGroup.position.x = THREE.MathUtils.lerp(-0.26, -0.05, ease);
      this.charGroup.position.y = jumpArcY;
      this.charGroup.position.z = THREE.MathUtils.lerp(0.42, 1.45, ease);

      this.charGroup.rotation.x = THREE.MathUtils.lerp(0, 0.28, ease);
      this.charGroup.rotation.y = THREE.MathUtils.lerp(0.35, 0.15, ease);
      this.charGroup.rotation.z = 0;

      if (this.standingShadow) {
        this.standingShadow.material.opacity = Math.max(0, (1 - u * 2.2) * 0.52);
        this.standingShadow.position.x = this.charGroup.position.x;
        this.standingShadow.position.z = this.charGroup.position.z * 0.7;
      }
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

    if (this.headBone && this.scrubProgress <= 0.58) {
      this.headBone.rotation.y = THREE.MathUtils.lerp(this.headBone.rotation.y, this.mouseTarget * 0.25, 0.08);
      this.headBone.rotation.x = THREE.MathUtils.lerp(this.headBone.rotation.x, -0.12, 0.08);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
