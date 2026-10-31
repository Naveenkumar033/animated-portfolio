import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { loadGLTF, tuneSagarMaterials, keptInPlace } from '../utils/assetLoader.js';
import { globalLighting } from './Lighting.js';

export class FooterCharacterScene {
  constructor(canvasId = 'footerCharacterCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mixer = null;

    this.group = null;
    this.character = null;
    this.headBone = null;

    this.mouseX = 0;
    this.mouseY = 0;

    this.initScene();
    this.loadAssets();
    this.animate();
  }

  initScene() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 480;
    const height = rect.height || 600;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50);
    const camDist = 1.125 / Math.tan((15 * Math.PI) / 180);
    this.camera.position.set(0, 1.105, camDist);
    this.camera.lookAt(0, 1.105, 0);

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

    this.group = new THREE.Group();
    this.group.rotation.y = -0.35;
    this.scene.add(this.group);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  onResize = () => {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const w = this.canvas.parentElement.clientWidth;
    const h = this.canvas.parentElement.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  async loadAssets() {
    try {
      const [sagarGltf, wavingGltf, thumbsGltf, stretchGltf] = await Promise.all([
        loadGLTF('/models/sagar.glb'),
        loadGLTF('/models/anim/waving.glb'),
        loadGLTF('/models/anim/thumbsUp.glb'),
        loadGLTF('/models/anim/armStretch.glb')
      ]);

      this.character = tuneSagarMaterials(SkeletonUtils.clone(sagarGltf.scene));
      this.headBone = this.character.getObjectByName('mixamorigHead') || this.character.getObjectByName('mixamorig:Head');
      this.character.scale.setScalar(100);
      this.group.add(this.character);

      this.mixer = new THREE.AnimationMixer(this.character);

      const clips = [
        keptInPlace(wavingGltf.animations[0], 'waving'),
        keptInPlace(thumbsGltf.animations[0], 'thumbsUp'),
        keptInPlace(stretchGltf.animations[0], 'stretch')
      ];

      const actions = clips.map((c) => {
        const act = this.mixer.clipAction(c);
        act.setLoop(THREE.LoopOnce, 1);
        act.clampWhenFinished = true;
        return act;
      });

      let currentIdx = 0;
      actions[0].play();

      this.mixer.addEventListener('finished', () => {
        const prev = actions[currentIdx];
        currentIdx = (currentIdx + 1) % actions.length;
        const next = actions[currentIdx];
        next.reset().setEffectiveWeight(1).play();
        next.crossFadeFrom(prev, 0.5, true);
      });
    } catch (err) {
      console.error('Error loading FooterCharacter assets:', err);
    }
  }

  animate = (now = performance.now()) => {
    requestAnimationFrame(this.animate);
    const delta = Math.min((now - (this.lastTime || now)) * 0.001, 0.1);
    this.lastTime = now;

    if (this.mixer) {
      this.mixer.update(delta);
    }

    if (this.group) {
      this.group.rotation.y += (-0.35 + 0.22 * this.mouseX - this.group.rotation.y) * 0.08;
    }

    if (this.headBone) {
      this.headBone.rotation.y = THREE.MathUtils.lerp(this.headBone.rotation.y, this.mouseX * 0.35, 0.08);
      this.headBone.rotation.x = THREE.MathUtils.lerp(this.headBone.rotation.x, -this.mouseY * 0.25, 0.08);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}

