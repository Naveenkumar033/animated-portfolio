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
  window.addEventListener('resize', updateLetterFractions);

  const beat = (val, [min, max]) => {
    if (max <= min) return val >= max ? 1 : 0;
    const v = (val - min) / (max - min);
    return v < 0 ? 0 : v > 1 ? 1 : v;
  };

  const trigger = ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.1,
    invalidateOnRefresh: true,
    onRefresh: updateLetterFractions,
    onUpdate: (self) => {
      const p = self.progress;

      // 1. Hands Slide Out & MacBook
      const handP = beat(p, [0.04, 0.28]);
      if (handLeft) {
        if (p <= 0.04) {
          handLeft.style.transform = 'translate(0px, 0px) rotate(1.5deg)';
          handLeft.style.opacity = '1';
        } else {
          handLeft.style.transform = `translate(${-55 * handP}vw, ${25 * handP}vh) scale(${1 - 0.4 * handP}) rotate(${2 - 10 * handP}deg)`;
          handLeft.style.opacity = String(Math.max(0, 1 - handP * 1.2));
        }
      }
      if (handRight) {
        if (p <= 0.04) {
          handRight.style.transform = 'translate(0px, 0px) rotate(-4deg)';
          handRight.style.opacity = '1';
        } else {
          handRight.style.transform = `translate(${55 * handP}vw, ${-25 * handP}vh) scale(${1 - 0.4 * handP}) rotate(${-4 + 10 * handP}deg)`;
          handRight.style.opacity = String(Math.max(0, 1 - handP * 1.2));
        }
      }

      // 2. Layer 1 (Headline, Bio, Arrow, Sky Dial) Fade Out
      const textOutP = beat(p, [0.04, 0.20]);
      if (layer1) {
        if (p <= 0.04) {
          layer1.style.opacity = '1';
          layer1.style.visibility = 'visible';
          layer1.style.transform = 'translateY(0px)';
        } else {
          const op = Math.max(0, 1 - textOutP);
          layer1.style.opacity = String(op);
          layer1.style.visibility = op <= 0.001 ? 'hidden' : 'visible';
          layer1.style.transform = `translateY(${-40 * textOutP}px)`;
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

        // 4. Sequential Name Reveal in direct lockstep with character body position
        // Layer 2 fades in between [0.38, 0.42] and fades out between [0.92, 0.96]
        const nameInP = beat(p, [0.38, 0.42]);
        const nameOutP = beat(p, [0.92, 0.96]);
        const layer2Opacity = nameInP * (1 - nameOutP);

        if (layer2) {
          layer2.style.opacity = String(layer2Opacity);
        }

        const bodyFrac = heroStageScene.getCharacterScreenFraction();

        nameSpans.forEach((span, idx) => {
          if (p < 0.38 || layer2Opacity <= 0) {
            span.style.opacity = '0';
            return;
          }
          const letterFrac = letterFractions[idx] ?? 1;
          // Letter reveals ONLY once character's back has crossed to the right of the letter's center
          const isRevealed = bodyFrac >= letterFrac;
          span.style.opacity = isRevealed ? '1' : '0';
        });
      }

      // 5. Layer 3 ("Let's make it simple.") Fade In & Out before the curl
      const layer3InP = beat(p, [0.84, 0.90]);
      const layer3OutP = beat(p, [0.95, 0.99]);
      if (layer3) {
        if (p < 0.82) {
          layer3.style.opacity = '0';
        } else {
          const op = Math.max(0, layer3InP - layer3OutP);
          layer3.style.opacity = String(op);
          layer3.style.transform = `translateY(${20 * (1 - layer3InP)}px)`;
        }
      }

      // 6. Hero Stage visibility and clipping handled by pageTurnController
      stage.style.opacity = '1';
    }
  });

  return trigger;
}
