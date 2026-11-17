import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let initialized = false;

/**
 * Page-to-Page Scroll Transitions
 * Smoothly glides from Hero's "Let's make it simple." end frame into Why Custom,
 * then continues page-over-page transitions through Work, Services, Process, and Contact
 * while preserving position: sticky inside every section.
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
      { scale: 1, borderRadius: '0rem', opacity: 1, filter: 'blur(0px)' },
      {
        scale: 0.9,
        borderRadius: '2rem',
        opacity: 0.16,
        filter: 'blur(7px)',
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: pageTurnContainer,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.25
        }
      }
    );

    gsap.fromTo(
      pageTurnContainer,
      {
        borderTopLeftRadius: '2.25rem',
        borderTopRightRadius: '2.25rem',
        boxShadow: '0 -28px 80px rgba(0, 0, 0, 0.18)'
      },
      {
        borderTopLeftRadius: '0rem',
        borderTopRightRadius: '0rem',
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: pageTurnContainer,
          start: 'top bottom',
          end: 'top 10%',
          scrub: 0.25
        }
      }
    );

    gsap.fromTo(
      whySection,
      { scale: 0.96 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: pageTurnContainer,
          start: 'top bottom',
          end: 'top 10%',
          scrub: 0.25
        }
      }
    );

    const whyCards = [whyDesk, whyReview].filter(Boolean);
    if (whyCards.length) {
      gsap.fromTo(
        whyCards,
        { y: 36, scale: 0.92, opacity: 0.25 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: whySection,
            start: 'top 82%',
            end: 'top 22%',
            scrub: 0.4
          }
        }
      );
    }
  }

  // 2. About (#about) -> Selected Work (#work)
  if (pageTurnContainer && workStage) {
    gsap.fromTo(
      pageTurnContainer,
      { scale: 1, opacity: 1, filter: 'blur(0px)' },
      {
        scale: 0.93,
        opacity: 0.3,
        filter: 'blur(5px)',
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: workStage,
          start: 'top bottom',
          end: 'top 15%',
          scrub: 0.35
        }
      }
    );

    gsap.fromTo(
      workStage,
      {
        borderTopLeftRadius: '2.25rem',
        borderTopRightRadius: '2.25rem',
        boxShadow: '0 -30px 90px rgba(0, 0, 0, 0.38)'
      },
      {
        borderTopLeftRadius: '0rem',
        borderTopRightRadius: '0rem',
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: workStage,
          start: 'top bottom',
          end: 'top 12%',
          scrub: 0.35
        }
      }
    );
  }

  // 3. Clients (#clients) -> Capabilities (#skills)
  if (servicesSection) {
    if (clientsStrip) {
      gsap.fromTo(
        clientsStrip,
        { scale: 1, opacity: 1, filter: 'blur(0px)' },
        {
          scale: 0.94,
          opacity: 0.35,
          filter: 'blur(4px)',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: servicesSection,
            start: 'top bottom',
            end: 'top 18%',
            scrub: 0.35
          }
        }
      );
    }

    gsap.fromTo(
      servicesSection,
      {
        borderTopLeftRadius: '2.25rem',
        borderTopRightRadius: '2.25rem',
        boxShadow: '0 -28px 80px rgba(0, 0, 0, 0.2)'
      },
      {
        borderTopLeftRadius: '0rem',
        borderTopRightRadius: '0rem',
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: servicesSection,
          start: 'top bottom',
          end: 'top 14%',
          scrub: 0.35
        }
      }
    );

    if (servicesIntro) {
      gsap.fromTo(
        servicesIntro,
        { scale: 0.92, y: 24, opacity: 0.25 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: servicesSection,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 0.4
          }
        }
      );
    }
  }

  // 4. Capabilities (#skills) -> How a Project Runs (#experience)
  if (processSection) {
    if (servicesIntro) {
      gsap.fromTo(
        servicesIntro,
        { scale: 1, opacity: 1, filter: 'blur(0px)' },
        {
          scale: 0.9,
          opacity: 0.25,
          filter: 'blur(4px)',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: processSection,
            start: 'top 86%',
            end: 'top 20%',
            scrub: 0.4
          }
        }
      );
    }

    gsap.fromTo(
      processSection,
      {
        borderTopLeftRadius: '2.25rem',
        borderTopRightRadius: '2.25rem',
        boxShadow: '0 -26px 80px rgba(0, 0, 0, 0.14)'
      },
      {
        borderTopLeftRadius: '0rem',
        borderTopRightRadius: '0rem',
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: processSection,
          start: 'top bottom',
          end: 'top 14%',
          scrub: 0.35
        }
      }
    );
  }

  // 5. How a Project Runs (#experience) -> Contact (#contact)
  if (contactSection) {
    if (processStickyBar) {
      gsap.to(processStickyBar, {
        opacity: 0,
        y: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 92%',
          end: 'top 62%',
          scrub: 0.3
        }
      });
    }

    gsap.fromTo(
      contactSection,
      {
        borderTopLeftRadius: '2.25rem',
        borderTopRightRadius: '2.25rem',
        boxShadow: '0 -26px 80px rgba(0, 0, 0, 0.14)'
      },
      {
        borderTopLeftRadius: '0rem',
        borderTopRightRadius: '0rem',
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top bottom',
          end: 'top 14%',
          scrub: 0.35
        }
      }
    );
  }

  return true;
}

export function getPageCurl() {
  return null;
}
