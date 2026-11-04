// Sticker icons for the ritual cards.
const ICONS = {
  leaf:'<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19l9-9"/>',
  lungs:'<path d="M12 4v8"/><path d="M12 10c-1 0-2 1-3 1.5-2 1-4 3-4 6.5 0 1 .8 2 2 2 2 0 5-1 5-4z"/><path d="M12 10c1 0 2 1 3 1.5 2 1 4 3 4 6.5 0 1-.8 2-2 2-2 0-5-1-5-4z"/>',
  lotus:'<path d="M12 18c-3-2-4-5-4-8 2 1 4 3 4 8z"/><path d="M12 18c3-2 4-5 4-8-2 1-4 3-4 8z"/><path d="M12 18c-1-4 0-8 0-11 0 3 1 7 0 11z"/><path d="M4 16c3 2 5 2 8 2s5 0 8-2"/>',
  shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  spark:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'
};

const icon = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

export { icon };
