import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroTimeline(heroStageScene) {
  const container = document.getElementById('heroScrollContainer');
  const stage = document.getElementById('heroStage');
  const handLeft = document.getElementById('heroHandLeft');
  const handRight = document.getElementById('heroHandRight');
  const layer1 = document.getElementById('heroLayer1');
  const layer2 = document.getElementById('heroLayer2');
  const layer3 = document.getElementById('heroLayer3');
  const bio = document.getElementById('heroBio');
  const arrow = document.getElementById('heroArrow');
  const lighting = document.getElementById('heroLighting');
  const nameSpans = Array.from(document.querySelectorAll('#heroScrollName span'));
  const spanState = new Array(nameSpans.length).fill(false);

  if (!container || !stage) return null;

  let letterFractions = [];
  function updateLetterFractions() {
    const screenW = window.innerWidth || 1;
    letterFractions = nameSpans.map((span) => {
      if (!span) return 1;
      const rect = span.getBoundingClientRect();
      return (rect.left + rect.width / 2) / screenW;
    });
  }
  updateLetterFractions();
  window.addEventListener('resize', updateLetterFractions, { passive: true });

  const beat = (val, [min, max]) => {
    if (max <= min) return val >= max ? 1 : 0;
    const v = (val - min) / (max - min);
    return v < 0 ? 0 : v > 1 ? 1 : v;
  };

  const trigger = ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.08,
    invalidateOnRefresh: true,
    onRefresh: updateLetterFractions,
    onUpdate: (self) => {
      const p = Math.min(1, self.progress / (270 / 370));

      // 1. Hands Slide Out & MacBook (GPU translate3d)
      const handP = beat(p, [0.04, 0.28]);
      if (handLeft) {
        if (p <= 0.04) {
          handLeft.style.transform = 'translate3d(0px, 0px, 0) rotate(1.5deg)';
          handLeft.style.opacity = '1';
        } else {
          handLeft.style.transform = `translate3d(${(-55 * handP).toFixed(2)}vw, ${(25 * handP).toFixed(2)}vh, 0) scale(${(1 - 0.4 * handP).toFixed(3)}) rotate(${(2 - 10 * handP).toFixed(2)}deg)`;
          handLeft.style.opacity = String(Math.max(0, 1 - handP * 1.2));
        }
      }
      if (handRight) {
        if (p <= 0.04) {
          handRight.style.transform = 'translate3d(0px, 0px, 0) rotate(-4deg)';
          handRight.style.opacity = '1';
        } else {
          handRight.style.transform = `translate3d(${(55 * handP).toFixed(2)}vw, ${(-25 * handP).toFixed(2)}vh, 0) scale(${(1 - 0.4 * handP).toFixed(3)}) rotate(${(-4 + 10 * handP).toFixed(2)}deg)`;
          handRight.style.opacity = String(Math.max(0, 1 - handP * 1.2));
        }
      }

      // 2. Layer 1 (Headline, Bio, Arrow, Sky Dial) Fade Out
      const textOutP = beat(p, [0.04, 0.20]);
      if (layer1) {
        if (p <= 0.04) {
          layer1.style.opacity = '1';
          layer1.style.visibility = 'visible';
          layer1.style.transform = 'translate3d(0, 0px, 0)';
        } else {
          const op = Math.max(0, 1 - textOutP);
          layer1.style.opacity = String(op);
          layer1.style.visibility = op <= 0.001 ? 'hidden' : 'visible';
          layer1.style.transform = `translate3d(0, ${(-40 * textOutP).toFixed(1)}px, 0)`;
        }
      }
      if (heroStageScene && heroStageScene.isIntroDone) {
        const op = p <= 0.04 ? 1 : Math.max(0, 1 - textOutP * 1.5);
        if (bio) bio.style.opacity = String(op);
        if (arrow) arrow.style.opacity = String(op);
        if (lighting) lighting.style.opacity = String(op);
      } else if (p > 0.04) {
        const op = Math.max(0, 1 - textOutP * 1.5);
        if (bio) bio.style.opacity = String(op);
        if (arrow) arrow.style.opacity = String(op);
        if (lighting) lighting.style.opacity = String(op);
      }

      // 3. Delegate character & 3D desk positioning to HeroStageScene
      if (heroStageScene) {
        heroStageScene.updateScrub(p);

        // 4. Sequential Name Reveal — full "NAVEEN KUMAR E" completes as cartoon finishes crossing (p = 0.78),
        // holds briefly so the full name is readable, then fades out cleanly BEFORE Layer 3
        const nameInP = beat(p, [0.28, 0.34]);
        const nameOutP = beat(p, [0.82, 0.88]);
        const layer2Opacity = nameInP * (1 - nameOutP);

        if (layer2) {
          layer2.style.opacity = String(layer2Opacity);
          layer2.style.visibility = layer2Opacity > 0.001 ? 'visible' : 'hidden';
        }

        const bodyFrac = heroStageScene.getCharacterScreenFraction();
        const showAny = p >= 0.28 && layer2Opacity > 0;
        const allRevealed = p >= 0.76;

        for (let idx = 0; idx < nameSpans.length; idx++) {
          const isRevealed = showAny && (allRevealed || bodyFrac >= (letterFractions[idx] ?? 1));
          if (spanState[idx] !== isRevealed) {
            spanState[idx] = isRevealed;
            nameSpans[idx].style.opacity = isRevealed ? '1' : '0';
          }
        }
      }

      // 5. Layer 3 ("Let's make it simple.") — appears ONLY AFTER cartoon & full "NAVEEN KUMAR E" finish
      const layer3InP = beat(p, [0.89, 0.96]);
      if (layer3) {
        if (p < 0.885) {
          layer3.style.opacity = '0';
          layer3.style.visibility = 'hidden';
        } else {
          const op = layer3InP;
          layer3.style.opacity = String(op);
          layer3.style.visibility = op > 0.001 ? 'visible' : 'hidden';
          layer3.style.transform = `translate3d(0, ${(20 * (1 - layer3InP)).toFixed(1)}px, 0)`;
        }
      }

      stage.style.opacity = '1';
    }
  });

  return trigger;
}
