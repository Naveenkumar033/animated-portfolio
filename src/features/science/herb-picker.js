// Botanical chips and details in the Science section.
import { state } from '../../app/state.js';
import { HERBS } from '../../data/herbs.js';
import { PRODUCTS } from '../../data/products.js';
import { gsap, hasGsap } from '../../lib/gsap.js';
import { $, $$ } from '../../utils/dom.js';

function buildHerbs(){
  $('#herbs').innerHTML = HERBS.map((h, i) => `<button data-i="${i}" class="${i === 0 ? 'on' : ''}">${h.n}</button>`).join('');
  $$('#herbs button').forEach(b => b.addEventListener('click', () => selectHerb(+b.dataset.i)));
  selectHerb(0, true);
}

function selectHerb(i, first){
  const h = HERBS[i], found = h.p == null ? 'R&D botanical library' : PRODUCTS[h.p].name;
  $$('#herbs button').forEach((b, k) => b.classList.toggle('on', k === i));
  $('#molName').textContent = h.cmp;
  $('#herbInfo').innerHTML = `<h3>${h.n}</h3><p class="latin">${h.latin}</p><p>${h.txt}</p>
    <div class="herb-facts"><div><small>Part used</small><b>${h.part}</b></div><div><small>Key compound</small><b>${h.cmp}</b></div><div><small>Found in</small><b>${found}</b></div></div>`;
  if (!first && hasGsap) gsap.from('#herbInfo > *', { y:16, opacity:0, stagger:.05, duration:.5, ease:'power3.out' });
  if (state.mol) state.mol.show(h);
}

export { buildHerbs };
