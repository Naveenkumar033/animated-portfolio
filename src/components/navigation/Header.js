import { toggleAmbientAudio } from '../../utils/audio.js';

export function initHeader() {
  const soundBtn = document.getElementById('soundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      toggleAmbientAudio(soundBtn);
    });
  }

  function updateLiveClock() {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    const timeString = new Intl.DateTimeFormat('en-GB', options).format(now);
    clockEl.textContent = `${timeString} in India`;
  }

  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // Switch header ink to light only when over dark sections (#work, #clients)
  // or while over the Hero stage during Night mode
  const header = document.getElementById('siteHeader');
  const heroSection = document.getElementById('heroScrollContainer');
  const aboutSection = document.getElementById('about');
  const darkSections = [document.getElementById('work'), document.getElementById('clients')].filter(Boolean);
  if (header && (darkSections.length > 0 || heroSection)) {
    const updateHeaderContrast = () => {
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
      header.classList.toggle('on-dark', isOverDarkSection || isOverNightHero);
    };
    updateHeaderContrast();
    window.addEventListener('scroll', updateHeaderContrast, { passive: true });
    window.addEventListener('resize', updateHeaderContrast, { passive: true });
    window.addEventListener('hero-theme-change', updateHeaderContrast);
  }
}

