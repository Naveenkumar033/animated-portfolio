import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from './scrollAnimations.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Process Film Section: Horizontal Parallax Scrolling Animation
 * Pins the section and translates the process steps track horizontally with
 * multi-layer depth parallax (floating numbers, windowed video parallax, and progressive HUD).
 */
export function initProcessAnimations() {
  const processSection = document.getElementById('experience');
  if (!processSection) return;

  const track = processSection.querySelector('.process-stack-list');
  const shells = gsap.utils.toArray('.process-step-shell', processSection);
  const progressBar = document.getElementById('processProgressFill');
  const progressTrack = processSection.querySelector('.process-progress-track');
  const activeIndexEl = document.getElementById('processActiveIndex');
  const activeStageEl = document.getElementById('processActiveStage');
  const videos = shells.map((s) => s.querySelector('video')).filter(Boolean);

  if (!shells.length || !track) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Debounced video playback to prevent sync decode spikes during fast scrubbing
  const playTimers = new WeakMap();
  const schedulePlay = (vid) => {
    if (!vid || document.hidden) return;
    clearTimeout(playTimers.get(vid));
    playTimers.set(
      vid,
      setTimeout(() => {
        vid.play().catch(() => {});
      }, 120)
    );
  };
  const cancelAndPause = (vid) => {
    if (!vid) return;
    clearTimeout(playTimers.get(vid));
    if (!vid.paused) vid.pause();
  };

  if (prefersReducedMotion) {
    // Accessible fallback: normal horizontal scroll or simple auto-play
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
        { threshold: 0.2 }
      );
      videos.forEach((v) => vidObserver.observe(v));
    }
    return;
  }

  // Calculate total horizontal travel distance
  const getDistance = () => {
    return Math.max(0, track.scrollWidth - window.innerWidth);
  };

  let activeIndex = 0;

  // Master Horizontal Scroll Timeline with Pinning
  const pinTl = gsap.timeline({
    scrollTrigger: {
      id: 'processHorizontalPin',
      trigger: processSection,
      pin: true,
      start: 'top top',
      end: () => `+=${Math.max(window.innerHeight * 2.2, getDistance() + window.innerHeight * 0.7)}`,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;

        // 1. Fill bottom progress HUD track
        if (progressBar) {
          progressBar.style.transform = `scaleX(${p})`;
        }

        // 2. Identify the active slide centered in the viewport
        const screenCenter = window.innerWidth / 2;
        let closestIdx = 0;
        let minDistance = Infinity;

        shells.forEach((shell, idx) => {
          const rect = shell.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(cardCenter - screenCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestIdx = idx;
          }
        });

        if (closestIdx !== activeIndex) {
          activeIndex = closestIdx;
          const targetShell = shells[activeIndex];
          const stepLabel = targetShell ? targetShell.getAttribute('data-step-label') : `STEP 0${activeIndex + 1}`;

          if (activeIndexEl) {
            activeIndexEl.textContent = `0${activeIndex + 1} / 0${shells.length}`;
          }
          if (activeStageEl) {
            activeStageEl.textContent = stepLabel;
          }

          // Play only active video, pause all others for silky 60fps performance
          videos.forEach((vid, i) => {
            if (i === activeIndex) {
              schedulePlay(vid);
            } else {
              cancelAndPause(vid);
            }
          });
        }
      },
      onLeave: () => {
        videos.forEach((v) => cancelAndPause(v));
      },
      onLeaveBack: () => {
        videos.forEach((v) => cancelAndPause(v));
      }
    }
  });

  // 1. Primary Track Horizontal Translation
  pinTl.to(
    track,
    {
      x: () => -getDistance(),
      ease: 'none',
      force3D: true
    },
    0
  );

  // 2. Multi-Layer Parallax Effects
  shells.forEach((shell) => {
    const num = shell.querySelector('.process-step-num');
    const copy = shell.querySelector('.process-step-copy');
    const filmBox = shell.querySelector('.step-film-box');
    const zoomWrap = shell.querySelector('.step-film-zoom-wrap');

    // Layer A: Giant Floating Step Number Parallax
    if (num) {
      pinTl.fromTo(
        num,
        { x: 55, force3D: true },
        { x: -55, force3D: true, ease: 'none' },
        0
      );
    }

    // Layer B: Subtle Forward Copy Parallax
    if (copy) {
      pinTl.fromTo(
        copy,
        { x: 25, force3D: true },
        { x: -25, force3D: true, ease: 'none' },
        0
      );
    }

    // Layer C: Video Frame Depth Parallax
    if (zoomWrap) {
      pinTl.fromTo(
        zoomWrap,
        { xPercent: -14, scale: 1.1, force3D: true },
        { xPercent: 14, scale: 1.05, force3D: true, ease: 'none' },
        0
      );
    }

    if (filmBox) {
      pinTl.fromTo(
        filmBox,
        { scale: 0.96, force3D: true },
        { scale: 1.0, force3D: true, ease: 'none' },
        0
      );
    }
  });

  // 3. Interactive Click on Progress Track to Jump Directly to Any Step
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const st = ScrollTrigger.getById('processHorizontalPin');
      if (st) {
        const targetScroll = st.start + clickRatio * (st.end - st.start);
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(targetScroll, { duration: 1.1 });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }
    });
  }

  // Refresh on resize to recalculate horizontal distances
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  }, { passive: true });
}
