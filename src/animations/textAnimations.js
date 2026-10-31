/* ==========================================================================
   ROLLING LETTER FLIP ENGINE
   ========================================================================== */

export function initRollingLetters() {
  document.querySelectorAll('.has-roll').forEach((el) => {
    const text = el.getAttribute('data-roll-text') || el.innerText.trim();
    if (!text) return;

    el.innerHTML = '';
    const wordSpan = document.createElement('span');
    wordSpan.className = 'roll-word';
    wordSpan.setAttribute('aria-label', text);

    text.split('').forEach((char, index) => {
      const letterSpan = document.createElement('span');
      letterSpan.className = 'roll-letter';
      letterSpan.style.transitionDelay = `${index * 0.02}s`;
      const charVisible = char === ' ' ? '&nbsp;' : char;
      letterSpan.innerHTML = `<span>${charVisible}</span><span>${charVisible}</span>`;
      wordSpan.appendChild(letterSpan);
    });

    el.appendChild(wordSpan);
  });
}

