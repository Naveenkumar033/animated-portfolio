// Small status message at the bottom of the screen.
import { $ } from '../utils/dom.js';

function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400); }

export { toast };
