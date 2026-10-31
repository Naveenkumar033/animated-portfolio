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
}

