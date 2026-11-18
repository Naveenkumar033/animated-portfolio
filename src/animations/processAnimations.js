import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initProcessAnimations() {
  const processSection = document.getElementById('experience');
  if (!processSection) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shells = gsap.utils.toArray('.process-step-shell', processSection);
  const videos = shells.map((s) => s.querySelector('video')).filter(Boolean);

  // Debounced video playback: prevents rapid scrolling across steps from triggering synchronous MP4 decode spikes
  const playTimers = new WeakMap();
  const schedulePlay = (vid) => {
    if (!vid || document.hidden) return;
    clearTimeout(playTimers.get(vid));
    playTimers.set(vid, setTimeout(() => {
      vid.play().catch(() => {});
    }, 140));
  };
  const cancelAndPause = (vid) => {
    if (!vid) return;
    clearTimeout(playTimers.get(vid));
    if (!vid.paused) vid.pause();
  };

  if (typeof IntersectionObserver !== 'undefined' && videos.length) {
    const vidObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const vid = entry.target;
          if (entry.isIntersecting && !document.hidden) {
            schedulePlay(vid);
          } else {
            cancelAndPause(vid);
          }
        });
      },
      { rootMargin: '40px 0px', threshold: 0.1 }
    );
    videos.forEach((v) => {
      v.pause();
      vidObserver.observe(v);
    });
  }

  if (prefersReducedMotion || !shells.length) return;

  const header = processSection.querySelector('.process-stage-header');
  const title = processSection.querySelector('.process-title');
  const lede = processSection.querySelector('.process-lede');
  const stackList = processSection.querySelector('.process-stack-list');
  const progressBar = document.getElementById('processProgressFill');
  const activeIndexEl = document.getElementById('processActiveIndex');
  const activeStageEl = document.getElementById('processActiveStage');
  const contactSection = document.getElementById('contact');

  // 1. Header scroll-triggered reveal
  if (title) {
    gsap.fromTo(
      title,
      { y: 36, opacity: 0.2, force3D: true },
      {
        y: 0,
        opacity: 1,
        force3D: true,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: processSection,
          start: 'top 85%',
          end: 'top 30%',
          scrub: 0.35
        }
      }
    );
  }

  if (lede) {
    gsap.fromTo(
      lede,
      { y: 24, opacity: 0, force3D: true },
      {
        y: 0,
        opacity: 1,
        force3D: true,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: lede,
          start: 'top 88%',
          once: true
        }
      }
    );
  }

  if (header && stackList) {
    gsap.to(header, {
      opacity: 0.2,
      y: -24,
      force3D: true,
      ease: 'none',
      scrollTrigger: {
        trigger: stackList,
        start: 'top 75%',
        end: 'top 25%',
        scrub: 0.35
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
          scrub: 0.25
        }
      }
    );
  }

  // 3. Cardless Page-by-Page Transitions (Pure GPU Transform & Opacity, no video blur)
  shells.forEach((shell, idx) => {
    const copyItems = shell.querySelectorAll('.process-step-copy > *');
    const filmBox = shell.querySelector('.step-film-box');
    const zoomWrap = shell.querySelector('.step-film-zoom-wrap');
    const video = shell.querySelector('video');
    const stepLabel = shell.getAttribute('data-step-label') || `STEP 0${idx + 1}`;
    const nextTarget = shells[idx + 1] || contactSection;

    // A. Active Page State Tracker (Updates sticky HUD & debounces video playback)
    ScrollTrigger.create({
      trigger: shell,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => {
        if (activeIndexEl) activeIndexEl.textContent = `0${idx + 1} / 0${shells.length}`;
        if (activeStageEl) activeStageEl.textContent = stepLabel;
        schedulePlay(video);
      },
      onEnterBack: () => {
        if (activeIndexEl) activeIndexEl.textContent = `0${idx + 1} / 0${shells.length}`;
        if (activeStageEl) activeStageEl.textContent = stepLabel;
        schedulePlay(video);
      },
      onLeave: () => {
        cancelAndPause(video);
      },
      onLeaveBack: () => {
        cancelAndPause(video);
      }
    });

    // B. Incoming Page Content Reveal
    if (idx > 0) {
      if (copyItems.length) {
        gsap.fromTo(
          copyItems,
          { y: 28, opacity: 0, force3D: true },
          {
            y: 0,
            opacity: 1,
            force3D: true,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: shell,
              start: 'top 82%',
              end: 'top 32%',
              scrub: 0.35
            }
          }
        );
      }

      if (filmBox) {
        gsap.fromTo(
          filmBox,
          { scale: 0.94, opacity: 0.35, force3D: true },
          {
            scale: 1,
            opacity: 1,
            force3D: true,
            ease: 'none',
            scrollTrigger: {
              trigger: shell,
              start: 'top 85%',
              end: 'top 30%',
              scrub: 0.35
            }
          }
        );
      }
    }

    // C. Outgoing Page Depth Effect (GPU scale + opacity, zero live-video blur)
    if (nextTarget) {
      gsap.fromTo(
        shell,
        { scale: 1, opacity: 1, force3D: true },
        {
          scale: 0.95,
          yPercent: -5,
          opacity: 0.22,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: nextTarget,
            start: 'top 88%',
            end: 'top 18%',
            scrub: 0.35
          }
        }
      );
    }

    // D. Video subtle parallax inside frame
    if (zoomWrap) {
      gsap.fromTo(
        zoomWrap,
        { scale: 1.12, yPercent: -3, force3D: true },
        {
          scale: 1.0,
          yPercent: 3,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: shell,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.45
          }
        }
      );
    }
  });
}
