/**
 * Stack Working Model Controller
 * Interactive controls for the live full-stack architecture marquee:
 * WebGL & GSAP (Frontend) → Java Spring Boot (Backend) → PostgreSQL (Database) → Google Cloud (Cloud Infrastructure).
 */
export function initStackWorkingModel() {
  const marquee = document.querySelector('.clients-strip .marquee-strip');
  if (!marquee) return;

  const badges = marquee.querySelectorAll('.client-badge-item:not(.stack-badge-connector)');

  badges.forEach((badge) => {
    badge.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    badge.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  });
}
