import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import gsap from 'gsap';
import { loadGLTF, tuneSagarMaterials, sanitizeClip } from '../utils/assetLoader.js';
import { playSound } from '../utils/audio.js';

/**
 * Normalizes animation clip tracks to match model bone naming (handles mixamorig: vs mixamorig)
 */
function adaptClipTracks(clip, character) {
  if (!clip) return clip;
  const cloned = clip.clone();
  const hasColon = !!character.getObjectByName('mixamorig:Hips');
  cloned.tracks.forEach((track) => {
    if (hasColon) {
      if (track.name.startsWith('mixamorig') && !track.name.startsWith('mixamorig:')) {
        track.name = track.name.replace(/^mixamorig/, 'mixamorig:');
      }
    } else {
      if (track.name.startsWith('mixamorig:')) {
        track.name = track.name.replace(/^mixamorig:/, 'mixamorig');
      }
    }
  });
  return cloned;
}

export class CardCharacterScene {
  constructor(canvasId = 'cardCharacterCanvas', svgId = 'cardRopesSvg') {
    this.canvas = document.getElementById(canvasId);
    this.svg = document.getElementById(svgId);
    if (!this.canvas) return;
    window.__cardCharacterScene = this;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mixer = null;

    this.characterGroup = null;
    this.character = null;

    // Skeletons / Key bones
    this.headBone = null;
    this.neckBone = null;
    this.spineBone = null;
    this.spine1Bone = null;
    this.leftArmBone = null;
    this.leftForeArmBone = null;
    this.leftHandBone = null;
    this.rightArmBone = null;
    this.rightForeArmBone = null;
    this.rightHandBone = null;

    // Animation actions
    this.sitAction = null;
    this.jumpAction = null;
    this.celebrateAction = null;
    this.waveAction = null;

    // State
    this.activeIndex = 0;
    this.targetIndex = 0;
    this.pullProgress = 0;
    this.isPulling = false;
    this.isJumping = false;
    this.isCelebrating = false;
    this.isInView = false;
    this.isLoaded = false;

    // Pointer tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
    this.lastTime = performance.now();

    // Rope DOM references (multi-strand braided cables & carabiner assemblies)
    this.ropeLeftGlow = document.getElementById('ropeLeftGlow');
    this.ropeRightGlow = document.getElementById('ropeRightGlow');
    this.ropeLeftEl = document.getElementById('ropeLeft');
    this.ropeRightEl = document.getElementById('ropeRight');
    this.ropeLeftCord = document.getElementById('ropeLeftCord');
    this.ropeRightCord = document.getElementById('ropeRightCord');

    this.anchorGroupLeft = document.getElementById('anchorGroupLeft');
    this.anchorGroupRight = document.getElementById('anchorGroupRight');
    this.bracketLeft = document.getElementById('bracketLeft');
    this.bracketRight = document.getElementById('bracketRight');
    this.anchorLeftEl = document.getElementById('anchorLeft');
    this.anchorRightEl = document.getElementById('anchorRight');
    this.rivetLeft = document.getElementById('rivetLeft');
    this.rivetRight = document.getElementById('rivetRight');

    this.jumpRippleEl = document.getElementById('jumpRipple');
    this.sparksContainer = document.getElementById('ropeSparks');

    this.cardShells = [];
    this.lastSparkTime = 0;

    this.initScene();
    this.loadAssets();
    this.initVisibility();
    this.animate();
  }

