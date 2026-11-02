import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { loadGLTF, tuneSagarMaterials, keptInPlace } from '../utils/assetLoader.js';

export class CreativeCharScene {
  constructor(canvasId = 'creativeCharCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    window.__creativeCharScene = this;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mixer = null;

    this.group = null;
    this.charGroup = null;
    this.character = null;
    this.headBone = null;
    this.groundShadow = null;

    this.standingAction = null;
    this.diveAction = null;

    this.target = new THREE.Vector3(0, 1.05, 0);
    this.camBasePos = new THREE.Vector3(0, 1.1, 4.4);
    this.mouseTarget = 0;
    this.swing = 0;
    this.lastTime = performance.now();
    this.progress = 0;
    this.isReady = false;

    this.initScene();
    this.loadAssets();
    this.animate();
  }

  initScene() {
    const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : null;
    const width = rect && rect.width ? rect.width : window.innerWidth;
    const height = rect && rect.height ? rect.height : window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    this.camera.position.copy(this.camBasePos);
    this.camera.lookAt(this.target);

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

    // Studio lighting matching reference scene
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

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      this.mouseTarget = ((e.clientX / window.innerWidth) - 0.5) * 2;
    }, { passive: true });
  }

  onResize = () => {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const w = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    const h = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;
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
      grad.addColorStop(0, 'rgba(0,0,0,0.52)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.18)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      toneMapped: false
    });
    this.groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.groundShadow.rotation.x = -Math.PI / 2;
    this.groundShadow.position.set(0, 0.002, 0);
    this.group.add(this.groundShadow);
  }

  async loadAssets() {
    try {
      const [sagarGltf, stretchGltf, jumpGltf] = await Promise.all([
        loadGLTF('/models/sagar.glb'),
        loadGLTF('/models/anim/armStretch.glb'),
        loadGLTF('/models/anim/jumping.glb')
      ]);

      this.createGroundShadow();

      // Setup character group
      this.charGroup = new THREE.Group();
      this.charGroup.scale.setScalar(100);

      this.character = tuneSagarMaterials(SkeletonUtils.clone(sagarGltf.scene));
      this.headBone = this.character.getObjectByName('mixamorigHead') || this.character.getObjectByName('mixamorig:Head');
      this.charGroup.add(this.character);
      this.group.add(this.charGroup);

      this.mixer = new THREE.AnimationMixer(this.character);

      // 1. Standing pose (arm stretch)
      const stretchClip = keptInPlace(stretchGltf.animations[0], 'stretch');
      this.standingAction = this.mixer.clipAction(stretchClip);
      this.standingAction.setLoop(THREE.LoopRepeat, Infinity);
      this.standingAction.play();

      // 2. Dive / Leap forward pose (jumping)
      const jumpClip = keptInPlace(jumpGltf.animations[0], 'jump');
      this.diveAction = this.mixer.clipAction(jumpClip);
      this.diveAction.setLoop(THREE.LoopOnce, 1);
      this.diveAction.clampWhenFinished = true;
      this.diveAction.play();
      this.diveAction.paused = true;
      this.diveAction.setEffectiveWeight(0);

      this.isReady = true;
      this.updateScrub(this.progress || 0);

    } catch (err) {
      console.error('Error loading CreativeCharScene assets:', err);
    }
  }

  updateScrub(progress) {
    this.progress = Math.max(0, Math.min(1, progress || 0));
    if (!this.isReady || !this.charGroup || !this.standingAction || !this.diveAction) return;

    const p = this.progress;

    // Phase 1 (0 -> 0.42): Confident standing pose in center, facing user
    // Phase 2 (0.42 -> 1.0): Superhero dive / leap forward towards camera
    if (p <= 0.42) {
      this.standingAction.setEffectiveWeight(1);
      this.diveAction.setEffectiveWeight(0);
      this.charGroup.position.set(0, 0, 0);
      this.charGroup.rotation.set(0, 0.05, 0);

      if (this.groundShadow) {
        this.groundShadow.material.opacity = 0.55;
        this.groundShadow.position.set(0, 0.002, 0);
      }
    } else {
      // Dive phase normalized t in [0, 1]
      const t = (p - 0.42) / 0.58;
      const ease = t * t * (3 - 2 * t);

      // Crossfade weights
      this.standingAction.setEffectiveWeight(1 - ease);
      this.diveAction.setEffectiveWeight(ease);

      // Scrub dive action from start of jump (0.4s) to the peak forward reaching pose (1.37s)
      this.diveAction.time = 0.4 + ease * (1.37 - 0.4);

      // Dynamic trajectory: translate forward towards the camera and lower slightly to keep diving hands centered
      this.charGroup.position.x = THREE.MathUtils.lerp(0, -0.05, ease);
      this.charGroup.position.y = THREE.MathUtils.lerp(0, -0.15, ease);
      this.charGroup.position.z = THREE.MathUtils.lerp(0, 1.45, ease);

      // Dynamic dive angles matching reference Image 3:
      // Rotates forward headfirst (x), angled towards camera (y), slight bank (z)
      this.charGroup.rotation.x = THREE.MathUtils.lerp(0, 0.38, ease);
      this.charGroup.rotation.y = THREE.MathUtils.lerp(0.05, -0.55, ease);
      this.charGroup.rotation.z = THREE.MathUtils.lerp(0, 0.22, ease);

      // Ground shadow fades away as character leaps up and forward
      if (this.groundShadow) {
        this.groundShadow.material.opacity = THREE.MathUtils.lerp(0.55, 0, ease);
        this.groundShadow.position.x = this.charGroup.position.x * 0.5;
        this.groundShadow.position.z = this.charGroup.position.z * 0.5;
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
      // Subtle interactive parallax
      this.swing += (0.15 * this.mouseTarget - this.swing) * (1 - Math.exp(-3 * delta));
      this.camera.position.x = this.camBasePos.x + this.swing;
      this.camera.lookAt(this.target);
    }

    if (this.headBone && this.progress <= 0.42) {
      this.headBone.rotation.y = THREE.MathUtils.lerp(this.headBone.rotation.y, this.mouseTarget * 0.22, 0.08);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}

