import { playSound } from '../utils/audio.js';
import { getLenis } from './scrollAnimations.js';
import { PROJECTS, TESTIMONIALS } from '../data/portfolioData.js';

let globalOpenModal = null;
export function openProjectModal(index) {
  if (globalOpenModal) globalOpenModal(index);
}

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
  globalOpenModal = openModal;

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

export function initShowcaseReel() {
  const container = document.getElementById('portfolioShowcaseWrap');
  if (!container || container.dataset.showcaseInit === 'true') return;
  container.dataset.showcaseInit = 'true';

  let currentIdx = 0;
  let autoTimer = null;
  let isHovered = false;
  let pendingTimeout = null;

  const imgEl = document.getElementById('showcaseImage');
  const catEl = document.getElementById('showcaseCategory');
  const titleEl = document.getElementById('showcaseTitle');
  const taglineEl = document.getElementById('showcaseTagline');
  const archEl = document.getElementById('showcaseArch');
  const tagsEl = document.getElementById('showcaseTags');
  const urlEl = document.getElementById('showcaseUrlText');
  const counterEl = document.getElementById('showcaseCounter');
  const progressFill = document.getElementById('showcaseProgressFill');
  const inspectBtn = document.getElementById('showcaseInspectBtn');
  const tabBtns = Array.from(document.querySelectorAll('[data-showcase-idx]'));

  function setProject(idx, userInitiated = false) {
    if (userInitiated) playSound('click');
    currentIdx = (idx + PROJECTS.length) % PROJECTS.length;
    const p = PROJECTS[currentIdx];
    if (!p) return;

    tabBtns.forEach((btn, i) => {
      const active = i === currentIdx;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (counterEl) {
      counterEl.textContent = `0${currentIdx + 1} / 0${PROJECTS.length}`;
    }

    if (inspectBtn) {
      inspectBtn.setAttribute('data-project-idx', currentIdx);
    }

    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    if (imgEl) {
      imgEl.style.opacity = '0';
      pendingTimeout = setTimeout(() => {
        imgEl.src = p.image;
        imgEl.alt = `${p.title} project preview`;
        if (catEl) catEl.textContent = p.category;
        if (titleEl) titleEl.textContent = p.title;
        if (taglineEl) taglineEl.textContent = p.tagline;
        if (urlEl) urlEl.textContent = `codeofnaveen.dev/systems/${p.id}`;
        if (archEl) {
          archEl.innerHTML = `<span class="formula-chip" style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:#fff; font-size:0.75rem;">${p.arch}</span>`;
        }
        if (tagsEl) {
          tagsEl.innerHTML = p.tags.slice(0, 4).map((t) => `<span>${t}</span>`).join('');
        }
        imgEl.style.opacity = '1';
        pendingTimeout = null;
      }, 150);
    }

    resetProgressBar();
  }

  function resetProgressBar() {
    if (progressFill) {
      progressFill.style.transition = 'none';
      progressFill.style.transform = 'scaleX(0)';
      setTimeout(() => {
        if (!isHovered) {
          progressFill.style.transition = 'transform 6s linear';
          progressFill.style.transform = 'scaleX(1)';
        }
      }, 50);
    }
  }

  function startAutoCycle() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (!isHovered) {
        setProject(currentIdx + 1);
      }
    }, 6000);
  }

  container.addEventListener('mouseenter', () => {
    isHovered = true;
    if (progressFill) {
      progressFill.style.transition = 'none';
    }
  });

  container.addEventListener('mouseleave', () => {
    isHovered = false;
    resetProgressBar();
  });

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-showcase-idx'), 10);
      setProject(idx, true);
      startAutoCycle();
    });
  });

  document.getElementById('showcasePrevBtn')?.addEventListener('click', () => {
    setProject(currentIdx - 1, true);
    startAutoCycle();
  });

  document.getElementById('showcaseNextBtn')?.addEventListener('click', () => {
    setProject(currentIdx + 1, true);
    startAutoCycle();
  });

  inspectBtn?.addEventListener('click', () => {
    openProjectModal(currentIdx);
  });

  setProject(0);
  startAutoCycle();
}

