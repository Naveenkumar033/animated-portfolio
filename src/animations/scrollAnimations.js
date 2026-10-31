import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playSound } from '../utils/audio.js';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    lenisInstance = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5
    });

    lenisInstance.on('scroll', ScrollTrigger.update);

    window.addEventListener('scroll', () => {
      ScrollTrigger.update();
    }, { passive: true });

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', () => {
      ScrollTrigger.update();
    }, { passive: true });
  }

  window.scrollToSection = function (id) {
    playSound('click');
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisInstance) {
      lenisInstance.scrollTo(el, { offset: -20, duration: 1.3 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return lenisInstance;
}

export function getLenis() {
  return lenisInstance;
}

export function initSectionScrollTriggers() {
  // 1. Why Custom Desk Entrance Animation (Fly-in matching reference)
  const whyDeskContainer = document.getElementById('whyDeskContainer');
  if (whyDeskContainer) {
    gsap.fromTo(
      whyDeskContainer,
      {
        x: 80,
        y: 100,
        rotation: 4,
        scale: 0.94,
        opacity: 0
      },
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#pageTurnContainer',
          start: 'top 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // 2. Global Line Mask reveals for all sections
  ScrollTrigger.batch('.line-mask', {
    onEnter: (batch) => batch.forEach((el) => el.classList.add('revealed')),
    start: 'top 85%',
    once: true
  });

  // 3. Back to Top button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      playSound('click');
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
