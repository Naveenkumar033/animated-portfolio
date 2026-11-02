import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PageCurlScene } from './PageCurlScene.js';

gsap.registerPlugin(ScrollTrigger);

let pageCurlInstance = null;

export function initPageTurn() {
  const heroStage = document.getElementById('heroStage');
  const heroContainer = document.getElementById('heroScrollContainer');
  const aboutSection = document.getElementById('about');

  if (!heroStage || !heroContainer) return null;

  let canvas = document.getElementById('pageCurlCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'pageCurlCanvas';
    canvas.className = 'page-curl-canvas';
    heroStage.appendChild(canvas);
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
      heroStage.style.visibility = 'visible';
      heroStage.style.display = 'block';
      heroStage.style.pointerEvents = 'none';

      const poly = pageCurlInstance.getClipPolygon(curl);
      if (poly) {
        heroStage.style.clipPath = poly;
        heroStage.style.webkitClipPath = poly;
      }
    } else if (curl >= 0.999) {
      // Completed turn: heroStage (Image 1) is cleanly hidden, fully revealing Image 2
      heroStage.style.visibility = 'hidden';
      heroStage.style.display = 'none';
      heroStage.style.clipPath = 'polygon(0 0, 0 0, 0 0)';
      heroStage.style.webkitClipPath = 'polygon(0 0, 0 0, 0 0)';
      heroStage.style.pointerEvents = 'none';
    } else {
      // Image 1 active: full uncurled sheet
      heroStage.style.visibility = 'visible';
      heroStage.style.display = 'block';
      heroStage.style.clipPath = '';
      heroStage.style.webkitClipPath = '';
      heroStage.style.pointerEvents = 'auto';
    }
  }

  // Create dedicated ScrollTrigger for the realistic page curl peel:
  // Starts when Image 1 is reached at the end of the hero timeline,
  // curling Image 1 smoothly away to reveal Image 2 directly underneath.
  const trigger = ScrollTrigger.create({
    trigger: heroContainer,
    start: () => `${heroContainer.offsetHeight - window.innerHeight} top`,
    end: () => `${heroContainer.offsetHeight} top`,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      updateTurn(self.progress);
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

  updateTurn(trigger.progress ? Math.min(1, trigger.progress) : 0);

  // Why Desk Character stand-up scrub:
  // After the curl completes, as the user scrolls through the Why Custom section,
  // the character smoothly rises from typing at the desk and steps out in front into a confident standing pose
  const whyContainer = document.getElementById('pageTurnContainer');
  if (whyContainer) {
    ScrollTrigger.create({
      trigger: whyContainer,
      start: () => whyContainer.offsetTop + window.innerHeight,
      end: () => whyContainer.offsetTop + whyContainer.offsetHeight - window.innerHeight,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (window.__whyDeskScene) {
          window.__whyDeskScene.updateScrub(self.progress);
        }
      },
      onLeave: () => {
        if (window.__whyDeskScene) {
          window.__whyDeskScene.updateScrub(1.0);
        }
      },
      onEnterBack: (self) => {
        if (window.__whyDeskScene) {
          window.__whyDeskScene.updateScrub(self.progress);
        }
      },
      onLeaveBack: () => {
        if (window.__whyDeskScene) {
          window.__whyDeskScene.updateScrub(0.0);
        }
      }
    });
  }

  return pageCurlInstance;
}

export function getPageCurl() {
  return pageCurlInstance;
}