  initScene() {
    const parent = this.canvas.parentElement;
    const width = parent?.clientWidth || 320;
    const height = parent?.clientHeight || 360;

    this.scene = new THREE.Scene();

    // Framing: Camera focused on character perched on the top-right corner of card
    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    this.camera.position.set(0, 1.05, 3.2);
    this.camera.lookAt(0, 0.90, 0);

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
    this.renderer.toneMappingExposure = 1.38;

    // Warm Studio 3-Point Lighting tuned to the rich coffee-gold palette
    const hemiLight = new THREE.HemisphereLight(0xfff6ec, 0x2b1e16, 2.3);
    const keyLight = new THREE.DirectionalLight(0xffeedb, 3.3);
    keyLight.position.set(2.4, 3.8, 1.8);

    const fillLight = new THREE.DirectionalLight(0xbac8e2, 1.6);
    fillLight.position.set(-2.8, 1.6, 2.2);

    // Warm champagne rim light highlighting the corner silhouette
    const rimLight = new THREE.DirectionalLight(0xd4a373, 2.9);
    rimLight.position.set(-1.6, 2.4, -2.4);

    this.scene.add(hemiLight);
    this.scene.add(keyLight);
    this.scene.add(fillLight);
    this.scene.add(rimLight);

    this.characterGroup = new THREE.Group();
    // Offset character to the right side of canvas so it perches directly on the top-right corner of the card
    this.characterGroup.position.set(0.36, -0.02, 0);
    // 3/4 turn towards card interior & cables
    this.characterGroup.rotation.y = -0.48;
    this.scene.add(this.characterGroup);

    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
  }

