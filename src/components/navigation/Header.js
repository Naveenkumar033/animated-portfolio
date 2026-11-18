import { toggleAmbientAudio } from '../../utils/audio.js';

export function initHeader() {
  const soundBtn = document.getElementById('soundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      toggleAmbientAudio(soundBtn);
    });
  }

  const clockEl = document.getElementById('liveClock');
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  function updateLiveClock() {
    if (!clockEl || document.hidden) return;
    clockEl.textContent = `${timeFormatter.format(new Date())} in India`;
  }

  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // Switch header ink to light only when over dark sections (#work, #clients)
  // or while over the Hero stage during Night mode (rAF-throttled to avoid scroll jank)
  const header = document.getElementById('siteHeader');
  const heroSection = document.getElementById('heroScrollContainer');
  const aboutSection = document.getElementById('about');
  const darkSections = [document.getElementById('work'), document.getElementById('clients')].filter(Boolean);

  if (header && (darkSections.length > 0 || heroSection)) {
    let ticking = false;
    let lastOnDark = null;

    const updateHeaderContrast = () => {
      ticking = false;
      const probeY = 40;
      const isOverDarkSection = darkSections.some((sec) => {
        const rect = sec.getBoundingClientRect();
        return rect.top <= probeY && rect.bottom >= probeY;
      });
      const isCoveredByAbout = Boolean(aboutSection && aboutSection.getBoundingClientRect().top <= probeY);
      const isOverNightHero = Boolean(
        !isCoveredByAbout &&
        heroSection &&
        heroSection.getAttribute('data-theme') === 'night' &&
        heroSection.getBoundingClientRect().top <= probeY &&
        heroSection.getBoundingClientRect().bottom >= probeY
      );

      const shouldBeDark = isOverDarkSection || isOverNightHero;
      if (shouldBeDark !== lastOnDark) {
        lastOnDark = shouldBeDark;
        header.classList.toggle('on-dark', shouldBeDark);
      }
    };

    const scheduleUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateHeaderContrast);
    };

    updateHeaderContrast();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    window.addEventListener('hero-theme-change', scheduleUpdate);
  }
}
