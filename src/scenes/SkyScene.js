import * as THREE from 'three';
import { globalLighting } from './Lighting.js';
import { playSound } from '../utils/audio.js';

export class SkyScene {
  constructor(canvasId = 'heroSkyCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.timeProgress = 0.0;
    this.targetTime = 0.0;
    this.isRushing = false;
    this.userPauseUntil = 0;
    this.isDragging = false;

    this.initScene();
    this.initControls();
    this.animate();
  }

  initScene() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uSkyTime; // 0.0 = Morning, 0.30 = Warm Day, 0.60 = Sunset, 0.90-1.0 = Night
      uniform vec2 iResolution;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = rot * p * 2.05;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        float aspect = iResolution.x / iResolution.y;
        vec2 st = vec2(uv.x * aspect, uv.y);

        // --- 1. Distinct Climate & Atmosphere Modes ---
        // Mode 1: Morning (t ~ 0.0) - Crisp Blue Sky with clouds matching codeofsagar.in
        vec3 morningTop = vec3(0.33, 0.52, 0.74);
        vec3 morningBottom = vec3(0.78, 0.85, 0.92);
        vec3 morningSky = mix(morningBottom, morningTop, pow(uv.y, 0.75));

        // Mode 2: Day Warm Climate (t ~ 0.30) - Warm sun-drenched atmosphere
        vec3 dayTop = vec3(0.42, 0.62, 0.82);
        vec3 dayBottom = vec3(0.92, 0.88, 0.80);
        vec3 daySky = mix(dayBottom, dayTop, pow(uv.y, 0.8));

        // Mode 3: Sunset (t ~ 0.60) - Dramatic warm coral & fiery dusk
        vec3 sunsetTop = vec3(0.85, 0.38, 0.20);
        vec3 sunsetMid = vec3(0.96, 0.58, 0.38);
        vec3 sunsetBottom = vec3(0.98, 0.82, 0.64);
        vec3 sunsetSky = mix(sunsetBottom, mix(sunsetMid, sunsetTop, smoothstep(0.18, 0.82, uv.y)), uv.y);

        // Mode 4: Night (t ~ 0.90 - 1.0) - Deep Cosmic Obsidian Night with Neon Green Aurora Sky
        vec3 nightTop = vec3(0.008, 0.018, 0.04);
        vec3 nightBottom = vec3(0.004, 0.008, 0.015);
        vec3 nightSky = mix(nightBottom, nightTop, uv.y);

        // Multi-phase smooth interpolation across Morning -> Warm Day -> Sunset -> Night
        vec3 skyColor;
        if (uSkyTime < 0.30) {
          float f = uSkyTime / 0.30;
          skyColor = mix(morningSky, daySky, smoothstep(0.0, 1.0, f));
        } else if (uSkyTime < 0.65) {
          float f = (uSkyTime - 0.30) / 0.35;
          skyColor = mix(daySky, sunsetSky, smoothstep(0.0, 1.0, f));
        } else {
          float f = (uSkyTime - 0.65) / 0.35;
          skyColor = mix(sunsetSky, nightSky, smoothstep(0.0, 1.0, f));
        }

        // --- 2. Natural Twinkling Stars ---
        float nightFactor = smoothstep(0.65, 0.92, uSkyTime);
        if (nightFactor > 0.01) {
          vec2 starGrid = st * 55.0;
          vec2 starCell = floor(starGrid);
          vec2 starFrac = fract(starGrid) - 0.5;
          vec2 starJitter = vec2(hash(starCell * 1.3), hash(starCell * 2.7 + 7.1)) - 0.5;
          float starRand = hash(starCell * 5.1 + 19.3);
          if (starRand > 0.925) {
            float dist = length(starFrac - starJitter * 0.7);
            float starGlow = smoothstep(0.08, 0.01, dist);
            float twinkle = sin(uTime * 3.8 + starRand * 6.28) * 0.4 + 0.6;
            skyColor += vec3(0.95, 0.98, 1.0) * starGlow * twinkle * nightFactor * 1.6;
          }
        }

        // --- 3. Neon Green Aurora Borealis ---
        float aurIntensity = 0.0;
        if (nightFactor > 0.01) {
          vec2 aurUv = vec2(st.x * 0.85 + sin(uTime * 0.15 + st.y * 2.0) * 0.35, st.y * 1.4);
          float aurWave1 = sin(aurUv.x * 3.2 + uTime * 0.4) * 0.18;
          float aurWave2 = cos(aurUv.x * 5.1 - uTime * 0.3) * 0.12;
          float aurHeight = 0.58 + aurWave1 + aurWave2;
          float aurDist = abs(uv.y - aurHeight);
          aurIntensity = exp(-aurDist * 7.5) * smoothstep(0.2, 0.9, uv.y);

          vec3 neonGreen = vec3(0.08, 0.98, 0.55);
          vec3 neonCyan = vec3(0.02, 0.82, 0.68);
          vec3 auroraColor = mix(neonGreen, neonCyan, sin(st.x * 2.0 + uTime * 0.25) * 0.5 + 0.5);

          skyColor += auroraColor * aurIntensity * nightFactor * 2.6;
        }

        // --- 4. Volumetric Procedural Cumulus Clouds ---
        vec2 cloudSt = vec2(st.x * 0.75 + uTime * 0.014, st.y * 1.15);
        float cDensity = fbm(cloudSt * 1.8);
        float cDetail = fbm(cloudSt * 4.2 + vec2(uTime * 0.006, 0.0));
        float cTotal = cDensity + cDetail * 0.28;

