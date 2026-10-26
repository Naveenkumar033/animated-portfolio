import Lenis from 'lenis';

/* ==========================================================================
   NAVEEN KUMAR E — PORTFOLIO CLIENT LOGIC
   ========================================================================== */

// 1. Initialize Lenis Smooth Scrolling (respecting prefers-reduced-motion)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

if (!prefersReducedMotion) {
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } catch (err) {
    console.warn('Lenis smooth scrolling fallback to native scroll', err);
  }
}

// 2. Cinematic Preloader Counter (0 to 100)
const preloader = document.getElementById('preloader');
const preloaderCounter = document.getElementById('preloaderCounter');
const preloaderBar = document.getElementById('preloaderBar');
const preloaderStatus = document.getElementById('preloaderStatus');

const statusMessages = [
  'INITIALIZING WORKSPACE...',
  'FETCHING ARCHITECTURE SPECS...',
  'COMPOSING DISPLAY MATRICES...',
  'PREPARING SHOWCASE...',
  'SYSTEM READY.'
];

let count = 0;
const duration = prefersReducedMotion ? 100 : 1600; // Fast and cinematic
const stepTime = Math.max(10, Math.floor(duration / 100));

const counterInterval = setInterval(() => {
  count += 1;
  if (count <= 100) {
    if (preloaderCounter) {
      preloaderCounter.textContent = count < 10 ? `0${count}` : `${count}`;
    }
    if (preloaderBar) {
      preloaderBar.style.width = `${count}%`;
    }

    // Update status text at milestones
    if (count === 20 && preloaderStatus) preloaderStatus.textContent = statusMessages[1];
    if (count === 50 && preloaderStatus) preloaderStatus.textContent = statusMessages[2];
    if (count === 80 && preloaderStatus) preloaderStatus.textContent = statusMessages[3];
    if (count === 98 && preloaderStatus) preloaderStatus.textContent = statusMessages[4];
  } else {
    clearInterval(counterInterval);
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('loaded');
        document.body.style.overflow = 'auto';
        initHeroReveals();
      }
    }, 200);
  }
}, stepTime);

// 3. Staggered Hero Reveal Trigger
function initHeroReveals() {
  const heroChunks = document.querySelectorAll('.hero-name-chunk');
  heroChunks.forEach((chunk, index) => {
    chunk.style.transition = `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.15}s, opacity 0.8s ease ${0.1 + index * 0.15}s`;
    chunk.style.transform = 'translateY(0)';
    chunk.style.opacity = '1';
  });
}

