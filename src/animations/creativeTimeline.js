import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCreativeTimeline(scene) {
  const introSec = document.getElementById('creativeIntro');
  const wedge = document.getElementById('creativeBandWedge');
  const canvas = document.getElementById('creativeCharCanvas');
  if (!introSec) return;

  // Reveal 3D character smoothly as the section locks into place at top: 0,
  // preventing any cut-off character rendering while entering from below
  ScrollTrigger.create({
    trigger: introSec,
    start: 'top bottom',
    end: 'top top',
    scrub: true,
    onUpdate: (self) => {
      if (canvas) {
        const alpha = self.progress > 0.85 ? 1 : Math.max(0, (self.progress - 0.6) / 0.25);
        canvas.style.opacity = alpha.toFixed(3);
      }
    },
    onEnterBack: () => {
      if (canvas) canvas.style.opacity = '1';
    },
    onLeaveBack: () => {
      if (canvas) canvas.style.opacity = '0';
    }
  });

  ScrollTrigger.create({
    trigger: introSec,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress;
      if (canvas && parseFloat(canvas.style.opacity) < 1) {
        canvas.style.opacity = '1';
      }
      if (scene && typeof scene.updateScrub === 'function') {
        scene.updateScrub(p);
      }
      if (wedge) {
        // Olive green wedge banner slides up from translateY(105%) to translateY(0%) during dive phase (p: 0.40 -> 1.0)
        if (p <= 0.40) {
          wedge.style.transform = 'translateY(105%)';
        } else {
          const t = Math.min(1, Math.max(0, (p - 0.40) / 0.60));
          const ease = t * t * (3 - 2 * t);
          const y = (1 - ease) * 105;
          wedge.style.transform = `translateY(${y.toFixed(2)}%)`;
        }
      }
    }
  });
}

