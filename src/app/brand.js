// Loads the logo parts so the 3D jar labels can print the real emblem and wordmark.
import emblemUrl from '../assets/logo/logo-emblem.webp';
import wordUrl from '../assets/logo/logo-word.webp';
import wordLightUrl from '../assets/logo/logo-word-light.webp';
import { BRAND } from './state.js';

const load = async src => { const im = new Image(); im.src = src; await im.decode(); return im; };

async function loadBrand(){
  try { [BRAND.em, BRAND.word, BRAND.wordLight] = await Promise.all([emblemUrl, wordUrl, wordLightUrl].map(load)); }
  catch(e){ console.warn('logo not available for labels', e); }
}

export { loadBrand };
