import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Work Page Scroll-Linked Clip-Path Curtain Reveal & Parallax
 * Mirrors Framer Motion's:
 *   offset: ["start end", "center center"]
 *   clipPath: ["inset(0% 50% 0% 50%)", "inset(0% 0% 0% 0%)"]
 * paired with smooth GPU-composited inner image parallax and staggered column depth.
 */
export function initWorkAnimations() {
  const workSection = document.getElementById('work');
  if (!workSection) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const tiles = gsap.utils.toArray('.work-project-tile', workSection);
  const staggeredCol = workSection.querySelector('.work-col-staggered');

  // 1. Center-Out Clip-Path Curtain Reveal + Inner Image Vertical Parallax per Project Card
  tiles.forEach((tile) => {
    const frame = tile.querySelector('.work-image-frame');
    const img = tile.querySelector('.work-image');
    const caption = tile.querySelector('.work-card-line');
    const meta = tile.querySelector('.work-meta-footer');

    if (frame) {
      const isMobile = window.innerWidth <= 768;
      gsap.fromTo(
        frame,
        { clipPath: isMobile ? 'inset(0% 30% 0% 30% round 1.25rem)' : 'inset(0% 50% 0% 50% round 1.25rem)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 1.25rem)',
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: isMobile ? 'top 66%' : 'center center',
            scrub: 0.3
          }
        }
      );
    }

    if (frame && img) {
      gsap.fromTo(
        img,
        { yPercent: -10, scale: 1.22, force3D: true },
        {
          yPercent: 10,
          scale: 1.08,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.4
          }
        }
      );
    }

    const textEls = [caption, meta].filter(Boolean);
    if (textEls.length) {
      gsap.fromTo(
        textEls,
        { y: 20, opacity: 0.2, force3D: true },
        {
          y: 0,
          opacity: 1,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: tile,
            start: 'top 92%',
            end: 'top 52%',
            scrub: 0.35
          }
        }
      );
    }
  });

  // 2. Subtle Column Depth Parallax on the Staggered Right Column (Desktop only)
  if (staggeredCol && window.innerWidth > 900) {
    gsap.fromTo(
      staggeredCol,
      { y: 50, force3D: true },
      {
        y: -50,
        force3D: true,
        ease: 'none',
        scrollTrigger: {
          trigger: workSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.45
        }
      }
    );
  }
}
