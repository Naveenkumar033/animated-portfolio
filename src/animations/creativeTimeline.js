import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCreativeTimeline(scene) {
  const introSec = document.getElementById('creativeIntro');
  const wedge = document.getElementById('creativeBandWedge');
  const canvas = document.getElementById('creativeCharCanvas');
  if (!introSec) return;

  // Reveal 3D character smoothly as the section slides over the desk,
  // creating a continuous jump transition from the Why desk scene
  ScrollTrigger.create({
    trigger: introSec,
    start: 'top 50%',
    end: 'top top',
    scrub: true,
    onUpdate: (self) => {
      if (canvas) {
        canvas.style.opacity = self.progress.toFixed(3);
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
        // Olive green wedge banner slides up from translateY(105%) to translateY(0%) during dive phase (p: 0.45 -> 1.0)
        if (p <= 0.45) {
          wedge.style.transform = 'translateY(105%)';
        } else {
          const t = Math.min(1, Math.max(0, (p - 0.45) / 0.55));
          const ease = t * t * (3 - 2 * t);
          const y = (1 - ease) * 105;
          wedge.style.transform = `translateY(${y.toFixed(2)}%)`;
        }
      }
    }
  });
}

