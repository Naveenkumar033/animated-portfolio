// Reflection environments for the 3D scenes.
import * as THREE from 'three';

function envCube(){
  const face = (top, bot, spot) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0,0,0,128); gr.addColorStop(0, top); gr.addColorStop(.55, '#55603f'); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0,0,128,128);
    if (spot){ const r = g.createRadialGradient(spot[0],spot[1],0,spot[0],spot[1],spot[2]); r.addColorStop(0,'rgba(255,248,225,1)'); r.addColorStop(1,'rgba(255,248,225,0)'); g.fillStyle = r; g.fillRect(0,0,128,128); }
    return c; };
  const flat = col => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = col; g.fillRect(0,0,128,128); return c; };
  const cube = new THREE.CubeTexture([ face('#e8e2c4','#16211a',[40,30,46]), face('#c9cfae','#16211a',[90,40,30]), flat('#f4ecd0'), flat('#0f170f'), face('#dcd8b8','#16211a',[70,36,40]), face('#9aa585','#141d15') ]);
  cube.encoding = THREE.sRGBEncoding; cube.needsUpdate = true; return cube;
}


export { envCube };
