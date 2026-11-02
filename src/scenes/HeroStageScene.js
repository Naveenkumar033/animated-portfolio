import * as THREE from 'three';
import gsap from 'gsap';
import { loadGLTF, tuneSagarMaterials, tuneMacbookMaterials, sanitizeClip } from '../utils/assetLoader.js';
import { globalLighting } from './Lighting.js';

window.THREE = THREE;

export class HeroStageScene {
  constructor(canvasId = 'heroCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    window.__heroStageScene = this;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mixer = null;

    this.character = null;
    this.headBone = null;
    this.macbook = null;
    this.desk = null;

    this.leftHandGroup = null;
    this.rightHandGroup = null;
    this.leftMesh = null;
    this.rightMesh = null;

    this.typingAction = null;
    this.standToSitAction = null;
    this.pushAction = null;
    this.rightHandBone = null;
    this.handOffsetX = 0;
    this.bodyScreenFrac = 0;

    this.targetHeadRotX = 0;
    this.targetHeadRotY = 0;

    this.layout = {
      vHeight: 10,
      vWidth: 10,
      isMobile: false,
      a: 1,
      i: 1,
      o: 0,
      s: 0,
      l: 3.5,
      u: 2.9,
      d: 1,
      sittingX: 0,
      landingY: 0,
      sittingY: 0,
      sagarScale: 145,
      baseMacScale: 1.35
    };

    this.handAnim = {
      leftX: -15,
      leftY: -10,
      leftZ: 0.5,
      leftRotX: 0.4,
      leftRotY: -0.5,
      leftRotZ: -0.3,
      leftScale: 1,

      rightX: 15,
      rightY: 10,
      rightZ: 0.2,
      rightRotX: -0.4,
      rightRotY: -0.5,
      rightRotZ: 0.3,
      rightScale: 1,

      sagarX: 0,
      sagarY: 10,
      sagarZ: 0.85,
      sagarRotY: Math.PI / 4,
      sagarScale: 145,

      macbookScale: 0
    };

    this.isLoaded = false;
    this.isIntroDone = false;
    this.preloaderDone = false;
    this.introStarted = false;
    this.onLoadedCallbacks = [];

    this.initScene();
    this.loadAssets();
    this.animate();
  }

  startIntro() {
    this.preloaderDone = true;
    if (this.isLoaded && !this.introStarted) {
      this.playIntroAnimation();
    }
  }

  onReady(cb) {
    if (this.isLoaded) {
      cb();
    } else {
      this.onLoadedCallbacks.push(cb);
    }
  }

  initScene() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    // Lights
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

    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  onResize = () => {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const w = this.canvas.parentElement.clientWidth;
    const h = this.canvas.parentElement.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.updateLayout();
  };

  onMouseMove = (e) => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetHeadRotY = mouseX * 0.4;
    this.targetHeadRotX = -mouseY * 0.3;

