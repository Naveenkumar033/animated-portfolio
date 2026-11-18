import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { loadGLTF, tuneSagarMaterials, sanitizeClip } from '../utils/assetLoader.js';

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
    this._camOffset = new THREE.Vector3();

    this.swing = 0;
    this.mouseTarget = 0;
    this.lastTime = performance.now();
    this.canvasCenterX = window.innerWidth / 2;

    this.isVisible = false;
    this.assetsRequested = false;
    this.rafId = null;

    this.initScene();
    this.initVisibilityObservers();
  }

  initScene() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 450;
    this.canvasCenterX = rect.left + width / 2;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 200);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping || THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    // Studio Lights
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

    this.updateCameraFrame(width / height);

    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
  }

  updateCameraFrame(aspect) {
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hFovRad = Math.atan(Math.tan(fovRad) * (aspect || 1));
    this._camDist = 1 / Math.sin(Math.min(fovRad, hFovRad));
    this._camOffset.copy(this.fromDir).applyAxisAngle(this.upVec, this.swing).multiplyScalar(this._camDist);
    this.camera.position.copy(this.target).add(this._camOffset);
    this.camera.lookAt(this.target);
  }

  onPointerMove = (e) => {
    if (!this.isVisible) return;
    if (e.pointerType && e.pointerType !== 'mouse') return;
    this.mouseTarget = Math.max(-1, Math.min(1, ((e.clientX - this.canvasCenterX) / window.innerWidth) * 2));
  };

  onResize = () => {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = rect.width || 600;
    const h = rect.height || 450;
    this.canvasCenterX = rect.left + w / 2;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.updateCameraFrame(w / h);
  };

  initVisibilityObservers() {
    const section = document.getElementById('about') || this.canvas;
    if (section && typeof IntersectionObserver !== 'undefined') {
      // Lazy-load assets when approaching #about
      const loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.warmUp();
            loadObserver.disconnect();
          }
        },
        { rootMargin: '700px 0px', threshold: 0.01 }
      );
      loadObserver.observe(section);

      // Render loop active only while #about is visible
      const renderObserver = new IntersectionObserver(
        ([entry]) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && !document.hidden) {
            this.warmUp();
            const r = entry.boundingClientRect;
            this.canvasCenterX = r.left + r.width / 2;
            this.startLoop();
          } else {
            this.stopLoop();
          }
        },
        { rootMargin: '120px 0px', threshold: 0.01 }
      );
      renderObserver.observe(section);
    } else {
      this.isVisible = true;
      this.warmUp();
      this.startLoop();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopLoop();
      } else if (this.isVisible) {
        this.startLoop();
      }
    });
  }

  warmUp() {
    if (this.assetsRequested) return;
    this.assetsRequested = true;
    this.loadAssets();
  }

  startLoop() {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.animate);
  }

  stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  createGroundShadow() {
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
    grad.addColorStop(0, 'rgba(0,0,0,0.42)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
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

      this.createGroundShadow();
      this.createDeskLegs();

      const deskGroup = new THREE.Group();
      deskGroup.position.set(-0.415, 0.676, 0.611);

      this.desk = deskGltf.scene.clone(true);
      this.desk.visible = true;
      this.desk.position.set(0, 0, 0);
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

      const chairGroup = new THREE.Group();
      chairGroup.position.set(0.02, 0.724, -0.065);

      this.chair = chairGltf.scene.clone(true);
      this.chair.scale.setScalar(0.0427);
      chairGroup.add(this.chair);
      this.group.add(chairGroup);

      const charGroup = new THREE.Group();
      charGroup.scale.setScalar(100);

      this.character = tuneSagarMaterials(SkeletonUtils.clone(sagarGltf.scene));
      this.character.visible = true;
      this.character.position.set(0, 0, 0);
      this.character.rotation.set(0, 0, 0);
      this.character.scale.set(1, 1, 1);
      this.headBone = this.character.getObjectByName('mixamorigHead') || this.character.getObjectByName('mixamorig:Head');
      charGroup.add(this.character);
      this.group.add(charGroup);

      this.mixer = new THREE.AnimationMixer(this.character);
      let typingClip = sanitizeClip(animGltf.animations[0]);
      typingClip = THREE.AnimationUtils.subclip(typingClip, 'typing', Math.round(30 * 1.3), Math.round(30 * 15.9), 30);
      const typingAction = this.mixer.clipAction(typingClip);
      typingAction.setLoop(THREE.LoopRepeat, Infinity);
      typingAction.play();

      // Pre-compile shaders & render one warm-up frame so scrolling into #about has zero shader compile stutter
      if (this.renderer && this.scene && this.camera) {
        this.mixer.update(0);
        this.renderer.compile(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
      }
    } catch (err) {
      console.error('Error loading WhyDesk assets:', err);
    }
  }

  animate = (now = performance.now()) => {
    if (!this.isVisible || document.hidden) {
      this.rafId = null;
      return;
    }
    this.rafId = requestAnimationFrame(this.animate);
    const delta = Math.min((now - (this.lastTime || now)) * 0.001, 0.05);
    this.lastTime = now;

    if (this.mixer) {
      this.mixer.update(delta);
    }

    if (this.camera) {
      this.swing += (0.22 * this.mouseTarget - this.swing) * (1 - Math.exp(-3 * delta));
      this._camOffset.copy(this.fromDir).applyAxisAngle(this.upVec, this.swing).multiplyScalar(this._camDist || 2.8);
      this.camera.position.copy(this.target).add(this._camOffset);
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
