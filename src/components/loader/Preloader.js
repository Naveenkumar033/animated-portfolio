import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initPreloader(onComplete) {
  const preloader = document.getElementById('preloader');
  const preloaderDigits = document.getElementById('preloaderDigits');
  const preloaderBar = document.getElementById('preloaderBar');

  let loadProgress = 0;
  const loadStartTime = performance.now();
  const loadDuration = 1200;

  function tick(now) {
    const elapsed = now - loadStartTime;
    loadProgress = Math.min(elapsed / loadDuration, 1);
    const count = Math.floor(loadProgress * 100);

    if (preloaderDigits) {
      preloaderDigits.textContent = count.toString().padStart(3, '0');
    }
    if (preloaderBar) {
      preloaderBar.style.width = `${count}%`;
    }

    if (loadProgress < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        preloader?.classList.add('loaded');
        document.body.style.overflow = '';
        document.querySelectorAll('#heroLayer1 .line-mask').forEach((m) => m.classList.add('revealed'));
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
        if (onComplete) onComplete();
      }, 180);
    }
  }

  requestAnimationFrame(tick);
}

