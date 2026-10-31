import { playSound } from '../utils/audio.js';
import { getLenis } from './scrollAnimations.js';
import { PROJECTS, TESTIMONIALS } from '../data/portfolioData.js';

export function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('closeProjectModalBtn');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalArch = document.getElementById('modalArch');
  const modalFeatures = document.getElementById('modalFeatures');
  const modalTags = document.getElementById('modalTags');

  function openModal(index) {
    playSound('click');
    const p = PROJECTS[index];
    if (!p) return;

    if (modalCategory) modalCategory.textContent = p.category;
    if (modalTitle) modalTitle.textContent = p.title;
    if (modalDesc) modalDesc.textContent = p.desc;
    if (modalArch) modalArch.textContent = p.arch;
    if (modalFeatures) {
      modalFeatures.innerHTML = p.features.map((f) => `<li style="margin-bottom:0.4rem;">${f}</li>`).join('');
    }
    if (modalTags) {
      modalTags.innerHTML = p.tags.map((t) => `<span class="formula-chip" style="color:#111; background:#f1f5f9; border-color:#cbd5e1;">${t}</span>`).join('');
    }

    modal?.classList.add('open');
    const lenis = getLenis();
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    playSound('click');
    modal?.classList.remove('open');
    const lenis = getLenis();
    if (lenis) lenis.start();
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.querySelectorAll('.work-project-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const idx = parseInt(tile.getAttribute('data-project-idx'), 10);
      openModal(idx);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

export function initReviewCarousel() {
  let reviewIdx = 0;
  const quoteEl = document.getElementById('reviewQuote');
  const authorEl = document.getElementById('reviewAuthor');
  const roleEl = document.getElementById('reviewRole');
  const ratingEl = document.getElementById('reviewRating');
  const countEl = document.getElementById('reviewCount');
  const trackFill = document.getElementById('reviewTrackFill');

  function setReview(idx) {
    reviewIdx = (idx + TESTIMONIALS.length) % TESTIMONIALS.length;
    const t = TESTIMONIALS[reviewIdx];

    if (quoteEl) {
      quoteEl.style.opacity = '0';
      setTimeout(() => {
        quoteEl.textContent = t.quote;
        if (authorEl) authorEl.textContent = t.author;
        if (roleEl) roleEl.textContent = t.role;
        if (ratingEl) ratingEl.textContent = t.rating;
        if (countEl) countEl.textContent = `0${reviewIdx + 1}/0${TESTIMONIALS.length}`;
        quoteEl.style.opacity = '1';
      }, 150);
    }

    if (trackFill) {
      trackFill.style.transition = 'none';
      trackFill.style.transform = 'scaleX(0)';
      setTimeout(() => {
        trackFill.style.transition = 'transform 6.5s linear';
        trackFill.style.transform = 'scaleX(1)';
      }, 50);
    }
  }

  document.getElementById('reviewPrevBtn')?.addEventListener('click', () => {
    playSound('click');
    setReview(reviewIdx - 1);
  });
  document.getElementById('reviewNextBtn')?.addEventListener('click', () => {
    playSound('click');
    setReview(reviewIdx + 1);
  });

  setReview(0);
  setInterval(() => {
    setReview(reviewIdx + 1);
  }, 6500);
}

export function initMenuDrawer() {
  const siteMenu = document.getElementById('siteMenu');
  const menuOpenBtn = document.getElementById('menuOpenBtn');
  const menuCloseBtn = document.getElementById('menuCloseBtn');

  function openMenu() {
    playSound('whoosh');
    siteMenu?.classList.add('open');
    const lenis = getLenis();
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    playSound('whoosh');
    siteMenu?.classList.remove('open');
    const lenis = getLenis();
    if (lenis) lenis.start();
    document.body.style.overflow = '';
  }

  menuOpenBtn?.addEventListener('click', openMenu);
  menuCloseBtn?.addEventListener('click', closeMenu);

  document.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-menu-link');
      closeMenu();
      setTimeout(() => {
        window.scrollToSection(target);
      }, 450);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

