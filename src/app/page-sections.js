// Tracks the current section and theme, and scrolls to sections.
import { state } from './state.js';
import { NSTAGE } from '../data/pipeline.js';
import { $, $$ } from '../utils/dom.js';
import { clamp } from '../utils/math.js';
import { reduce } from '../utils/media.js';

const LAYOUT = { pages:[], tops:[], hs:[], vh:window.innerHeight, cur:-1, theme:'green', reactor:null };

const GROUND = { green:'#112117', cream:'#eee3c6' };

function scrollToY(y){ if (state.lenis){ state.lenis.scrollTo(Math.max(0, y), { duration:1.4 }); return; } window.scrollTo({ top:Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' }); }

function scrollToPage(id){ const el = document.getElementById(id); if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY); }

function pageProgress(id){
  const el = document.getElementById(id); if (!el) return { p:0, visible:false };
  const r = el.getBoundingClientRect(), vh = window.innerHeight;
  return { p:clamp(-r.top/Math.max(1, r.height - vh), 0, 1), visible: r.top < vh && r.bottom > 0 };
}

function initPages(){
  const pages = $$('main > .page'); LAYOUT.pages = pages;
  const first = p => p.id === 'process' ? 'cream' : p.dataset.theme, last = p => p.id === 'process' ? 'green' : p.dataset.theme;
  function measure(){
    LAYOUT.vh = window.innerHeight;
    LAYOUT.hs = pages.map(p => p.offsetHeight);
    LAYOUT.tops = pages.map(p => p.getBoundingClientRect().top + window.scrollY);
    // where two themes meet, the upper colour fades into the next page
    pages.forEach((p, i) => { if (i && !p.querySelector(':scope > .show, :scope > .pin')) p.style.setProperty('--prev', GROUND[last(pages[i - 1])] + ' '); });
    update();
  }
  function update(){
    const y = window.scrollY;
    let cur = 0; pages.forEach((p, i) => { if (LAYOUT.tops[i] <= y + 72) cur = i; });
    const id = pages[cur].id; let theme = pages[cur].dataset.theme;
    if (id === 'process' && LAYOUT.reactor) theme = LAYOUT.reactor.theme();
    if (cur !== LAYOUT.cur || theme !== LAYOUT.theme){ LAYOUT.cur = cur; LAYOUT.theme = theme; window.dispatchEvent(new CustomEvent('tl:page', { detail:{ id, theme, index:cur, count:pages.length } })); }
    document.documentElement.style.setProperty('--sp', clamp(y/Math.max(1, document.documentElement.scrollHeight - LAYOUT.vh), 0, 1).toFixed(4));
  }
  let ticking = false;
  window.addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); }, { passive:true });
  window.addEventListener('resize', () => requestAnimationFrame(measure));
  if ('ResizeObserver' in window){ let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(measure, 80); }).observe($('main')); }
  // the nav theme follows the reaction slides, which change after scrolling stops
  (function tick(){ requestAnimationFrame(tick); if (LAYOUT.reactor && pages[LAYOUT.cur] && pages[LAYOUT.cur].id === 'process') update(); })();

  // anchors: smooth scroll to a section
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1); if (!id || !document.getElementById(id)) return;
    e.preventDefault(); scrollToPage(id);
  });
  window.addEventListener('tl:goStage', e => {
    const i = pages.findIndex(p => p.id === 'process'); if (i < 0) return;
    scrollToY(LAYOUT.tops[i] + ((e.detail + .32)/NSTAGE)*(LAYOUT.hs[i] - LAYOUT.vh));
  });
  measure();
  window.addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  return { measure, update };
}

export { LAYOUT, pageProgress, initPages };
