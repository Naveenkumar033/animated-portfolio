// Sticker icons for the product story cards.
const ICONS = {
  leaf:'<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19l9-9"/>',
  lungs:'<path d="M12 4v8"/><path d="M12 10c-1 0-2 1-3 1.5-2 1-4 3-4 6.5 0 1 .8 2 2 2 2 0 5-1 5-4z"/><path d="M12 10c1 0 2 1 3 1.5 2 1 4 3 4 6.5 0 1-.8 2-2 2-2 0-5-1-5-4z"/>',
  lotus:'<path d="M12 18c-3-2-4-5-4-8 2 1 4 3 4 8z"/><path d="M12 18c3-2 4-5 4-8-2 1-4 3-4 8z"/><path d="M12 18c-1-4 0-8 0-11 0 3 1 7 0 11z"/><path d="M4 16c3 2 5 2 8 2s5 0 8-2"/>',
  shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  spark:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  flower:'<circle cx="12" cy="10" r="2.2"/><path d="M12 7.8C10 4 14 4 12 7.8M14.2 10c3.8-2 3.8 2 0 0M12 12.2c2 3.8-2 3.8 0 0M9.8 10C6 12 6 8 9.8 10"/><path d="M12 13v8M12 18c2-2 4-2 5-1"/>',
  foot:'<path d="M9 21c-2.5 0-3.5-2-3.5-4.5S7 11 7 8.5 8 5 10 5s2.5 2 2.5 4-1 4-1 6 1 2 1 3-1 3-3.5 3z"/><circle cx="15" cy="5" r="1.1"/><circle cx="17.2" cy="7.2" r="1"/><circle cx="18.2" cy="10" r=".9"/><circle cx="13.4" cy="3.2" r="1.2"/>',
  drop:'<path d="M12 3c3.5 4.5 6 7.6 6 10.8a6 6 0 0 1-12 0C6 10.6 8.5 7.5 12 3z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.5"/>'
};

const icon = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

export { icon };
