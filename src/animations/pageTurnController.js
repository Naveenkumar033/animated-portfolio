import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PageCurlScene } from './PageCurlScene.js';

gsap.registerPlugin(ScrollTrigger);

let pageCurlInstance = null;

export function initPageTurn() {
  const heroStage = document.getElementById('heroStage');
  const heroContainer = document.getElementById('heroScrollContainer');
  const pageTurnContainer = document.getElementById('pageTurnContainer');
  const aboutSection = document.getElementById('about');

  if (!heroStage || !heroContainer) return null;

  // Initialize WebGL Page Curl Scene
  let canvas = document.getElementById('pageCurlCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'pageCurlCanvas';
    canvas.className = 'page-curl-canvas';
    document.body.appendChild(canvas);
  }

  pageCurlInstance = new PageCurlScene('pageCurlCanvas');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return pageCurlInstance;
  }

  function updateTurn(rawProg) {
    const curl = Math.min(1, Math.max(0, rawProg || 0));
    pageCurlInstance.setCurl(curl);

    if (curl > 0.001 && curl < 0.999) {
      // Pin heroStage locked to exact viewport dimensions during the curl peel
      heroStage.style.position = 'fixed';
      heroStage.style.top = '0px';
      heroStage.style.left = '0px';
      heroStage.style.width = '100vw';
      heroStage.style.height = '100vh';
      heroStage.style.zIndex = '15';
      heroStage.style.visibility = 'visible';
      heroStage.style.pointerEvents = curl > 0.85 ? 'none' : 'auto';

      const poly = pageCurlInstance.getClipPolygon(curl);
      if (poly) {
        heroStage.style.clipPath = poly;
        heroStage.style.webkitClipPath = poly;
      }
    } else if (curl >= 0.999) {
      // Completed turn: heroStage is completely hidden
      heroStage.style.position = '';
      heroStage.style.top = '';
      heroStage.style.left = '';
      heroStage.style.width = '';
      heroStage.style.height = '';
      heroStage.style.zIndex = '';
      heroStage.style.visibility = 'hidden';
      heroStage.style.clipPath = 'polygon(0 0, 0 0, 0 0)';
      heroStage.style.webkitClipPath = 'polygon(0 0, 0 0, 0 0)';
      heroStage.style.pointerEvents = 'none';
    } else {
      // Hero active (curl <= 0.001): normal sticky flow
      heroStage.style.position = '';
      heroStage.style.top = '';
      heroStage.style.left = '';
      heroStage.style.width = '';
      heroStage.style.height = '';
      heroStage.style.zIndex = '';
      heroStage.style.visibility = 'visible';
      heroStage.style.clipPath = '';
      heroStage.style.webkitClipPath = '';
      heroStage.style.pointerEvents = 'auto';
    }
  }

  // Create dedicated ScrollTrigger for the realistic page curl peel
  // Peels smoothly over the first 75% of the transition window
  const trigger = ScrollTrigger.create({
    trigger: heroContainer,
    start: () => `${heroContainer.offsetHeight - window.innerHeight} top`,
    end: () => `${heroContainer.offsetHeight - window.innerHeight * 0.15} top`,
    scrub: 0.1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const curl = Math.min(1, Math.max(0, self.progress / 0.85));
      updateTurn(curl);
    }
  });

  // Evaluate initial state immediately
  updateTurn(trigger.progress ? Math.min(1, trigger.progress / 0.85) : 0);

  return pageCurlInstance;
}

export function getPageCurl() {
  return pageCurlInstance;
}
