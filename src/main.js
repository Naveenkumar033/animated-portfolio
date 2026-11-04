// Entry point: loads styles and boots every feature in order.
import './styles/main.css';
import { intro } from './app/intro.js';
import { setLoad } from './app/loader.js';
import { LAYOUT, initPages, pageProgress } from './app/page-sections.js';
import { initScroll } from './app/scroll-animations.js';
import { initSmooth } from './app/smooth-scroll.js';
import { state, thumbs } from './app/state.js';
import { initCart, renderCart } from './features/cart/cart.js';
import { initContactForm } from './features/contact/contact-form.js';
import { buildNeeds, selectNeed } from './features/finder/product-finder.js';
import { initHeroJar } from './features/hero/hero-jar.js';
import { buildMarquee } from './features/hero/marquee.js';
import { buildLab } from './features/lab/lab-board.js';
import { initNav } from './features/navigation/navigation.js';
import { initReactor } from './features/pipeline/reactor.js';
import { buildFilters, buildGrid, fillShots } from './features/products/product-grid.js';
import { SHOTS } from './features/products/product-images.js';
import { initLightbox } from './components/lightbox.js';
import { initStory } from './features/product-story/product-story.js';
import { buildHerbs } from './features/science/herb-picker.js';
import { initMolecule } from './features/science/molecule-viewer.js';
import { $ } from './utils/dom.js';

// Boot order matters: static UI first, then the 3D scenes (studio shots feed the cards), then scroll wiring.
async function boot(){
  setLoad(8);
  initCart(); initContactForm();
  buildMarquee(); buildLab(); buildNeeds(); renderCart(); initNav();
  setLoad(20);
  try { if (document.fonts) await Promise.race([Promise.all(['850 40px Archivo','600 20px Archivo','600 24px Caveat'].map(f => document.fonts.load(f))).then(() => document.fonts.ready), new Promise(r => setTimeout(r, 2500))]); } catch(e){}
  setLoad(36);
  try { state.heroApi = initHeroJar(); } catch(err){ console.warn('hero jar unavailable', err); }
  Object.assign(thumbs, SHOTS); initLightbox();
  setLoad(78);
  fillShots(); buildGrid(); buildFilters(); selectNeed(1, true);
  try { state.mol = initMolecule(); } catch(err){ console.warn('molecule viewer unavailable', err); }
  buildHerbs();
  setLoad(88);
  try { state.storyApi = initStory(); } catch(err){ console.warn('product story unavailable', err); }
  try { initPages(); LAYOUT.reactor = initReactor(() => pageProgress('process')); } catch(err){ console.warn('pipeline scene unavailable', err); }
  setLoad(96);
  initSmooth();
  initScroll();
  intro();
}

// never leave the loading screen up, even if a 3D scene fails
const failSafe = setTimeout(() => $('#loader').classList.add('done'), 25000);

boot().catch(err => { console.error(err); $('#loader').classList.add('done'); }).finally(() => clearTimeout(failSafe));

