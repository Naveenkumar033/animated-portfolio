// Canvas drawings used as textures.
function radialCanvas(inner, outer = 'rgba(0,0,0,0)', size = 128){
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const gr = g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2); gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0,0,size,size); return c;
}

export { radialCanvas };
