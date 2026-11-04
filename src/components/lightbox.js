// Full-screen viewer for the product design boards. Any element with data-design="<product id>" opens it.
import { DESIGNS } from '../features/products/product-images.js';
import { PRODUCTS } from '../data/products.js';
import { state } from '../app/state.js';
import { $ } from '../utils/dom.js';

function initLightbox(){
  const box = document.createElement('div');
  box.className = 'lb'; box.id = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Product design'); box.hidden = true;
  box.innerHTML = `<div class="lb-scrim" data-close></div><figure class="lb-fig"><img alt=""><figcaption><span class="lb-name"></span><button class="lb-x" type="button" data-close>Close <i aria-hidden="true">×</i></button></figcaption></figure>`;
  document.body.appendChild(box);
  const img = $('img', box), name = $('.lb-name', box); let lastFocus = null;
  const open = id => {
    const p = PRODUCTS.find(x => x.id === id); if (!p || !DESIGNS[id]) return;
    img.src = DESIGNS[id]; img.alt = `${p.name} packaging design`; name.textContent = `${p.no} · ${p.name}`;
    lastFocus = document.activeElement; box.hidden = false; requestAnimationFrame(() => box.classList.add('open'));
    if (state.lenis) state.lenis.stop(); $('.lb-x', box).focus();
  };
  const close = () => { if (box.hidden) return; box.classList.remove('open'); setTimeout(() => { box.hidden = true; }, 350); if (state.lenis) state.lenis.start(); if (lastFocus) lastFocus.focus(); };
  document.addEventListener('click', e => { const t = e.target.closest('[data-design]'); if (t){ e.preventDefault(); open(t.dataset.design); } else if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

export { initLightbox };
