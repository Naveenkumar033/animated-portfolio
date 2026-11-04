// Shop cards, filters and product-shot slots.
import { thumbs } from '../../app/state.js';
import { PRODUCTS } from '../../data/products.js';
import { STORY } from '../../data/product-story.js';
import { ScrollTrigger, gsap, hasGsap } from '../../lib/gsap.js';
import { $, $$ } from '../../utils/dom.js';
import { inr } from '../../utils/format.js';

function thumbImg(p, cls = ''){ return thumbs[p.id] ? `<img class="${cls}" src="${thumbs[p.id]}" width="960" height="960" alt="${p.name}, ${p.size}" loading="lazy">` : `<div class="ph" aria-hidden="true"></div>`; }

function buildGrid(){
  $('#grid').innerHTML = PRODUCTS.map((p, i) => `
    <article class="pc" data-cat="${p.cat}" style="--c:${STORY[i].c}">
      <div class="pc-media">${thumbImg(p)}<span class="pc-tag">${p.tag}</span><button class="pc-view" type="button" data-design="${p.id}">View design <i aria-hidden="true">↗</i></button></div>
      <div class="pc-body">
        <p class="pc-no">${p.no} / 05</p>
        <h3>${p.name}</h3>
        <p class="pc-d">${p.desc}</p>
        <ul class="pc-ing">${p.ing.map(x => `<li>${x}</li>`).join('')}</ul>
        <div class="pc-foot"><span class="pc-price">${inr(p.price)}<small>${p.size}</small></span><button class="add pill" data-id="${p.id}"><i aria-hidden="true">+</i>Add to bag</button></div>
      </div>
    </article>`).join('');
}

function buildFilters(){
  $$('#filters button').forEach(b => b.addEventListener('click', () => {
    $$('#filters button').forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    $$('.pc').forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.cat !== f));
    if (hasGsap) gsap.fromTo('.pc:not(.hide)', { opacity:0 }, { opacity:1, stagger:.06, duration:.5, ease:'power2.out' });
    if (ScrollTrigger) ScrollTrigger.refresh();
  }));
}

function fillShots(){ $$('[data-shot]').forEach(el => { const p = PRODUCTS.find(x => x.id === el.dataset.shot); if (p) el.innerHTML = thumbImg(p); }); }

export { thumbImg, buildGrid, buildFilters, fillShots };
