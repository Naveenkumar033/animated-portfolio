// Hero product: the real TranzLife gummies jar, cut out of the client's design, standing on the hill.
import { PRODUCTS } from '../../data/products.js';
import { CUTS } from '../products/product-images.js';
import { $ } from '../../utils/dom.js';

function initHeroJar(){
  const box = $('#heroProd'), stage = $('#home'); if (!box || !stage) return null;
  const p = PRODUCTS[0];
  box.innerHTML = `<img src="${CUTS[p.id]}" alt="${p.name}" decoding="async">`;
  const img = box.firstChild;
  function layout(){
    const W = stage.clientWidth, H = stage.clientHeight, mobile = W < 760, sp = $('.stage-space');
    const cx = mobile ? W*.5 : W*.37, cy = mobile && sp ? sp.offsetTop + sp.offsetHeight*.48 : H*.64;
    const h = mobile && sp ? Math.min(sp.offsetHeight*.62, H*.4, W*.62/(img.naturalWidth/img.naturalHeight || .5)) : H*.46;
    const y = mobile ? Math.min(cy, H - h/2 - 36) : cy;
    img.style.height = h.toFixed(1) + 'px'; img.style.left = cx.toFixed(1) + 'px'; img.style.top = y.toFixed(1) + 'px';
  }
  img.addEventListener('load', layout); window.addEventListener('resize', layout); layout();
  return { start(){ box.classList.add('in'); } };
}

export { initHeroJar };
