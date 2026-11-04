// Loading screen progress bar.
import { $ } from '../utils/dom.js';

const loadBar = $('#loadBar'), loadPct = $('#loadPct');

let loadP = 0;

function setLoad(p){ loadP = Math.max(loadP, p); loadBar.style.transform = `scaleX(${loadP/100})`; loadPct.textContent = `GROWING ${Math.round(loadP)}%`; }

export { setLoad };
