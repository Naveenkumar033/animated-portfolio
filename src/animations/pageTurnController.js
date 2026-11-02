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
      heroStage.style.display = 'block';
      heroStage.style.pointerEvents = 'none';

      const poly = pageCurlInstance.getClipPolygon(curl);
      if (poly) {
        heroStage.style.clipPath = poly;
        heroStage.style.webkitClipPath = poly;
      }

      // Pin aboutSection locked to viewport while the peel reveals it underneath
      if (aboutSection) {
        aboutSection.style.position = 'fixed';
        aboutSection.style.top = '0px';
        aboutSection.style.left = '0px';
        aboutSection.style.width = '100vw';
        aboutSection.style.height = '100vh';
        aboutSection.style.zIndex = '11';
        aboutSection.style.visibility = 'visible';
        aboutSection.style.display = 'flex';
      }
    } else if (curl >= 0.999) {
      // Completed turn: heroStage is completely hidden and removed from layout flow
      heroStage.style.position = '';
      heroStage.style.top = '';
      heroStage.style.left = '';
      heroStage.style.width = '';
      heroStage.style.height = '';
      heroStage.style.zIndex = '';
      heroStage.style.visibility = 'hidden';
      heroStage.style.display = 'none';
      heroStage.style.clipPath = 'polygon(0 0, 0 0, 0 0)';
      heroStage.style.webkitClipPath = 'polygon(0 0, 0 0, 0 0)';
      heroStage.style.pointerEvents = 'none';

      // Release aboutSection back to natural document flow: directly scrolls into WORK
      if (aboutSection) {
        aboutSection.style.position = '';
        aboutSection.style.top = '';
        aboutSection.style.left = '';
        aboutSection.style.width = '';
        aboutSection.style.height = '';
        aboutSection.style.zIndex = '';
        aboutSection.style.visibility = 'visible';
        aboutSection.style.display = 'flex';
      }
    } else {
      // Hero active (curl <= 0.001): normal sticky flow
      heroStage.style.position = '';
      heroStage.style.top = '';
      heroStage.style.left = '';
      heroStage.style.width = '';
      heroStage.style.height = '';
      heroStage.style.zIndex = '';
      heroStage.style.visibility = 'visible';
      heroStage.style.display = 'block';
      heroStage.style.clipPath = '';
      heroStage.style.webkitClipPath = '';
      heroStage.style.pointerEvents = 'auto';

      if (aboutSection) {
        aboutSection.style.position = '';
        aboutSection.style.top = '';
        aboutSection.style.left = '';
        aboutSection.style.width = '';
        aboutSection.style.height = '';
        aboutSection.style.zIndex = '';
      }
    }
  }

  // Create dedicated ScrollTrigger for the realistic page curl peel
  // Peels smoothly over the final 100svh of heroContainer, synchronizing
  // exactly with pageTurnContainer unpinning directly into the WORK section
  const trigger = ScrollTrigger.create({
    trigger: heroContainer,
    start: () => `${heroContainer.offsetHeight - window.innerHeight} top`,
    end: () => `${heroContainer.offsetHeight} top`,
    scrub: 0.1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const curl = Math.min(1, Math.max(0, self.progress));
      updateTurn(curl);
    },
    onLeave: () => {
      updateTurn(1.0);
    },
    onEnterBack: (self) => {
      updateTurn(self.progress);
    },
    onLeaveBack: () => {
      updateTurn(0.0);
    }
  });

  // Evaluate initial state immediately
  updateTurn(trigger.progress ? Math.min(1, trigger.progress) : 0);

  return pageCurlInstance;
}

export function getPageCurl() {
  return pageCurlInstance;
}