// 4. Fixed Navigation Scroll Behavior
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Add background blur and border on scroll
  if (scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active section highlighting
  let currentSectionId = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 140;
    const sectionHeight = section.offsetHeight;
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSectionId}`) {
      link.classList.add('active');
    }
  });
}, { passive: true });

// 5. Smooth Anchor Scrolling via Lenis
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || !targetId) return;
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      e.preventDefault();
      closeMobileMenu();

      if (lenis) {
        lenis.scrollTo(targetElement, { offset: -60, duration: 1.2 });
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// 6. Mobile Drawer Toggle
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMobileMenu() {
  const isOpen = mobileMenu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  menuToggle.classList.add('open');
  menuToggle.setAttribute('aria-expanded', 'true');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

menuToggle.addEventListener('click', toggleMobileMenu);

// 7. Intersection Observer for Scroll Reveals
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach((el) => revealObserver.observe(el));

// 8. Project Detail Modal Data & Logic
const projectsData = {
  agroequip: {
    title: 'AgroEquipAI',
    category: 'AI-Assisted Smart Agriculture',
    banner: '/assets/images/project-agroequip.jpg',
    description: 'An agriculture-focused mobile application designed to empower farmers by providing seamless digital discovery and flexible rental booking of agricultural equipment, tractors, and harvesters from regional machinery owners.',
    architecture: `
      <div class="architecture-callout" style="margin-top: 0.5rem;">
        <span class="arch-label">System Architecture Model</span>
        <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.5; margin-top: 0.25rem;">
          Mobile Client (React Native + Expo) &rarr; REST API (Node.js &amp; Express.js) &rarr; Persistent Document Store (MongoDB Atlas) with AsyncStorage local state management.
        </div>
      </div>
    `,
    features: [
      'Dual-role authentication flow separating Farmer (renter) and Equipment Owner interfaces.',
      'Secure telephone OTP authentication and persisted session state with AsyncStorage.',
      'Multilingual interface localization supporting English and major Indian regional dialects.',
      'Interactive equipment catalog with real-time availability calendar, filter by horsepower/model, and booking confirmation.',
      'Dedicated Equipment Owner console for listing tractors, managing pricing rates, and updating machinery status.',
      'RESTful CRUD endpoints handling booking requests, cancellations, and history.',
      'Planned AI telemetry pipeline for weather forecasts and predictive machinery recommendations.'
    ],
    techStack: ['React Native', 'Expo', 'Node.js', 'Express.js', 'MongoDB', 'React Navigation', 'AsyncStorage', 'REST APIs']
  },
  crm: {
    title: 'Multi-Tenant Sales & Calling Platform',
    category: 'CRM • Enterprise Software',
    banner: '/assets/images/project-crm.jpg',
    description: 'A robust multi-tenant sales and communications platform built around absolute tenant isolation, strict role-based access permissions, and feature-level entitlements tailored for sales calling teams.',
    architecture: `
      <div class="architecture-callout" style="margin-top: 0.5rem;">
        <span class="arch-label">Core Architectural Invariant</span>
        <code class="arch-formula" style="font-size: 0.92rem; display: block; margin: 0.25rem 0;">Access = Tenant Access + Feature Enabled + Role Permission</code>
        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 0.35rem;">
          Every database query, API invocation, and client UI route is strictly bounded by TenantId isolation and audited against active organizational feature flags and role matrices.
        </p>
      </div>
    `,
    features: [
      'Tenant-aware authentication & authorization with strict database-level separation.',
      'Hierarchical Role-Based Access Control (RBAC) governing Admins, Managers, and Sales Call Reps.',
      'Feature-level dynamic entitlements for modular billing and tenant tier differentiation.',
      'Complete Sales Pipeline with Kanban boards, deal stages, and win/loss analytics.',
      'Integrated telephony logging: call duration tracking, outcomes, notes, and follow-up schedules.',
      'Property and booking management workflows designed for enterprise asset portfolios.',
      'Environment segmentation designed for Development, Staging, and Production deployments.'
    ],
    techStack: ['React / Next.js', 'C# / .NET', 'PostgreSQL', 'RESTful APIs', 'Git / GitHub', 'Enterprise RBAC']
  },
  classifier: {
    title: 'Smart Support Ticket Classifier',
    category: 'AI / Automation • NLP',
    banner: '/assets/images/project-classifier.jpg',
    description: 'A Flask-based machine learning application that ingests customer support tickets, parses unstructured text inquiries, and classifies tickets automatically into domain queues with urgency ratings.',
    architecture: `
      <div class="architecture-callout" style="margin-top: 0.5rem;">
        <span class="arch-label">Classification Pipeline</span>
        <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.5; margin-top: 0.25rem;">
          Raw Ingestion &rarr; NLP Text Tokenization &amp; Vectorization &rarr; Scikit-Learn Classification Model &rarr; Flask REST Service &rarr; Real-Time Support Queue Dashboard.
        </div>
      </div>
    `,
    features: [
      'Automated routing of incoming support requests to Billing, Tech Support, Order Tracking, or General Inquiry.',
      'Evaluation of NLP classification confidence percentages to identify edge-cases needing human escalation.',
      'Urgency evaluation and sentiment tag categorization (Negative, Anxious, Neutral) to prioritize high-risk tickets.',
      'Clean customer support queue table with search, sorting, and manual tag overrides.',
      'Lightweight Python Flask backend with modular endpoints for integrating with external helpdesks.'
    ],
    techStack: ['Python', 'Flask', 'Machine Learning', 'Scikit-Learn / NLP', 'HTML5 & CSS3', 'REST APIs']
  }
};

const modal = document.getElementById('projectModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBannerImg = document.getElementById('modalBannerImg');
const modalCategory = document.getElementById('modalCategory');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDescription');
const modalArchSection = document.getElementById('modalArchSection');
const modalArchContent = document.getElementById('modalArchContent');
const modalFeaturesList = document.getElementById('modalFeaturesList');
const modalTechStack = document.getElementById('modalTechStack');

function openProjectModal(projectId) {
  const data = projectsData[projectId];
  if (!data) return;

  modalBannerImg.src = data.banner;
  modalBannerImg.alt = `${data.title} showcase`;
  modalCategory.textContent = data.category;
  modalTitle.textContent = data.title;
  modalDesc.textContent = data.description;

  if (data.architecture) {
    modalArchSection.style.display = 'flex';
    modalArchContent.innerHTML = data.architecture;
  } else {
    modalArchSection.style.display = 'none';
  }

  // Populate features
  modalFeaturesList.innerHTML = '';
  data.features.forEach((feat) => {
    const li = document.createElement('li');
    li.textContent = feat;
    modalFeaturesList.appendChild(li);
  });

  // Populate tech stack
  modalTechStack.innerHTML = '';
  data.techStack.forEach((tech) => {
    const span = document.createElement('span');
    span.className = 'tech-tag';
    span.textContent = tech;
    modalTechStack.appendChild(span);
  });

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-trigger-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const projectId = btn.getAttribute('data-project-id');
    openProjectModal(projectId);
  });
});

// Also trigger when clicking project card
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('click', (e) => {
    // Avoid double trigger if clicking button directly
    if (e.target.closest('.modal-trigger-btn')) return;
    const projectId = card.getAttribute('data-project-id');
    openProjectModal(projectId);
  });
});

modalCloseBtn.addEventListener('click', closeProjectModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeProjectModal();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) {
    closeProjectModal();
  }
});

// 9. Copy Email to Clipboard Functionality
const copyEmailBtn = document.getElementById('copyEmailBtn');
const copyBtnText = document.getElementById('copyBtnText');
const userEmail = 'naveenkumar.dev@outlook.com';

if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(userEmail);
      } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = userEmail;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      copyBtnText.textContent = 'Copied to Clipboard!';
      copyEmailBtn.style.borderColor = 'var(--signature-red)';
      copyEmailBtn.style.color = '#FFFFFF';

      setTimeout(() => {
        copyBtnText.textContent = 'Copy Email Address';
        copyEmailBtn.style.borderColor = '';
        copyEmailBtn.style.color = '';
      }, 2400);
    } catch (err) {
      console.warn('Unable to copy to clipboard', err);
    }
  });
}
