import { ScrollTrigger } from 'gsap/ScrollTrigger';
window.ScrollTrigger = ScrollTrigger;
import { initPreloader } from '../components/loader/Preloader.js';
import { initHeader } from '../components/navigation/Header.js';
import { initContactForm } from '../components/sections/ContactForm.js';
import { initSmoothScroll, initSectionScrollTriggers } from '../animations/scrollAnimations.js';
import { initRollingLetters } from '../animations/textAnimations.js';
import { initHeroTimeline } from '../animations/characterTimeline.js';
import { initPageTurn } from '../animations/pageTurnController.js';
import { initMenuDrawer, initReviewCarousel, initProjectModal } from '../animations/transitions.js';
import { SkyScene } from '../scenes/SkyScene.js';
import { HeroStageScene } from '../scenes/HeroStageScene.js';
import { WhyDeskScene } from '../scenes/WhyDeskScene.js';
import { FooterCharacterScene } from '../scenes/FooterCharacterScene.js';

export function initializeApp() {
  if (typeof history !== 'undefined' && history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // 1. Core UI & Controllers
  initSmoothScroll();
  initRollingLetters();
  initHeader();
  initContactForm();
  initMenuDrawer();
  initReviewCarousel();
  initProjectModal();

  // 2. 3D Scenes Initialization
  const skyScene = new SkyScene('heroSkyCanvas');
  const heroStageScene = new HeroStageScene('heroCanvas');
  const whyDeskScene = new WhyDeskScene('whyDeskCanvas');
  const footerScene = new FooterCharacterScene('footerCharacterCanvas');

  // 3. Preloader completion triggers opening hands touch & zoom animation
  initPreloader(() => {
    heroStageScene.startIntro();
    ScrollTrigger.refresh();
  });

  // 4. Unified Scroll Choreography
  heroStageScene.onReady(() => {
    initHeroTimeline(heroStageScene);
    initPageTurn();
    initSectionScrollTriggers();
    ScrollTrigger.refresh();
  });

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  return {
    skyScene,
    heroStageScene,
    whyDeskScene,
    footerScene
  };
}
