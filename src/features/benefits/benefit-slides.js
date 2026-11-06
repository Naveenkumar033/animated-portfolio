// Benefits panel: shows one product at a time. The page scrolls past normally; the product only changes when you
// pick one (the dots on the photo, or a tap on the photo for the next one). The change slides with a motion blur,
// and the table swaps to that product's benefits.
import { PRODUCTS } from '../../data/products.js';
import { BENEFITS } from '../../data/benefits.js';
import { thumbs } from '../../app/state.js';
import { $, $$ } from '../../utils/dom.js';
import { clamp } from '../../utils/math.js';
import { reduce } from '../../utils/media.js';

function initBenefits(){
  const slides = $('#benSlides'), sets = $('#benSets'), dots = $('#benDots');
  if (!slides || !sets) return null;
  const N = PRODUCTS.length;
  slides.innerHTML = PRODUCTS.map(p => `<figure class="bs"><img src="${thumbs[p.id]}" alt="${p.name}" width="960" height="960" loading="lazy" decoding="async">
      <figcaption class="bs-cap"><span>${p.no} / ${String(N).padStart(2, '0')}</span>${p.name}</figcaption></figure>`).join('');
  sets.innerHTML = PRODUCTS.map(p => `<div class="tbl-set" aria-label="${p.name}">${(BENEFITS[p.id] || []).map(b =>
      `<div class="tr"><span class="td">${b}</span><span class="td"><span class="ok" aria-label="Yes">✓</span></span><span class="td"><span class="no" aria-label="Not always">–</span></span></div>`).join('')}</div>`).join('');
  dots.innerHTML = PRODUCTS.map((p, i) => `<button type="button" data-i="${i}" aria-label="Show ${p.name}"></button>`).join('');
  const figs = $$('.bs', slides), rows = $$('.tbl-set', sets), pips = $$('button', dots);

  let target = 0, cur = 0, shown = -1, running = false, last = 0;
  function paint(s){
    const blurMax = reduce ? 0 : 22;
    figs.forEach((el, i) => { const d = s - i, a = Math.abs(d);
      el.style.opacity = clamp(1 - a*1.25, 0, 1).toFixed(3);
      el.style.transform = `translate3d(0, ${(-d*38).toFixed(2)}%, 0) scale(${(1 + a*.08).toFixed(3)})`;
      el.style.filter = a < .002 ? 'none' : `blur(${Math.min(blurMax, a*blurMax*1.6).toFixed(1)}px)`;
      el.style.zIndex = String(10 - Math.round(a*4)); });
    rows.forEach((el, i) => { const d = s - i, a = Math.abs(d);
      el.style.opacity = clamp(1 - a*1.6, 0, 1).toFixed(3);
      el.style.transform = `translate3d(0, ${(-d*26).toFixed(1)}px, 0)`;
      el.style.filter = a < .002 ? 'none' : `blur(${Math.min(blurMax*.6, a*blurMax).toFixed(1)}px)`;
      el.style.visibility = a > .9 ? 'hidden' : 'visible'; });
    const on = Math.round(s);
    if (on !== shown){ shown = on;
      pips.forEach((b, i) => b.classList.toggle('on', i === on));
      rows.forEach((el, i) => el.setAttribute('aria-hidden', i === on ? 'false' : 'true')); }
  }
  // animate only after a click, then stop
  function frame(now){
    const dt = Math.min(.05, (now - last)/1000); last = now;
    cur += (target - cur)*(1 - Math.exp(-dt*(reduce ? 60 : 7)));
    if (Math.abs(target - cur) < 1e-3) cur = target;
    paint(cur);
    if (cur !== target) requestAnimationFrame(frame); else running = false;
  }
  function go(i){
    target = (i + N) % N;
    if (!running){ running = true; last = performance.now(); requestAnimationFrame(frame); }
  }
  dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); });
  slides.addEventListener('click', () => go(target + 1));
  paint(0);
  return { go };
}

export { initBenefits };
