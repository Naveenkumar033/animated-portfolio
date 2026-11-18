import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let initialized = false;

/**
 * Page-to-Page Scroll Transitions (GPU-Compositor Optimized)
 * Uses pure compositor-accelerated transform (scale/y) & opacity transitions
 * instead of expensive per-frame filter:blur / box-shadow / border-radius repaints.
 */
export function initPageTurn() {
  const canvas = document.getElementById('pageCurlCanvas');
  if (canvas) {
    canvas.style.display = 'none';
    canvas.remove();
  }

  if (initialized) return null;
  initialized = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return null;

  const heroStage = document.getElementById('heroStage');
  const pageTurnContainer = document.getElementById('pageTurnContainer');
  const whySection = document.getElementById('about');
  const whyDesk = document.querySelector('.why-desk-container');
  const whyReview = document.querySelector('.why-review-box');
  const workStage = document.getElementById('work');
  const clientsStrip = document.getElementById('clients');
  const servicesSection = document.getElementById('skills');
  const servicesIntro = document.querySelector('.services-sticky-intro');
  const processSection = document.getElementById('experience');
  const processStickyBar = document.querySelector('.process-sticky-bar');
  const contactSection = document.getElementById('contact');

  // 1. Hero ("Let's make it simple.") -> Page 02 ("Get Found. Get Chosen. Get Built.")
  if (heroStage && pageTurnContainer && whySection) {
    gsap.fromTo(
      heroStage,
      { scale: 1, opacity: 1, force3D: true },
      {
        scale: 0.92,
        opacity: 0.16,
        force3D: true,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: pageTurnContainer,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.2
        }
      }
    );

    gsap.fromTo(
      whySection,
      { scale: 0.97, force3D: true },
      {
        scale: 1,
        force3D: true,
        ease: 'none',
        scrollTrigger: {
          trigger: pageTurnContainer,
          start: 'top bottom',
          end: 'top 10%',
          scrub: 0.2
        }
      }
    );

    const whyCards = [whyDesk, whyReview].filter(Boolean);
    if (whyCards.length) {
      gsap.fromTo(
        whyCards,
        { y: 32, scale: 0.94, opacity: 0.25, force3D: true },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          force3D: true,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: whySection,
            start: 'top 82%',
            end: 'top 22%',
            scrub: 0.35
          }
        }
      );
    }
  }

  // 2. About (#about) -> Selected Work (#work)
  if (pageTurnContainer && workStage) {
    gsap.fromTo(
      pageTurnContainer,
      { scale: 1, opacity: 1, force3D: true },
      {
        scale: 0.94,
        opacity: 0.3,
        force3D: true,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: workStage,
          start: 'top bottom',
          end: 'top 15%',
          scrub: 0.25
        }
      }
    );
  }

  // 3. Clients (#clients) -> Capabilities (#skills)
  if (servicesSection) {
    if (clientsStrip) {
      gsap.fromTo(
        clientsStrip,
        { scale: 1, opacity: 1, force3D: true },
        {
          scale: 0.95,
          opacity: 0.35,
          force3D: true,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: servicesSection,
            start: 'top bottom',
            end: 'top 18%',
            scrub: 0.25
          }
        }
      );
    }

    if (servicesIntro) {
      gsap.fromTo(
        servicesIntro,
        { scale: 0.94, y: 20, opacity: 0.25, force3D: true },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          force3D: true,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: servicesSection,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 0.35
          }
        }
      );
    }
  }

  // 4. Capabilities (#skills) -> How a Project Runs (#experience)
  if (processSection && servicesIntro) {
    gsap.fromTo(
      servicesIntro,
      { scale: 1, opacity: 1, force3D: true },
      {
        scale: 0.92,
        opacity: 0.25,
        force3D: true,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: processSection,
          start: 'top 86%',
          end: 'top 20%',
          scrub: 0.35
        }
      }
    );
  }

  // 5. How a Project Runs (#experience) -> Contact (#contact)
  if (contactSection && processStickyBar) {
    gsap.to(processStickyBar, {
      opacity: 0,
      y: 16,
      force3D: true,
      ease: 'none',
      scrollTrigger: {
        trigger: contactSection,
        start: 'top 92%',
        end: 'top 62%',
        scrub: 0.25
      }
    });
  }

  return true;
}

export function getPageCurl() {
  return null;
}
