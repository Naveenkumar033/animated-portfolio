/**
 * Page Turn Controller
 * Curl animation completely removed as requested.
 * Enables natural, smooth document scrolling between Hero, Why Custom, and Work sections.
 */

export function initPageTurn() {
  // Ensure any dynamically created or existing curl canvas is completely removed
  const canvas = document.getElementById('pageCurlCanvas');
  if (canvas) {
    canvas.style.display = 'none';
    canvas.remove();
  }

  const heroStage = document.getElementById('heroStage');
  if (heroStage) {
    heroStage.style.clipPath = '';
    heroStage.style.webkitClipPath = '';
    heroStage.style.position = '';
    heroStage.style.top = '';
    heroStage.style.left = '';
    heroStage.style.width = '';
    heroStage.style.height = '';
    heroStage.style.zIndex = '';
    heroStage.style.visibility = '';
    heroStage.style.display = '';
  }

  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    aboutSection.style.position = '';
    aboutSection.style.top = '';
    aboutSection.style.left = '';
    aboutSection.style.width = '';
    aboutSection.style.height = '';
    aboutSection.style.zIndex = '';
    aboutSection.style.visibility = '';
    aboutSection.style.display = '';
  }

  return null;
}

export function getPageCurl() {
  return null;
}
