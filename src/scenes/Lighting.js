import * as THREE from 'three';

export class SceneLighting {
  constructor() {
    this.dayHemi = new THREE.Color(0xe4ecfa);
    this.dayKey = new THREE.Color(0xe2eafa);
    this.dayFill = new THREE.Color(0xa9bbdc);
    this.dayRim = new THREE.Color(0xcfe0ff);

    this.sunsetHemi = new THREE.Color(0xfed7aa);
    this.sunsetKey = new THREE.Color(0xfb923c);
    this.sunsetFill = new THREE.Color(0xf472b6);
    this.sunsetRim = new THREE.Color(0xfde047);

    // Neon Emerald Night lighting matching reference
    this.nightHemi = new THREE.Color(0x064e3b);
    this.nightKey = new THREE.Color(0x34d399);
    this.nightFill = new THREE.Color(0x0f766e);
    this.nightRim = new THREE.Color(0x10b981);

    this.lights = [];
  }

  register(hemi, key, fill, rim) {
    this.lights.push({ hemi, key, fill, rim });
  }

  update(timeProgress) {
    let curHemi, curKey, curFill, curRim;

    if (timeProgress < 0.55) {
      const f = timeProgress / 0.55;
      curHemi = this.dayHemi.clone().lerp(this.sunsetHemi, f);
      curKey = this.dayKey.clone().lerp(this.sunsetKey, f);
      curFill = this.dayFill.clone().lerp(this.sunsetFill, f);
      curRim = this.dayRim.clone().lerp(this.sunsetRim, f);
    } else {
      const f = (timeProgress - 0.55) / 0.45;
      curHemi = this.sunsetHemi.clone().lerp(this.nightHemi, f);
      curKey = this.sunsetKey.clone().lerp(this.nightKey, f);
      curFill = this.sunsetFill.clone().lerp(this.nightFill, f);
      curRim = this.sunsetRim.clone().lerp(this.nightRim, f);
    }

    for (const group of this.lights) {
      if (group.hemi) group.hemi.color.copy(curHemi);
      if (group.key) group.key.color.copy(curKey);
      if (group.fill) group.fill.color.copy(curFill);
      if (group.rim) group.rim.color.copy(curRim);
    }
  }
}

export const globalLighting = new SceneLighting();

