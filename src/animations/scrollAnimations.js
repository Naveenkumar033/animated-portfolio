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
      duration: 0.78,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5
    });

    // Sync Lenis once per scroll frame (no duplicate native scroll listener)
    lenisInstance.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(500, 33);
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
      lenisInstance.scrollTo(el, { offset: -20, duration: 1.05 });
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
  // 1. Global Line Mask reveals for all sections (IntersectionObserver primary + ScrollTrigger fallback)
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
    );
    document.querySelectorAll('.line-mask').forEach((el) => observer.observe(el));
  } else {
    ScrollTrigger.batch('.line-mask', {
      onEnter: (batch) => batch.forEach((el) => el.classList.add('revealed')),
      onEnterBack: (batch) => batch.forEach((el) => el.classList.add('revealed')),
      start: 'top 90%',
      once: true
    });
  }

  // 2. Scroll-Synced Sticky Card Depth Stack (GPU compositor transform & opacity only)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initScrollZoomStack(items, { nextSection, progressFill, activeIndexEl, containerEl } = {}) {
    if (!items.length || prefersReducedMotion) return;

    if (containerEl && progressFill) {
      gsap.fromTo(
        progressFill,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerEl,
            start: 'top 55%',
            end: 'bottom 55%',
            scrub: 0.25
          }
        }
      );
    }

    items.forEach(({ shell, enter }, idx) => {
      if (!shell || !enter) return;
      const nextTarget = items[idx + 1]?.shell || nextSection;

      if (activeIndexEl) {
        ScrollTrigger.create({
          trigger: shell,
          start: 'top 55%',
          end: 'bottom 35%',
          onEnter: () => {
            activeIndexEl.textContent = `0${idx + 1} / 0${items.length}`;
          },
          onEnterBack: () => {
            activeIndexEl.textContent = `0${idx + 1} / 0${items.length}`;
          }
        });
      }

      // Smooth zoom-in into focus on inner wrapper as card enters viewport
      gsap.fromTo(
        enter,
        { scale: 0.92, y: 28, opacity: 0.35, force3D: true },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: shell,
            start: 'top 94%',
            end: 'top 38%',
            scrub: 0.35
          }
        }
      );

      // Shrink & fade outer sticky shell smoothly into background as next card/section rises
      if (nextTarget) {
        gsap.fromTo(
          shell,
          { scale: 1, opacity: 1, force3D: true },
          {
            scale: 0.88,
            opacity: 0.35,
            force3D: true,
            ease: 'none',
            scrollTrigger: {
              trigger: nextTarget,
              start: 'top 78%',
              end: 'top 18%',
              scrub: 0.35
            }
          }
        );
      }
    });
  }

  // 2a. Four Things I Do (Coffee Cards)
  const servicesCol = document.querySelector('.services-stack-column');
  const serviceItems = gsap.utils.toArray('.service-card-shell').map((shell) => ({
    shell,
    enter: shell.querySelector('.service-card-enter')
  }));
  const processSection = document.getElementById('experience');
  initScrollZoomStack(serviceItems, {
    nextSection: processSection,
    progressFill: document.getElementById('servicesProgressFill'),
    activeIndexEl: document.getElementById('servicesActiveIndex'),
    containerEl: servicesCol
  });

  // Pointer spotlight glow on inner coffee cards (cached rect + rAF throttle to prevent reflow)
  document.querySelectorAll('.service-column-card').forEach((card) => {
    let rect = null;
    let pending = false;
    let lastX = 0;
    let lastY = 0;

    card.addEventListener('pointerenter', () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener('pointermove', (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        card.style.setProperty('--mx', `${lastX}px`);
        card.style.setProperty('--my', `${lastY}px`);
        pending = false;
      });
    }, { passive: true });
  });

  // 2b. Contact Stage Zoom-In Focus Transition
  const contactSection = document.getElementById('contact');
  const contactHeroGrid = document.querySelector('.contact-hero-grid');
  if (contactHeroGrid && contactSection && !prefersReducedMotion) {
    gsap.fromTo(
      contactHeroGrid,
      { scale: 0.93, y: 36, opacity: 0.25, force3D: true },
      {
        scale: 1,
        y: 0,
        opacity: 1,
        force3D: true,
        ease: 'none',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 92%',
          end: 'top 36%',
          scrub: 0.35
        }
      }
    );
  }

  // 3. Back to Top button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      playSound('click');
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
