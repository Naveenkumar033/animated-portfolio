// Ritual finder: pick a need, see the matching product.
import { NEEDS } from '../../data/needs.js';
import { PRODUCTS } from '../../data/products.js';
import { STORY } from '../../data/rituals.js';
import { thumbImg } from '../products/product-grid.js';
import { gsap, hasGsap } from '../../lib/gsap.js';
import { $, $$ } from '../../utils/dom.js';
import { inr } from '../../utils/format.js';

function buildNeeds(){
  $('#needs').innerHTML = NEEDS.map((n, i) => `<button data-i="${i}" class="${i === 1 ? 'on' : ''}">${n.t}<small>${PRODUCTS[n.p].no}</small></button>`).join('');
  $$('#needs button').forEach(b => b.addEventListener('click', () => selectNeed(+b.dataset.i)));
  selectNeed(1, true);
}

function selectNeed(i, first){
  const n = NEEDS[i], p = PRODUCTS[n.p];
  $$('#needs button').forEach((b, k) => b.classList.toggle('on', k === i));
  const m = $('#match'); m.style.setProperty('--c', STORY[n.p].c);
  m.innerHTML = `<div class="m-img">${thumbImg(p)}</div><div class="m-body"><p class="k">Your match · ${p.no}</p><h3>${p.name}</h3><p class="why">${n.why}</p>
    <div class="row"><span class="price">${inr(p.price)}</span><button class="add pill" data-id="${p.id}"><i aria-hidden="true">+</i>Add to bag</button></div></div>`;
  if (!first && hasGsap) gsap.from('#match > *', { opacity:0, x:-14, stagger:.08, duration:.5, ease:'power3.out' });
}

export { buildNeeds, selectNeed };
