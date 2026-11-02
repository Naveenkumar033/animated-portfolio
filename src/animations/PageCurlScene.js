import * as THREE from 'three';

/**
 * High-Fidelity 3D Page Curl WebGL Shader
 * Replicated with exact mathematical parameters from codeofsagar.in (chunk 026y-9bl64i7t.js)
 * 
 * Simulates a realistic cylindrical paper roll peeling diagonally across the screen:
 * - Radius R = 0.12 of viewport
 * - Crease sweeping from bottom-right towards top-left
 * - Turned-over paper sheet flap with realistic paper back
 * - Specular paper sheen on crown of roll
 * - Diffuse illumination on underside
 * - Soft exponential ambient occlusion / drop shadow cast along the crease line
 */
export class PageCurlScene {
  constructor(canvasId = 'pageCurlCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.curlValue = 0.0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initScene();
    this.initEvents();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

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
      uniform float uCurl;
      uniform vec2 iResolution;

      bool onSheet(vec2 q, float aspect) {
        return q.x >= 0.0 && q.x <= aspect && q.y >= 0.0 && q.y <= 1.0;
      }

      void main() {
        if (uCurl <= 0.0001 || uCurl >= 0.9999) {
          gl_FragColor = vec4(0.0);
          return;
        }

        float aspect = iResolution.x / iResolution.y;
        const float R = 0.12;
        const float END = 0.42;
        const float HALF_TURN = 3.14159265359;

        // Position in aspect-corrected coordinates (x: 0..aspect, y: 0..1)
        vec2 p = vec2(vUv.x * aspect, vUv.y);
        vec2 dir = normalize(vec2(aspect, -1.0));

        float sMin = dot(vec2(0.0, 1.0), dir);
        float sMax = dot(vec2(aspect, 0.0), dir);

        float axis = mix(sMax, sMin - END, uCurl);
        float d = dot(p, dir) - axis;

        float back = -1.0;

        if (d <= 0.0) {
          // The sheet, rolled over and lying back across the page face down
          vec2 q = p + dir * (HALF_TURN * R - 2.0 * d);
          if (onSheet(q, aspect)) {
            // Brightest where it comes off the crown of the roll,
            // settling a little darker as it lies flat
            back = 0.84 + 0.16 * exp(d / (2.0 * R));
          }
        } else if (d < R) {
          float a = asin(d / R);
          // The top of the roll: the back of the sheet, lit from above,
          // brightest along the crown and falling off to the silhouette
          vec2 top = p + dir * (R * (HALF_TURN - a) - d);
          if (onSheet(top, aspect)) {
            back = 0.52 + 0.48 * cos(a) + 0.10 * exp(-pow((a - 0.45) * 3.5, 2.0));
          } else {
            // The underside: the front of the sheet bending up into the roll
            vec2 under = p + dir * (R * a - d);
            if (onSheet(under, aspect)) {
              float frontShade = 0.35 + 0.65 * cos(a);
              vec3 underColor = vec3(0.92, 0.91, 0.90) * frontShade;
              gl_FragColor = vec4(underColor, 0.98);
              return;
            } else {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 0.35);
              return;
            }
          }
        } else {
          // Uncovered, in the roll's shadow
          float shadowDist = d - R;
          float shadow = 0.35 * exp(-shadowDist / 0.055);
          if (shadow > 0.008) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, shadow);
            return;
          }
          gl_FragColor = vec4(0.0);
          return;
        }

        if (back >= 0.0) {
          // The BACK of the sheet: realistic light paper with soft lighting
          vec3 paper = vec3(0.965, 0.96, 0.955) * back;
          gl_FragColor = vec4(paper, 1.0);
          return;
        }

        gl_FragColor = vec4(0.0);
      }
    `;

    this.uniforms = {
      uCurl: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(this.width, this.height) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }

  setCurl(val) {
    this.curlValue = Math.max(0, Math.min(1, val));
    if (this.canvas) {
      const isVisible = (this.curlValue > 0.001 && this.curlValue < 0.999);
      this.canvas.style.display = isVisible ? 'block' : 'none';
      this.canvas.style.visibility = isVisible ? 'visible' : 'hidden';
    }
    if (this.uniforms) {
      this.uniforms.uCurl.value = this.curlValue;
    }
    this.render();
  }

  /**
   * Calculates the exact SVG / CSS convex polygon clip-path matching the curl crease axis.
   * Cuts away the bottom-right corner as it curls toward top-left, keeping the
   * unpeeled sheet intact until fully turned.
   */
  getClipPolygon(curl) {
    if (curl <= 0.001) return '';
    if (curl >= 0.999) return 'polygon(0 0, 0 0, 0 0)';

    const w = this.width;
    const h = this.height;
    const aspect = w / h;
    const r_hypot = Math.hypot(aspect, 1);
    const dir = [aspect / r_hypot, -1 / r_hypot];
    const sMin = dir[1];
    const sMax = aspect * dir[0];
    const crease = sMax + (sMin - 0.42 - sMax) * curl;

    // Half-plane function keeping points on the unpeeled top-left side
    const n_fn = (pt) => crease - (pt[0] * dir[0] + pt[1] * dir[1]);
    const rect = [[0, 0], [aspect, 0], [aspect, 1], [0, 1]];
    const poly = [];

    for (let i = 0; i < 4; i++) {
      const p1 = rect[i];
      const p2 = rect[(i + 1) % 4];
      const d1 = n_fn(p1);
      const d2 = n_fn(p2);

      if (d1 >= 0) poly.push(p1);
      if ((d1 >= 0) !== (d2 >= 0)) {
        const frac = d1 / (d1 - d2);
        poly.push([p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac]);
      }
    }

    if (poly.length < 3) return 'polygon(0 0, 0 0, 0 0)';

    const cssPoints = poly.map(([x, y]) => {
      const px = Math.round((x * h) * 10) / 10;
      const py = Math.round(((1 - y) * h) * 10) / 10;
      return `${px}px ${py}px`;
    });

    return `polygon(${cssPoints.join(', ')})`;
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.renderer.setSize(this.width, this.height);
      this.uniforms.iResolution.value.set(this.width, this.height);
      this.render();
    });
  }
}
