/* ==========================================================================
   NAVEEN KUMAR E — CREATIVE DEVELOPER PORTFOLIO
   High-Fidelity WebGL & 3D Interactive Architecture
   ========================================================================== */

import './style.css';
import { initializeApp } from './app/initializeApp.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
  });
} else {
  initializeApp();
}