    // Gentle parallax when at resting hero state
    if (this.isIntroDone && (!this.currentProgress || this.currentProgress <= 0.001)) {
      if (this.leftHandGroup) {
        this.leftHandGroup.rotation.z = mouseX * 0.035;
        this.leftHandGroup.position.x = this.layout.o + mouseX * 0.2;
        this.leftHandGroup.position.y = this.layout.s + mouseY * 0.15;
      }
      if (this.rightHandGroup) {
        this.rightHandGroup.rotation.z = mouseX * -0.04;
        const rightRestX = this.layout.vWidth * (this.layout.isMobile ? 0.46 : 0.35);
        const rightRestY = this.layout.vHeight * (this.layout.isMobile ? 0.28 : 0.15);
        this.rightHandGroup.position.x = rightRestX + mouseX * -0.25;
        this.rightHandGroup.position.y = rightRestY + mouseY * -0.18;
      }
    }
  };

  updateLayout() {
    const vHeight = 2 * 10 * Math.tan((45 / 2) * Math.PI / 180);
    const vWidth = vHeight * (this.camera.aspect || window.innerWidth / window.innerHeight);
    const isMobile = vWidth < 7.5;
    const a = Math.min(1, vWidth / 13.25);
    const i = Math.cbrt(a);
    const o = -vWidth * (isMobile ? 0.31 : 0.30);
    const s = -vHeight * (isMobile ? 0.23 : 0.33);
    const l = (isMobile ? 2.0 : 3.5) * i;
    const u = (isMobile ? 1.05 : 2.9) * i;
    const d = l / 3.5;

    // Index finger top surface: localX = 0.3073, localY = 0.4356
    const fingerWorldX = o + 0.3073 * l;
    const fingerWorldY = s + 0.4356 * l;

    // Character sitting position: hips resting squarely on finger, feet dangling down
    const sittingX = fingerWorldX;
    const landingY = fingerWorldY - 0.40;
    const sittingY = fingerWorldY - 0.866;
    const sagarScale = 100 * (isMobile ? 1.15 : 1.48) * i;
    const baseMacScale = isMobile ? 0.85 : 1.35;

    const pushStartX = isMobile ? -(0.1 * vWidth) : -4.8 * a;
    const pushEndX = isMobile ? 0.85 * vWidth : 11 * a;
    const groundY = vHeight * -0.01 + (vHeight * -0.3 - vHeight * -0.01) * i;

    this.layout = {
      vHeight,
      vWidth,
      isMobile,
      scale: i,
      span: a,
      a,
      i,
      o,
      s,
      l,
      u,
      d,
      fingerWorldX,
      fingerWorldY,
      sittingX,
      landingY,
      sittingY,
      sagarScale,
      baseMacScale,
      pushStartX,
      pushEndX,
      groundY
    };

    if (this.character && this.currentProgress === undefined && this.isIntroDone) {
      this.character.position.set(sittingX, sittingY, 0.85);
      this.character.scale.setScalar(sagarScale);
      this.character.rotation.y = Math.PI / 4;
    }
    if (this.macbook && this.currentProgress === undefined && this.isIntroDone) {
      this.macbook.position.set(sittingX + 0.38, sittingY + 1.05, 0.85 + 0.46);
      this.macbook.scale.setScalar(baseMacScale);
      this.macbook.rotation.set(-0.05, Math.PI + Math.PI / 4, 0.04);
    }
    if (this.desk && this.currentProgress === undefined) {
      this.desk.position.set(-15, s, -1.5);
      this.desk.scale.setScalar(0.35 * i);
    }
  }

  async loadAssets() {
    try {
      const textureLoader = new THREE.TextureLoader();

      const [sagarGltf, macbookGltf, deskGltf, typingGltf, pushGltf, standToSitGltf, leftTexture, rightTexture] = await Promise.all([
        loadGLTF('/models/sagar.glb'),
        loadGLTF('/models/macbook_ultra_concept.glb'),
        loadGLTF('/models/desk2.glb'),
        loadGLTF('/models/anim/typing.glb'),
        loadGLTF('/models/anim/push.glb'),
        loadGLTF('/models/anim/standToSit.glb'),
        textureLoader.loadAsync('/hero/hand-left.webp'),
        textureLoader.loadAsync('/hero/hand-right.webp')
      ]);

      // Hand textures
      leftTexture.colorSpace = THREE.SRGBColorSpace;
      leftTexture.anisotropy = 4;
      leftTexture.premultiplyAlpha = true;

      rightTexture.colorSpace = THREE.SRGBColorSpace;
      rightTexture.anisotropy = 4;
      rightTexture.premultiplyAlpha = true;

      // 3D Left Michelangelo Hand Mesh
      const leftGeo = new THREE.PlaneGeometry(1.9446, 0.9668);
      const leftMat = new THREE.MeshBasicMaterial({
        map: leftTexture,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        toneMapped: false
      });
      this.leftMesh = new THREE.Mesh(leftGeo, leftMat);
      this.leftMesh.position.set(0.0156, -0.0014, 0);

      this.leftHandGroup = new THREE.Group();
      this.leftHandGroup.add(this.leftMesh);
      this.scene.add(this.leftHandGroup);

      // 3D Right Michelangelo Hand Mesh
      const rightGeo = new THREE.PlaneGeometry(1.9381, 1.4119);
      const rightMat = new THREE.MeshBasicMaterial({
        map: rightTexture,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        toneMapped: false
      });
      this.rightMesh = new THREE.Mesh(rightGeo, rightMat);
      this.rightMesh.position.set(-0.0241, -0.0062, 0);

      this.rightHandGroup = new THREE.Group();
      this.rightHandGroup.add(this.rightMesh);
      this.scene.add(this.rightHandGroup);

      // Character Model & Animations
      this.character = tuneSagarMaterials(sagarGltf.scene);
      this.headBone = this.character.getObjectByName('mixamorigHead') || this.character.getObjectByName('mixamorig:Head');
      this.rightHandBone = this.character.getObjectByName('mixamorigRightHand') || this.character.getObjectByName('mixamorig:RightHand');
      this.scene.add(this.character);

      this.mixer = new THREE.AnimationMixer(this.character);

      const typingClip = sanitizeClip(typingGltf.animations[0]);
      this.typingAction = this.mixer.clipAction(typingClip);
      this.typingAction.setLoop(THREE.LoopRepeat, Infinity);
      this.typingAction.setEffectiveWeight(1);
      this.typingAction.play();

      const standToSitClip = sanitizeClip(standToSitGltf.animations[0]);
      this.standToSitAction = this.mixer.clipAction(standToSitClip);
      this.standToSitAction.reset().play();
      this.standToSitAction.paused = true;
      this.standToSitAction.setEffectiveWeight(0);

      const pushClip = sanitizeClip(pushGltf.animations[0]);
      this.pushAction = this.mixer.clipAction(pushClip);
      this.pushAction.reset().play();
      this.pushAction.paused = true;
      this.pushAction.setEffectiveWeight(0);

      // Concept MacBook
      this.macbook = tuneMacbookMaterials(macbookGltf.scene);
      this.scene.add(this.macbook);

      // Mechanical Desk
      this.desk = deskGltf.scene;
      this.desk.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const m of mats) {
            if (m.isMeshStandardMaterial && m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b > 0.05 || m.emissiveMap)) {
              m.emissiveIntensity = 2.5;
            }
          }
        }
      });
      this.desk.visible = false;
      this.scene.add(this.desk);

      this.updateLayout();

      this.isLoaded = true;
      window.__heroLoaded = true;
      window.__heroScene = this;

      if (this.preloaderDone && !this.introStarted) {
        this.playIntroAnimation();
      }

      this.onLoadedCallbacks.forEach((cb) => cb());
      this.onLoadedCallbacks = [];
    } catch (err) {
      console.error('Error loading HeroStage assets:', err);
    }
  }

  playIntroAnimation() {
    if (this.introStarted) return;
    this.introStarted = true;

    const { isMobile, i, o, s, l, u, vWidth, vHeight, sittingX, landingY, sittingY, sagarScale, baseMacScale } = this.layout;

    // Step 0: Set initial off-center / zoomed starting states
    this.handAnim.leftX = -0.85 * vWidth;
    this.handAnim.leftY = -0.85 * vHeight;
    this.handAnim.leftScale = (isMobile ? 0.55 : 1.5) * i;
    this.handAnim.leftRotX = 0.4;
    this.handAnim.leftRotY = -0.5;
    this.handAnim.leftRotZ = -0.3;

    this.handAnim.rightX = 0.85 * vWidth;
    this.handAnim.rightY = 0.85 * vHeight;
    this.handAnim.rightScale = (isMobile ? 0.45 : 1.25) * i;
    this.handAnim.rightRotX = -0.4;
    this.handAnim.rightRotY = -0.5;
    this.handAnim.rightRotZ = 0.3;

    this.handAnim.sagarX = sittingX;
    this.handAnim.sagarY = vHeight * 0.85; // drop from sky
    this.handAnim.sagarScale = sagarScale;
    this.handAnim.sagarRotY = Math.PI / 4;

    this.handAnim.macbookScale = 0;

    // Apply immediate positions
    if (this.leftHandGroup) {
      this.leftHandGroup.position.set(this.handAnim.leftX, this.handAnim.leftY, this.handAnim.leftZ);
      this.leftHandGroup.scale.setScalar(this.handAnim.leftScale);
    }
    if (this.rightHandGroup) {
      this.rightHandGroup.position.set(this.handAnim.rightX, this.handAnim.rightY, this.handAnim.rightZ);
      this.rightHandGroup.scale.setScalar(this.handAnim.rightScale);
    }
    if (this.character) {
      this.character.position.set(this.handAnim.sagarX, this.handAnim.sagarY, this.handAnim.sagarZ);
      this.character.scale.setScalar(this.handAnim.sagarScale);
    }
    if (this.macbook) {
      this.macbook.scale.setScalar(0);
    }

    window.__heroIntroPhase = 'start';

    this.introTl = gsap.timeline({
      delay: 0.15,
      onComplete: () => {
        this.isIntroDone = true;
        window.__heroIntroPhase = 'settled';
      }
    });
    const tl = this.introTl;

    // ------------------------------------------------------------------------
    // PHASE 1: Hands glide inward to touch / meet at center (1.1s)
    // ------------------------------------------------------------------------
    tl.to(this.handAnim, {
      leftX: -0.344 * l,
      leftY: -0.137 * l,
      leftRotX: 0.15,
      leftRotY: -0.15,
      leftRotZ: -0.05,
      rightX: 0.402 * u,
      rightY: 0.241 * u,
      rightRotX: -0.15,
      rightRotY: -0.2,
      rightRotZ: 0,
      duration: 1.1,
      ease: 'power2.out'
    }, 0);

    tl.add(() => {
      window.__heroIntroPhase = 'touch';
    }, 1.1);

    // ------------------------------------------------------------------------
    // PHASE 2: Hands part and zoom out to resting hero framing positions (1.6s)
    // ------------------------------------------------------------------------
    const rightRestX = vWidth * (isMobile ? 0.46 : 0.35);
    const rightRestY = vHeight * (isMobile ? 0.28 : 0.15);

    tl.to(this.handAnim, {
      leftX: o,
      leftY: s,
      leftScale: l,
      rightX: rightRestX,
      rightY: rightRestY,
      rightScale: u,
      duration: 1.6,
      ease: 'power3.inOut'
    }, 1.1);

    // Hands twist & settle rotation to normal
    tl.to(this.handAnim, {
      leftRotX: 0.45,
      leftRotY: -0.65,
      leftRotZ: -0.3,
      rightRotX: -0.45,
      rightRotY: -0.65,
      rightRotZ: 0.3,
      duration: 0.6,
      ease: 'power2.out'
    }, 1.1)
    .to(this.handAnim, {
      leftRotX: 0,
      leftRotY: 0,
      leftRotZ: 0,
      rightRotX: 0,
      rightRotY: 0,
      rightRotZ: 0,
      duration: 1.3,
      ease: 'power3.inOut'
    }, 1.7);

    // ------------------------------------------------------------------------
    // PHASE 3: Character drops down and lands squarely on the index finger
    // ------------------------------------------------------------------------
    tl.to(this.handAnim, {
      sagarY: landingY,
      duration: 0.95,
      ease: 'power2.in'
    }, 1.4);

    // Settle snugly into seated position with hips on finger and legs dangling
    tl.to(this.handAnim, {
      sagarY: sittingY,
      duration: 0.75,
      ease: 'power2.out'
    }, 2.35);

    // ------------------------------------------------------------------------
    // PHASE 4: Concept MacBook pops open in front of chest directly on keyboard
    // ------------------------------------------------------------------------
    tl.to(this.handAnim, {
      macbookScale: baseMacScale,
      duration: 0.65,
      ease: 'back.out(1.7)'
    }, 2.75);

    // ------------------------------------------------------------------------
    // PHASE 5: Fade in arrow annotation ("That's me, on my third coffee.") & UI
    // ------------------------------------------------------------------------
    tl.to(['#heroArrow', '#heroBio', '#heroLighting'], {
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out'
    }, 2.9);
  }

  updateScrub(progress) {
    this.currentProgress = progress;
    if (!this.character || !this.macbook || !this.desk) return;

    const p = progress;
    if (p > 0.001 && this.introTl && this.introTl.isActive()) {
      this.introTl.kill();
      this.isIntroDone = true;
    }
    const {
      isMobile,
      scale: u,
      span,
      o,
      s,
      l,
      u: rightScale,
      vWidth,
      vHeight,
      sittingX,
      sittingY,
      sagarScale,
      baseMacScale,
      pushStartX,
      pushEndX,
      groundY
    } = this.layout;

    const beat = (val, [min, max]) => {
      if (max <= min) return val >= max ? 1 : 0;
      const v = (val - min) / (max - min);
      return v < 0 ? 0 : v > 1 ? 1 : v;
    };

    const cubicBezier = (p0, p1, p2, p3, t) => {
      const inv = 1 - t;
      return inv * inv * inv * p0 + 3 * inv * inv * t * p1 + 3 * inv * t * t * p2 + t * t * t * p3;
    };

    const deskPathPointAt = (t, r, n) => {
      const a = n[0] - r[0];
      const p1 = [r[0] + 0.22 * a, r[1] + 1.6];
      const p2 = [r[0] + 0.78 * a, n[1] + 1.25];
      return [cubicBezier(r[0], p1[0], p2[0], n[0], t), cubicBezier(r[1], p1[1], p2[1], n[1], t)];
    };

    const deskXAt = (prog) => {
      return THREE.MathUtils.lerp(-4.8, 11, beat(prog, [0.44, 0.94]));
    };

    const deskRotYAt = (prog, baseRot = Math.PI - 15 * Math.PI / 180, r = 1) => {
      return baseRot - Math.atan2(deskXAt(prog) * r, 11.5) + Math.atan2(11 * r, 11.5);
    };

    // 0. Absolute resting hero state
    if (p <= 0.001) {
      const rightRestX = vWidth * (isMobile ? 0.46 : 0.35);
      const rightRestY = vHeight * (isMobile ? 0.28 : 0.15);

      this.handAnim.leftX = o;
      this.handAnim.leftY = s;
      this.handAnim.leftScale = l;
      this.handAnim.leftRotX = 0;
      this.handAnim.leftRotY = 0;
      this.handAnim.leftRotZ = 0;

      this.handAnim.rightX = rightRestX;
      this.handAnim.rightY = rightRestY;
      this.handAnim.rightScale = rightScale;
      this.handAnim.rightRotX = 0;
      this.handAnim.rightRotY = 0;
      this.handAnim.rightRotZ = 0;

      this.handAnim.sagarX = sittingX;
      this.handAnim.sagarY = sittingY;
      this.handAnim.sagarScale = sagarScale;
      this.handAnim.sagarRotY = Math.PI / 4;
      this.handAnim.macbookScale = baseMacScale;

      this.character.position.set(sittingX, sittingY, 0.85);
      this.character.scale.setScalar(sagarScale);
      this.character.rotation.set(0, Math.PI / 4, 0);

      this.macbook.position.set(sittingX + 0.38, sittingY + 1.05, 0.85 + 0.46);
      this.macbook.scale.setScalar(baseMacScale);
      this.macbook.rotation.set(-0.05, Math.PI + Math.PI / 4, 0.04);
      this.macbook.visible = true;

      this.desk.visible = false;
      if (this.typingAction) this.typingAction.setEffectiveWeight(1);
      if (this.standToSitAction) this.standToSitAction.setEffectiveWeight(0);
      if (this.pushAction) this.pushAction.setEffectiveWeight(0);
      if (this.camera) this.camera.position.z = 10;
      this.bodyScreenFrac = 0;
      return;
    }

    // 1. Hands exit
    const handExitP = beat(p, [0.04, 0.26]);
    const rightRestX = vWidth * (isMobile ? 0.46 : 0.35);
    const rightRestY = vHeight * (isMobile ? 0.28 : 0.15);

    this.handAnim.leftX = o - 0.4 * vWidth * handExitP;
    this.handAnim.leftY = s - 0.08 * vHeight * handExitP;
    this.handAnim.leftScale = l * (1 - handExitP);

    this.handAnim.rightX = THREE.MathUtils.lerp(rightRestX, vWidth * 1.1, handExitP);
    this.handAnim.rightScale = rightScale * (1 - handExitP);

    // 2. MacBook flies away with tumble
    const macbookP = beat(p, [0.04, 0.12]);
    this.macbook.scale.setScalar(baseMacScale * Math.max(0, 1 - macbookP));
    this.macbook.position.y = sittingY + 1.05 + macbookP * 1.5;
    this.macbook.position.z = 0.85 + 0.46 - macbookP * 3;
    this.macbook.rotation.x = -0.05 + macbookP * 2.5;
    this.macbook.visible = macbookP < 0.99;

    // 3. Desk positioning
    const deskInP = beat(p, [0.20, 0.44]);
    const pushP = beat(p, [0.44, 0.94]);

    const d = (deskXAt(p) - (-4.8)) / (11 - (-4.8));
    const deskX = pushStartX + (pushEndX - pushStartX) * d;

    this.desk.visible = deskInP > 0.001;
    this.desk.scale.setScalar(THREE.MathUtils.lerp(0, 0.35 * u, deskInP));
    this.desk.position.set(deskX, vHeight * -0.01, -1.5);
    this.desk.rotation.y = deskRotYAt(p, Math.PI - 15 * Math.PI / 180, span);

    // 4. Character positioning along arc to desk, then lockstep with desk
    const toDeskP = beat(p, [0.04, 0.34]);
    const toPushP = beat(p, [0.32, 0.42]);

    const easeM = gsap.parseEase('power1.inOut')(toDeskP);
    const arcStart = [sittingX, sittingY];
    const arcEnd = [deskX - 3.25 * span, groundY];
    const [arcX, arcY] = deskPathPointAt(easeM, arcStart, arcEnd);

    // Hand offset tracking for exact hand-to-desk edge contact
    const handOffsetX = this.handOffsetX || (0.85 * span);
    const contactOffset = -0.68;
    const bodyLimit = -2.55;
    const pushContactX = deskX + contactOffset * u - handOffsetX;
    const pushLimitX = deskX + bodyLimit * u;
    const pushTargetX = Math.min(pushContactX, pushLimitX);

    const charX = THREE.MathUtils.lerp(arcX, pushTargetX, toPushP);
    const charY = THREE.MathUtils.lerp(arcY, groundY + 0.36 * span, toPushP);
    const charZ = THREE.MathUtils.lerp(0.85, -1.9, toDeskP);
    const charRotY = THREE.MathUtils.lerp(Math.PI / 4, Math.PI / 2, toPushP);
    const charScale = sagarScale;

    this.character.position.set(charX, charY, charZ);
    this.character.rotation.set(0, charRotY, 0);
    this.character.scale.setScalar(charScale);
    this.character.visible = true;

    // 5. Continuous animation blend weights & scrubbing
    const fallBlend = Math.min(1, Math.max(0, toDeskP / 0.12));

    if (this.typingAction) {
      this.typingAction.setEffectiveWeight((1 - fallBlend) * (1 - toPushP));
    }
    if (this.standToSitAction) {
      this.standToSitAction.setEffectiveWeight(fallBlend * (1 - toPushP));
      const dur = this.standToSitAction.getClip().duration || 2.0;
      this.standToSitAction.time = Math.max(0, dur - THREE.MathUtils.clamp(toDeskP, 0, 1) * dur);
    }
    if (this.pushAction) {
      this.pushAction.setEffectiveWeight(toPushP);
      const dur = this.pushAction.getClip().duration || 1.0;
      const scrubT = Math.min(dur - 0.0001, Math.max(0, pushP * dur));
      this.pushAction.time = scrubT;
    }

    // 6. Camera subtle zoom
    if (this.camera) {
      this.camera.position.z = 10 - p * 1.5;
    }

    // 7. Track Right Hand bone for dynamic screen fraction
    if (this.rightHandBone) {
      this.rightHandBone.updateWorldMatrix(true, false);
      const hwPos = new THREE.Vector3();
      this.rightHandBone.getWorldPosition(hwPos);
      this.handOffsetX = hwPos.x - this.character.position.x;
      this.bodyScreenFrac = Math.min(1, Math.max(0, 0.5 + (hwPos.x - 1.47) / vWidth));
    } else {
      this.bodyScreenFrac = Math.min(1, Math.max(0, 0.5 + (charX - 0.4) / vWidth));
    }
  }

  getCharacterScreenFraction() {
    return this.bodyScreenFrac || 0;
  }

  animate = (now = performance.now()) => {
    requestAnimationFrame(this.animate);
    const delta = Math.min((now - (this.lastTime || now)) * 0.001, 0.1);
    this.lastTime = now;

    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Update 3D hands in scene
    if (this.leftHandGroup) {
      const s = Math.max(0, this.handAnim.leftScale);
      this.leftHandGroup.visible = s > 0.005;
      this.leftHandGroup.position.set(this.handAnim.leftX, this.handAnim.leftY, this.handAnim.leftZ);
      this.leftHandGroup.rotation.set(0.45 * this.handAnim.leftRotX, 0.45 * this.handAnim.leftRotY, this.handAnim.leftRotZ);
      this.leftHandGroup.scale.setScalar(s);
    }
    if (this.rightHandGroup) {
      const s = Math.max(0, this.handAnim.rightScale);
      this.rightHandGroup.visible = s > 0.005;
      this.rightHandGroup.position.set(this.handAnim.rightX, this.handAnim.rightY, this.handAnim.rightZ);
      this.rightHandGroup.rotation.set(0.45 * this.handAnim.rightRotX, 0.45 * this.handAnim.rightRotY, this.handAnim.rightRotZ);
      this.rightHandGroup.scale.setScalar(s);
    }

    // Always maintain character & macbook in sync when at rest or during intro
    if (this.character && (!this.currentProgress || this.currentProgress <= 0.001)) {
      this.character.position.set(this.handAnim.sagarX, this.handAnim.sagarY, this.handAnim.sagarZ);
      this.character.scale.setScalar(this.handAnim.sagarScale);
      this.character.rotation.y = this.handAnim.sagarRotY;
      this.character.visible = true;
    }
    if (this.macbook && (!this.currentProgress || this.currentProgress <= 0.001)) {
      this.macbook.position.set(
        this.handAnim.sagarX + 0.38,
        this.handAnim.sagarY + 1.05,
        this.handAnim.sagarZ + 0.46
      );
      this.macbook.scale.setScalar(this.handAnim.macbookScale);
      this.macbook.rotation.set(-0.05, Math.PI + Math.PI / 4, 0.04);
    }

    if (this.headBone) {
      this.headBone.rotation.y = THREE.MathUtils.lerp(this.headBone.rotation.y, this.targetHeadRotY, 0.08);
      this.headBone.rotation.x = THREE.MathUtils.lerp(this.headBone.rotation.x, this.targetHeadRotX, 0.08);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