        float cloudCoverage = 0.44;
        float cloudMask = smoothstep(cloudCoverage, cloudCoverage + 0.26, cTotal);
        cloudMask *= smoothstep(0.06, 0.38, uv.y);

        // Cloud lighting
        vec2 lightDir = normalize(vec2(0.55, 0.85));
        float cNorm = fbm((cloudSt + lightDir * 0.04) * 1.8);
        float cDiff = clamp((cDensity - cNorm) * 4.0 + 0.55, 0.25, 1.0);

        // Morning
        vec3 mCloudLit = vec3(1.0, 1.0, 1.0);
        vec3 mCloudShadow = vec3(0.68, 0.76, 0.86);
        vec3 mCloudCol = mix(mCloudShadow, mCloudLit, cDiff);

        // Day
        vec3 dCloudLit = vec3(1.0, 0.98, 0.92);
        vec3 dCloudShadow = vec3(0.74, 0.76, 0.82);
        vec3 dCloudCol = mix(dCloudShadow, dCloudLit, cDiff);

        // Sunset
        vec3 sCloudLit = vec3(1.0, 0.84, 0.62);
        vec3 sCloudShadow = vec3(0.62, 0.34, 0.38);
        vec3 sCloudCol = mix(sCloudShadow, sCloudLit, cDiff * 1.2);

        // Night
        vec3 nCloudLit = mix(vec3(0.04, 0.08, 0.15), vec3(0.08, 0.96, 0.55), aurIntensity * 0.90);
        vec3 nCloudShadow = vec3(0.004, 0.010, 0.025);
        vec3 nCloudCol = mix(nCloudShadow, nCloudLit, cDiff);

        vec3 cloudFinalCol;
        if (uSkyTime < 0.30) {
          float f = uSkyTime / 0.30;
          cloudFinalCol = mix(mCloudCol, dCloudCol, smoothstep(0.0, 1.0, f));
        } else if (uSkyTime < 0.65) {
          float f = (uSkyTime - 0.30) / 0.35;
          cloudFinalCol = mix(dCloudCol, sCloudCol, smoothstep(0.0, 1.0, f));
        } else {
          float f = (uSkyTime - 0.65) / 0.35;
          cloudFinalCol = mix(sCloudCol, nCloudCol, smoothstep(0.0, 1.0, f));
        }

        vec3 finalCol = mix(skyColor, cloudFinalCol, clamp(cloudMask * 0.92, 0.0, 1.0));
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `;

    this.uniforms = {
      uTime: { value: 0 },
      uSkyTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(w, h) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      depthWrite: false,
      depthTest: false
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    this.scene.add(quad);

    window.addEventListener('resize', () => {
      const rw = window.innerWidth;
      const rh = window.innerHeight;
      this.renderer.setSize(rw, rh);
      this.uniforms.iResolution.value.set(rw, rh);
    });
  }

  initControls() {
    this.buttons = document.querySelectorAll('.sky-dial-btn');
    this.slider = document.getElementById('skyDialSlider');
    this.dotWrap = document.getElementById('skyDialDotWrap');

    this.buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-time');
        this.setMode(mode);
      });
    });

    if (this.slider) {
      const handleScrub = (e) => {
        const rect = this.slider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        this.timeProgress = frac;
        this.targetTime = frac;
        this.isRushing = false;
        this.userPauseUntil = performance.now() + 12000;
      };

      this.slider.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        handleScrub(e);
        const onMove = (ev) => handleScrub(ev);
        const onUp = () => {
          this.isDragging = false;
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });
    }
  }

  setMode(mode) {
    playSound('click');
    let targetVal = 0.0;
    if (mode === 'day') targetVal = 0.0;
    else if (mode === 'sunset') targetVal = 0.55;
    else if (mode === 'night') targetVal = 0.88;

    this.targetTime = targetVal;
    this.isRushing = true;
    this.userPauseUntil = performance.now() + 15000;

    document.documentElement.setAttribute('data-theme', mode);
    this.buttons.forEach((btn) => {
      const isActive = btn.getAttribute('data-time') === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  updateClock(delta = 0.016) {
    const now = performance.now();
    if (this.isRushing) {
      this.timeProgress = THREE.MathUtils.lerp(this.timeProgress, this.targetTime, 0.08);
      if (Math.abs(this.timeProgress - this.targetTime) < 0.002) {
        this.timeProgress = this.targetTime;
        this.isRushing = false;
      }
    } else if (!this.isDragging && now > this.userPauseUntil) {
      this.timeProgress = (this.timeProgress + delta * 0.011) % 1.0;
    }

    if (this.uniforms) {
      this.uniforms.uSkyTime.value = this.timeProgress;
    }

    if (this.dotWrap && this.slider) {
      const sliderWidth = this.slider.clientWidth || 72;
      this.dotWrap.style.transform = `translateX(${this.timeProgress * sliderWidth}px)`;
    }

    if (!this.isRushing) {
      let currentMode = 'day';
      if (this.timeProgress > 0.35 && this.timeProgress <= 0.72) {
        currentMode = 'sunset';
      } else if (this.timeProgress > 0.72) {
        currentMode = 'night';
      }

      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme !== currentMode) {
        document.documentElement.setAttribute('data-theme', currentMode);
        this.buttons.forEach((btn) => {
          const isActive = btn.getAttribute('data-time') === currentMode;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
      }
    }

    globalLighting.update(this.timeProgress);
  }

  animate = (now = performance.now()) => {
    requestAnimationFrame(this.animate);
    const timeSec = now * 0.001;
    this.updateClock(0.016);
    if (this.uniforms) this.uniforms.uTime.value = timeSec;
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
