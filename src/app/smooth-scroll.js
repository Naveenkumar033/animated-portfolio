// Lenis smooth scrolling, synced with GSAP ScrollTrigger.
import Lenis from 'lenis';
import { state } from './state.js';
import { ScrollTrigger, gsap } from '../lib/gsap.js';
import { reduce } from '../utils/media.js';

function initSmooth(){
  if (typeof Lenis === 'undefined' || reduce) return;
  state.lenis = new Lenis({ lerp:.11, smoothWheel:true, wheelMultiplier:1 });
  if (ScrollTrigger){ state.lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => state.lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0); }
  else { const raf = t => { state.lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
}

export { initSmooth };
