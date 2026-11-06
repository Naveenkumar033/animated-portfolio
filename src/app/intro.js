// Hides the loader and plays the hero entrance timeline.
import { setLoad } from './loader.js';
import { state } from './state.js';
import { gsap, hasGsap } from '../lib/gsap.js';
import { $ } from '../utils/dom.js';
import { reduce } from '../utils/media.js';

function intro(){
  const loader = $('#loader'); setLoad(100);
  setTimeout(() => {
    loader.classList.add('done');
    state.heroApi && state.heroApi.start();
    if (hasGsap && !reduce){
      const tl = gsap.timeline({ defaults:{ ease:'power4.out' } });
      tl.fromTo('.st-arc circle', { strokeDasharray:'0 100' }, { strokeDasharray:'100 0', duration:2, ease:'power2.inOut' }, 0)
        .from('.st-h .w', { yPercent:110, duration:1.2, stagger:.1 }, .3)
        .from('.st-lede', { opacity:0, y:18, duration:1 }, .6)
        .fromTo('.st-buy', { scale:0, opacity:0 }, { scale:1, opacity:1, duration:.8, ease:'back.out(2.2)' }, .8)
        .fromTo('.fact', { scale:0, opacity:0 }, { scale:1, opacity:1, duration:.9, stagger:.12, ease:'back.out(2)' }, .9)
        .from('.st-note', { opacity:0, rotation:-14, duration:.9 }, 1.2)
        .from('.nav > *', { y:-18, opacity:0, duration:.8, stagger:.06 }, .3)
        .from('.dock', { x:-90, opacity:0, duration:1.1, ease:'expo.out' }, .5);
    }
  }, 300);
}

export { intro };
