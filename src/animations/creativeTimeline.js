import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCreativeTimeline(scene) {
  const introSec = document.getElementById('creativeIntro');
  const wedge = document.getElementById('creativeBandWedge');
  const canvas = document.getElementById('creativeCharCanvas');
  if (!introSec) return;

  // Ensure 3D character canvas is visible inside pinned section
  if (canvas) {
    canvas.style.opacity = '1';
    canvas.style.visibility = 'visible';
  }

  // 1. Entrance Touchdown: Character lands as the section slides up over the desk
  ScrollTrigger.create({
    trigger: introSec,
    start: 'top bottom',
    end: 'top top',
    scrub: 0.2,
    onUpdate: (self) => {
      if (scene && typeof scene.updateEntrance === 'function') {
        scene.updateEntrance(self.progress);
      }
    }
  });

  // 2. Pinned Sequence: Standing pose in center of "Creative Developer", then dive over equalizer wedge
  ScrollTrigger.create({
    trigger: introSec,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress;
      if (scene && typeof scene.updateScrub === 'function') {
        scene.updateScrub(p);
      }
      if (wedge) {
        // Olive green wedge banner slides up during dive phase (p: 0.38 -> 1.0)
        if (p <= 0.38) {
          wedge.style.transform = 'translateY(105%)';
        } else {
          const t = Math.min(1, Math.max(0, (p - 0.38) / 0.62));
          const ease = t * t * (3 - 2 * t);
          const y = (1 - ease) * 105;
          wedge.style.transform = `translateY(${y.toFixed(2)}%)`;
        }
      }
    }
  });
}