  onResize = () => {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : 320;
    const h = parent ? parent.clientHeight : 360;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  onPointerMove = (e) => {
    this.mouseTargetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseTargetY = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  initVisibility() {
    const section = document.getElementById('skills');
    if (!section || typeof IntersectionObserver === 'undefined') {
      this.isInView = true;
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        this.isInView = entry.isIntersecting;
        if (this.svg) {
          this.svg.style.opacity = this.isInView ? '1' : '0';
          this.svg.style.pointerEvents = 'none';
        }
      },
      { rootMargin: '120px 0px 120px 0px', threshold: 0.01 }
    );
    observer.observe(section);
  }

  async loadAssets() {
    try {
      const [sagarGltf, sitGltf, jumpGltf, thumbsGltf, waveGltf] = await Promise.all([
        loadGLTF('/models/sagar.glb'),
        loadGLTF('/models/anim/standToSit.glb'),
        loadGLTF('/models/anim/jumping.glb'),
        loadGLTF('/models/anim/thumbsUp.glb'),
        loadGLTF('/models/anim/waving.glb')
      ]);

      this.character = tuneSagarMaterials(SkeletonUtils.clone(sagarGltf.scene));
      // Sized prominently to match the marked design proportions
      this.character.scale.setScalar(124);

      // Resolve key skeletal bones
      const findBone = (name) => {
        return (
          this.character.getObjectByName(name) ||
          this.character.getObjectByName(`mixamorig:${name.replace(/^mixamorig:?/, '')}`) ||
          this.character.getObjectByName(`mixamorig${name.replace(/^mixamorig:?/, '')}`)
        );
      };

      this.headBone = findBone('mixamorigHead');
      this.neckBone = findBone('mixamorigNeck');
      this.spineBone = findBone('mixamorigSpine');
      this.spine1Bone = findBone('mixamorigSpine1');
      this.leftArmBone = findBone('mixamorigLeftArm');
      this.leftForeArmBone = findBone('mixamorigLeftForeArm');
      this.leftHandBone = findBone('mixamorigLeftHand');
      this.rightArmBone = findBone('mixamorigRightArm');
      this.rightForeArmBone = findBone('mixamorigRightForeArm');
      this.rightHandBone = findBone('mixamorigRightHand');

      this.characterGroup.add(this.character);

      // Setup Animation Mixer
      this.mixer = new THREE.AnimationMixer(this.character);

      // 1. Sitting Action (seated pose held at the end of standToSit)
      const sitClip = adaptClipTracks(sanitizeClip(sitGltf.animations[0]), this.character);
      this.sitAction = this.mixer.clipAction(sitClip);
      this.sitAction.reset().play();
      this.sitAction.paused = true;
      this.sitAction.time = Math.max(0, sitClip.duration - 0.12);
      this.sitAction.setEffectiveWeight(1);

      // 2. Jumping Action
      const jumpClip = adaptClipTracks(sanitizeClip(jumpGltf.animations[0]), this.character);
      this.jumpAction = this.mixer.clipAction(jumpClip);
      this.jumpAction.setLoop(THREE.LoopOnce, 1);
      this.jumpAction.clampWhenFinished = true;
      this.jumpAction.setEffectiveWeight(0);

      // 3. Victory Thumbs Up Action
      const thumbsClip = adaptClipTracks(sanitizeClip(thumbsGltf.animations[0]), this.character);
      this.celebrateAction = this.mixer.clipAction(thumbsClip);
      this.celebrateAction.setLoop(THREE.LoopRepeat, Infinity);
      this.celebrateAction.setEffectiveWeight(0);

      // 4. Cheerful Wave Action
      const waveClip = adaptClipTracks(sanitizeClip(waveGltf.animations[0]), this.character);
      this.waveAction = this.mixer.clipAction(waveClip);
      this.waveAction.setLoop(THREE.LoopRepeat, Infinity);
      this.waveAction.setEffectiveWeight(0);

      // Cache card shells
      this.cardShells = Array.from(document.querySelectorAll('.service-card-shell'));

      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading CardCharacterScene assets:', err);
    }
  }

  /**
   * Called on scroll to update card pull tension and incoming card ascent
   */
  setPullProgress(activeIndex, pullProgress, direction = 'down') {
    if (!this.isLoaded) return;
    this.activeIndex = activeIndex;
    this.pullProgress = Math.max(0, Math.min(1, pullProgress));
    this.isPulling = this.pullProgress > 0.05 && this.pullProgress < 0.95 && activeIndex < 3;

    // Trigger leap onto next card when arrived at stack destination
    if (this.pullProgress >= 0.94 && !this.isJumping && activeIndex < 3) {
      this.jumpToCard(activeIndex + 1, 'down');
    }
  }

  /**
   * Jump between cards
   */
  jumpToCard(targetIndex, direction = 'down') {
    if (this.isJumping || !this.isLoaded) return;
    if (targetIndex === this.activeIndex && targetIndex !== 0) return;

    this.isJumping = true;
    this.targetIndex = Math.max(0, Math.min(3, targetIndex));

    try {
      playSound('jump');
    } catch (e) { }

    // Cross-fade to jumping clip
    if (this.jumpAction) {
      this.sitAction?.setEffectiveWeight(0);
      this.celebrateAction?.setEffectiveWeight(0);
      this.jumpAction.reset();
      this.jumpAction.timeScale = 1.45;
      this.jumpAction.setEffectiveWeight(1);
      this.jumpAction.play();
    }

    // Dynamic vertical hop arc
    const hopY = direction === 'down' ? 0.38 : 0.28;
    const stage = document.getElementById('cardCharacterStage');

    gsap.to(this.characterGroup.position, {
      y: hopY,
      duration: 0.28,
      ease: 'power2.out',
      onComplete: () => {
        this.activeIndex = this.targetIndex;

        // Slide stage offset to match new card's stack offset (+14px per card)
        if (stage) {
          gsap.to(stage, {
            y: this.targetIndex * 14,
            duration: 0.32,
            ease: 'power2.out'
          });
        }

        // Descend and stick landing
        gsap.to(this.characterGroup.position, {
          y: -0.02,
          duration: 0.34,
          ease: 'bounce.out',
          onComplete: () => {
            this.isJumping = false;
            this.triggerLandingRipple();
            if (this.targetIndex >= 3) {
              this.celebrate();
            } else {
              this.sit();
            }
          }
        });
      }
    });
  }

  triggerLandingRipple() {
    if (!this.jumpRippleEl || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.78;
    const cy = rect.bottom - 12;

    this.jumpRippleEl.setAttribute('cx', cx.toFixed(1));
    this.jumpRippleEl.setAttribute('cy', cy.toFixed(1));

    gsap.killTweensOf(this.jumpRippleEl);
    gsap.fromTo(
      this.jumpRippleEl,
      { attr: { r: 6 }, opacity: 0.9, strokeWidth: 3 },
      {
        attr: { r: 52 },
        opacity: 0,
        strokeWidth: 0.5,
        duration: 0.55,
        ease: 'power2.out'
      }
    );
  }

  sit() {
    this.isCelebrating = false;
    if (!this.sitAction) return;

    this.celebrateAction?.setEffectiveWeight(0);
    this.jumpAction?.setEffectiveWeight(0);
    this.sitAction.reset();
    this.sitAction.time = Math.max(0, (this.sitAction.getClip()?.duration || 2.2) - 0.12);
    this.sitAction.paused = true;
    this.sitAction.setEffectiveWeight(1);
    this.sitAction.play();

    gsap.to(this.characterGroup.rotation, {
      y: -0.48,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  celebrate() {
    this.isCelebrating = true;
    if (!this.celebrateAction) return;

    this.sitAction?.setEffectiveWeight(0);
    this.jumpAction?.setEffectiveWeight(0);

    this.celebrateAction.reset().setEffectiveWeight(1).play();

    // Turn character slightly towards viewer for celebration
    gsap.to(this.characterGroup.rotation, {
      y: -0.15,
      duration: 0.6,
      ease: 'power2.out'
    });
  }

  /**
   * Projects 3D hand bone positions to screen client coordinates
   */
  getHandScreenPositions() {
    if (!this.leftHandBone || !this.rightHandBone || !this.camera || !this.canvas) {
      return null;
    }
    const leftWorld = new THREE.Vector3();
    const rightWorld = new THREE.Vector3();
    this.leftHandBone.getWorldPosition(leftWorld);
    this.rightHandBone.getWorldPosition(rightWorld);

    const leftNDC = leftWorld.clone().project(this.camera);
    const rightNDC = rightWorld.clone().project(this.camera);

    const rect = this.canvas.getBoundingClientRect();
    return {
      left: {
        x: rect.left + ((leftNDC.x + 1) / 2) * rect.width,
        y: rect.top + ((-leftNDC.y + 1) / 2) * rect.height
      },
      right: {
        x: rect.left + ((rightNDC.x + 1) / 2) * rect.width,
        y: rect.top + ((-rightNDC.y + 1) / 2) * rect.height
      }
    };
  }

  /**
   * Renders dynamic cubic Bézier ropes with tension, cord texture, and mechanical carabiners
   */
  updateRopes() {
    if (!this.svg || !this.ropeLeftEl || !this.ropeRightEl) return;

    const nextShell = this.cardShells[this.activeIndex + 1];
    const hideAll = () => {
      this.ropeLeftEl.setAttribute('d', '');
      this.ropeRightEl.setAttribute('d', '');
      this.ropeLeftGlow?.setAttribute('d', '');
      this.ropeRightGlow?.setAttribute('d', '');
      this.ropeLeftCord?.setAttribute('d', '');
      this.ropeRightCord?.setAttribute('d', '');
      if (this.anchorGroupLeft) this.anchorGroupLeft.style.opacity = '0';
      if (this.anchorGroupRight) this.anchorGroupRight.style.opacity = '0';
    };

    if (!this.isInView || this.activeIndex >= 3 || !nextShell || this.isJumping) {
      hideAll();
      return;
    }

    const nextCard = nextShell.querySelector('.service-column-card');
    if (!nextCard) {
      hideAll();
      return;
    }

    const cardRect = nextCard.getBoundingClientRect();
    // If incoming card is out of screen or already above, hide ropes
    if (cardRect.top > window.innerHeight + 120 || cardRect.top < 0) {
      hideAll();
      nextCard.style.transform = '';
      return;
    }

    const hands = this.getHandScreenPositions();
    if (!hands) return;

    // Anchor points on top edge of incoming card: balanced dual attachment points
    const ax1 = cardRect.left + cardRect.width * 0.28;
    const ay1 = cardRect.top + 14;
    const ax2 = cardRect.left + cardRect.width * 0.74;
    const ay2 = cardRect.top + 14;

    const hx1 = hands.left.x;
    const hy1 = hands.left.y;
    const hx2 = hands.right.x;
    const hy2 = hands.right.y;

    // Distance and tension dynamics
    const dy1 = Math.max(1, ay1 - hy1);
    const dy2 = Math.max(1, ay2 - hy2);

    // Vibration when pulling
    const tension = this.isPulling ? (1 - this.pullProgress * 0.6) : 0.2;
    const vib1 = Math.sin(performance.now() * 0.032) * tension * 3.5;
    const vib2 = Math.cos(performance.now() * 0.028) * tension * 3.5;

    // Dynamic incoming card suspension physics tilt & heave
    if (this.isPulling) {
      const tilt = Math.sin(this.pullProgress * Math.PI) * -1.5;
      const heave = Math.sin(this.pullProgress * Math.PI * 4) * 2;
      nextCard.style.transform = `rotate(${tilt.toFixed(2)}deg) translateY(${heave.toFixed(1)}px)`;
      nextCard.style.transformOrigin = '50% 12%';
    } else {
      nextCard.style.transform = '';
    }

    // Catenary sag decreases as ropes tighten
    const sag1 = Math.max(8, dy1 * 0.11 * (1 - this.pullProgress * 0.75));
    const sag2 = Math.max(8, dy2 * 0.11 * (1 - this.pullProgress * 0.75));

    // Left rope Bézier
    const cx1L = hx1 + (ax1 - hx1) * 0.28 + vib1;
    const cy1L = hy1 + dy1 * 0.38 + sag1;
    const cx2L = ax1 - (ax1 - hx1) * 0.28 - vib1 * 0.5;
    const cy2L = ay1 - dy1 * 0.22 + sag1 * 0.4;
    const pathL = `M ${hx1.toFixed(1)} ${hy1.toFixed(1)} C ${cx1L.toFixed(1)} ${cy1L.toFixed(1)}, ${cx2L.toFixed(1)} ${cy2L.toFixed(1)}, ${ax1.toFixed(1)} ${ay1.toFixed(1)}`;

    // Right rope Bézier
    const cx1R = hx2 + (ax2 - hx2) * 0.28 + vib2;
    const cy1R = hy2 + dy2 * 0.38 + sag2;
    const cx2R = ax2 - (ax2 - hx2) * 0.28 - vib2 * 0.5;
    const cy2R = ay2 - dy2 * 0.22 + sag2 * 0.4;
    const pathR = `M ${hx2.toFixed(1)} ${hy2.toFixed(1)} C ${cx1R.toFixed(1)} ${cy1R.toFixed(1)}, ${cx2R.toFixed(1)} ${cy2R.toFixed(1)}, ${ax2.toFixed(1)} ${ay2.toFixed(1)}`;

    // Set paths on all multi-strand layers
    this.ropeLeftEl.setAttribute('d', pathL);
    this.ropeRightEl.setAttribute('d', pathR);
    this.ropeLeftGlow?.setAttribute('d', pathL);
    this.ropeRightGlow?.setAttribute('d', pathR);
    this.ropeLeftCord?.setAttribute('d', pathL);
    this.ropeRightCord?.setAttribute('d', pathR);

    // Update Carabiner Assemblies on incoming card
    if (this.anchorGroupLeft) {
      this.bracketLeft?.setAttribute('x', (ax1 - 11).toFixed(1));
      this.bracketLeft?.setAttribute('y', (ay1 - 3.5).toFixed(1));
      this.anchorLeftEl?.setAttribute('cx', ax1.toFixed(1));
      this.anchorLeftEl?.setAttribute('cy', ay1.toFixed(1));
      this.rivetLeft?.setAttribute('cx', ax1.toFixed(1));
      this.rivetLeft?.setAttribute('cy', ay1.toFixed(1));
      this.anchorGroupLeft.style.opacity = '1';
    }

    if (this.anchorGroupRight) {
      this.bracketRight?.setAttribute('x', (ax2 - 11).toFixed(1));
      this.bracketRight?.setAttribute('y', (ay2 - 3.5).toFixed(1));
      this.anchorRightEl?.setAttribute('cx', ax2.toFixed(1));
      this.anchorRightEl?.setAttribute('cy', ay2.toFixed(1));
      this.rivetRight?.setAttribute('cx', ax2.toFixed(1));
      this.rivetRight?.setAttribute('cy', ay2.toFixed(1));
      this.anchorGroupRight.style.opacity = '1';
    }

    // Dynamic tension spark emission
    if (this.isPulling && performance.now() - this.lastSparkTime > 280) {
      this.lastSparkTime = performance.now();
      this.emitSpark(ax1, ay1);
      this.emitSpark(ax2, ay2);
    }
  }

  emitSpark(x, y) {
    if (!this.sparksContainer) return;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'rope-spark');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '2.5');
    this.sparksContainer.appendChild(circle);

    const destX = x + (Math.random() - 0.5) * 24;
    const destY = y - 15 - Math.random() * 20;

    gsap.to(circle, {
      attr: { cx: destX, cy: destY, r: 0.5 },
      opacity: 0,
      duration: 0.45,
      ease: 'power2.out',
      onComplete: () => circle.remove()
    });
  }

  animate = (now = performance.now()) => {
    requestAnimationFrame(this.animate);
    const delta = Math.min((now - (this.lastTime || now)) * 0.001, 0.08);
    this.lastTime = now;

    if (!this.isInView) return;

    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Pointer lerping
    this.mouseX = THREE.MathUtils.lerp(this.mouseX, this.mouseTargetX, 0.08);
    this.mouseY = THREE.MathUtils.lerp(this.mouseY, this.mouseTargetY, 0.08);

    // Head bone tracking (looks at mouse or down towards pulled card)
    if (this.headBone) {
      if (this.isPulling) {
        // Look down towards the incoming card
        this.headBone.rotation.x = THREE.MathUtils.lerp(this.headBone.rotation.x, 0.22, 0.1);
        this.headBone.rotation.y = THREE.MathUtils.lerp(this.headBone.rotation.y, -0.15 + this.mouseX * 0.15, 0.08);
      } else {
        this.headBone.rotation.y = THREE.MathUtils.lerp(this.headBone.rotation.y, this.mouseX * 0.35, 0.08);
        this.headBone.rotation.x = THREE.MathUtils.lerp(this.headBone.rotation.x, -this.mouseY * 0.25 - 0.05, 0.08);
      }
    }

    // Procedural pulling motion: leaning back and hauling arms
    if (this.isPulling && !this.isJumping) {
      const pullCycle = Math.sin(this.pullProgress * Math.PI * 4);
      if (this.spineBone) {
        this.spineBone.rotation.x = THREE.MathUtils.lerp(this.spineBone.rotation.x, -0.16 + pullCycle * 0.14, 0.12);
      }
      if (this.leftArmBone && this.rightArmBone) {
        this.leftArmBone.rotation.x = THREE.MathUtils.lerp(this.leftArmBone.rotation.x, -0.42 + pullCycle * 0.25, 0.12);
        this.rightArmBone.rotation.x = THREE.MathUtils.lerp(this.rightArmBone.rotation.x, -0.42 + pullCycle * 0.25, 0.12);
      }
      if (this.leftForeArmBone && this.rightForeArmBone) {
        this.leftForeArmBone.rotation.x = THREE.MathUtils.lerp(this.leftForeArmBone.rotation.x, 0.52 - pullCycle * 0.2, 0.12);
        this.rightForeArmBone.rotation.x = THREE.MathUtils.lerp(this.rightForeArmBone.rotation.x, 0.52 - pullCycle * 0.2, 0.12);
      }
    } else if (!this.isJumping && !this.isCelebrating) {
      // Idle seated relaxation
      if (this.spineBone) {
        this.spineBone.rotation.x = THREE.MathUtils.lerp(this.spineBone.rotation.x, 0, 0.08);
      }
    }

    // Update dynamic ropes overlay
    this.updateRopes();

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
