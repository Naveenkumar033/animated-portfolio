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
  // 1. Global Line Mask reveals for all sections (ScrollTrigger + IntersectionObserver fallback)
  ScrollTrigger.batch('.line-mask', {
    onEnter: (batch) => batch.forEach((el) => el.classList.add('revealed')),
    onEnterBack: (batch) => batch.forEach((el) => el.classList.add('revealed')),
    start: 'top 90%',
    once: true
  });

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
  }

  // 2. Scroll-Synced Sticky Card Zoom & Blur Depth Stack (Services -> Process -> Contact)
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
            scrub: 0.3
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
        { scale: 0.9, y: 30, opacity: 0.35, filter: 'blur(4px)' },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: shell,
            start: 'top 94%',
            end: 'top 38%',
            scrub: 0.45
          }
        }
      );

      // Shrink & blur outer sticky shell smoothly into background as next card/section rises
      if (nextTarget) {
        gsap.fromTo(
          shell,
          { scale: 1, opacity: 1, filter: 'blur(0px)' },
          {
            scale: 0.86,
            opacity: 0.32,
            filter: 'blur(7px)',
            ease: 'none',
            scrollTrigger: {
              trigger: nextTarget,
              start: 'top 78%',
              end: 'top 18%',
              scrub: 0.45
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

  // Pointer spotlight glow on inner coffee cards
  document.querySelectorAll('.service-column-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  // 2b. Contact Stage Zoom-In Focus Transition (How a Project Runs animations are in processAnimations.js)
  const contactSection = document.getElementById('contact');
  const contactHeroGrid = document.querySelector('.contact-hero-grid');
  if (contactHeroGrid && contactSection && !prefersReducedMotion) {
    gsap.fromTo(
      contactHeroGrid,
      { scale: 0.9, y: 40, opacity: 0.25, filter: 'blur(5px)' },
      {
        scale: 1,
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'none',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 92%',
          end: 'top 36%',
          scrub: 0.45
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
        lenisInstance.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
