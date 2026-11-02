import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCreativeTimeline(scene) {
  const introSec = document.getElementById('creativeIntro');
  const wedge = document.getElementById('creativeBandWedge');
  if (!introSec) return;

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
        // Olive green wedge banner slides up from translateY(105%) to translateY(0%) during dive phase (p: 0.42 -> 1.0)
        if (p <= 0.4) {
          wedge.style.transform = 'translateY(105%)';
        } else {
          const t = Math.min(1, Math.max(0, (p - 0.4) / 0.6));
          const ease = t * t * (3 - 2 * t);
          const y = (1 - ease) * 105;
          wedge.style.transform = `translateY(${y.toFixed(2)}%)`;
        }
      }
    }
  });
}
