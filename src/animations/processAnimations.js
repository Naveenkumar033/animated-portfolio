import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initProcessAnimations() {
  const processSection = document.getElementById('experience');
  if (!processSection) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const header = processSection.querySelector('.process-stage-header');
  const title = processSection.querySelector('.process-title');
  const lede = processSection.querySelector('.process-lede');
  const stackList = processSection.querySelector('.process-stack-list');
  const shells = gsap.utils.toArray('.process-step-shell', processSection);
  const progressBar = document.getElementById('processProgressFill');
  const activeIndexEl = document.getElementById('processActiveIndex');
  const activeStageEl = document.getElementById('processActiveStage');
  const contactSection = document.getElementById('contact');

  if (!shells.length) return;

  // 1. Header scroll-triggered reveal
  if (title) {
    gsap.fromTo(
      title,
      { y: 40, opacity: 0.2 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: processSection,
          start: 'top 85%',
          end: 'top 30%',
          scrub: 0.5
        }
      }
    );
  }

  if (lede) {
    gsap.fromTo(
      lede,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: lede,
          start: 'top 88%',
          once: true
        }
      }
    );
  }

  // Header fades subtly as the cardless pages stack up
  if (header && stackList) {
    gsap.to(header, {
      opacity: 0.2,
      y: -24,
      ease: 'none',
      scrollTrigger: {
        trigger: stackList,
        start: 'top 75%',
        end: 'top 25%',
        scrub: 0.5
      }
    });
  }

  // 2. Global Scroll Progress Fill across all 4 pages
  if (stackList && progressBar) {
    gsap.fromTo(
      progressBar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: stackList,
          start: 'top 65%',
          end: 'bottom 60%',
          scrub: 0.3
        }
      }
    );
  }

  // 3. Cardless Page-by-Page Transitions
  shells.forEach((shell, idx) => {
    const copyItems = shell.querySelectorAll('.process-step-copy > *');
    const filmBox = shell.querySelector('.step-film-box');
    const zoomWrap = shell.querySelector('.step-film-zoom-wrap');
    const video = shell.querySelector('video');
    const stepLabel = shell.getAttribute('data-step-label') || `STEP 0${idx + 1}`;
    const nextTarget = shells[idx + 1] || contactSection;

    // A. Active Page State Tracker (Updates sticky HUD & plays video)
    ScrollTrigger.create({
      trigger: shell,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => {
        if (activeIndexEl) activeIndexEl.textContent = `0${idx + 1} / 0${shells.length}`;
        if (activeStageEl) activeStageEl.textContent = stepLabel;
        if (video) video.play().catch(() => {});
      },
      onEnterBack: () => {
        if (activeIndexEl) activeIndexEl.textContent = `0${idx + 1} / 0${shells.length}`;
        if (activeStageEl) activeStageEl.textContent = stepLabel;
        if (video) video.play().catch(() => {});
      }
    });

    // B. Incoming Page Content Reveal (for pages 1, 2, 3 as they rise over the previous page)
    if (idx > 0) {
      if (copyItems.length) {
        gsap.fromTo(
          copyItems,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: shell,
              start: 'top 82%',
              end: 'top 32%',
              scrub: 0.4
            }
          }
        );
      }

      if (filmBox) {
        gsap.fromTo(
          filmBox,
          { scale: 0.94, opacity: 0.35, filter: 'blur(4px)' },
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: shell,
              start: 'top 85%',
              end: 'top 30%',
              scrub: 0.45
            }
          }
        );
      }
    } else {
      // First page video auto-plays when section comes into view
      ScrollTrigger.create({
        trigger: shell,
        start: 'top 80%',
        onEnter: () => {
          if (video) video.play().catch(() => {});
        }
      });
    }

    // C. Outgoing Page Depth Effect: As the next page slides up over this page,
    // this page subtly scales down, fades and softens into the background (cardless page depth effect)
    if (nextTarget) {
      gsap.fromTo(
        shell,
        { scale: 1, opacity: 1, filter: 'blur(0px)' },
        {
          scale: 0.95,
          yPercent: -6,
          opacity: 0.22,
          filter: 'blur(6px)',
          ease: 'none',
          scrollTrigger: {
            trigger: nextTarget,
            start: 'top 88%',
            end: 'top 18%',
            scrub: 0.45
          }
        }
      );
    }

    // D. Video subtle parallax inside frame
    if (zoomWrap) {
      gsap.fromTo(
        zoomWrap,
        { scale: 1.14, yPercent: -4 },
        {
          scale: 1.0,
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: shell,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6
          }
        }
      );
    }
  });
}
