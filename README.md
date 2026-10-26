# Naveen Kumar E — Personal Developer Portfolio (Lumora Design)

A self-contained personal developer portfolio for **Naveen Kumar E**, built according to the **Lumora studio specification**: single self-contained `index.html` (pure HTML/CSS/JS with zero build requirements, Google Onest font, rem-based adaptive grid, ink & warm burnt-orange accents, liquid cursor reveal hero, interactive modals, and Lenis smooth scrolling).

---

## ⚡ Quick Start

### 1. Direct Browser Usage (Zero Dependencies)
Since `index.html` is completely self-contained with an importmap CDN for Lenis, you can open `index.html` directly in any web browser or host it on GitHub Pages / Vercel / Netlify with no build step!

### 2. Local Development Server
To run locally with hot-reloading:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

---

## ⚙️ Configuration (`const CONFIG`)

All editable parameters are centralized in a single `CONFIG` object at the top of the `<script type="module">` in [`index.html`](file:///d:/Nk's%20personal/portfolio/index.html):

```javascript
const CONFIG = {
  name: "Naveen Kumar E",
  brandShort: "Naveen",
  initials: "NK",
  role: "Software Developer — React · Full-Stack",
  tagline: "Designed with curiosity. Built with purpose.",
  email: "", // Enter your email (e.g. "naveenkumar.dev@outlook.com") -> shows direct email links
  linkedin: "", // Enter your LinkedIn URL -> enables social button in About and Footer
  github: "", // Enter your GitHub URL -> enables GitHub button in About and Footer
  resumeUrl: "", // Enter PDF URL -> enables "Download résumé" button
  photoUrl: "", // Optional portrait image URL; if empty, procedural soft gradient & orange reveal are used
  nptel: [
    "NPTEL Course — Foundational Computer Science",
    "NPTEL Course — Web Technology & Systems"
  ],
  projects: [
    // AgroEquipAI, Multi-Tenant Sales & Calling Platform, Smart Support Ticket Classifier
  ]
};
```

> **Honesty & Integrity Rule**: When any field (`email`, `linkedin`, `github`, `resumeUrl`, project links) is empty, the corresponding button or link is automatically hidden so no dead links or broken UI elements are displayed.

---

## 🎨 Design System & Features

- **Palette**: Near-white surfaces (`#ffffff`, `#f1f0ee`) punctuated by deep ink cards (`#0a0a0a`), warm burnt-orange accent (`#b15f2c`), and gradient highlights (`#cf8047` to `#97501f`).
- **Typography**: Google Font **Onest** only (400, 500, 600, 700).
- **Adaptive Grid**: Automatic rem scaling across mobile, tablet, desktop, and ultrawide monitors (up to and beyond 1920px).
- **Cinematic Page Loader**: 000 to 100 countdown with easeInOutCubic progression, progress bar, and upward curtain exit.
- **Header**: Absolute overlay with LogoMark, animated nav links, live local time & date clock, and mobile full-screen menu drawer.
- **Hero Section**:
  - Full-bleed liquid canvas cursor reveal (pointer-trail interaction).
  - Procedural soft gradient base + orange reveal layers with monogram watermark (or custom photo).
  - 4 TagChips role labels (`Software Developer`, `React Developer`, `Full-Stack Development`, `Problem Solver`).
  - 3-line headline: *"Building modern / web applications, / with purpose."*
  - 5-star rating cluster: *"2 internships · 3 featured projects"*.
  - HeroCard carousel (Frontend, Backend, Full Stack).
  - My Stack grid: React, Spring Boot, Java, Node.js, PostgreSQL, MongoDB, GCP.
  - Status bar: *"B.Tech IT · KCG College of Technology"* & *"Open to software development roles"*.
- **About Me**:
  - Globe watermark & side note.
  - Word-by-word reveal statement.
  - Education 3-column breakdown: B.Tech IT, KCG College of Technology, 2022–2026, CGPA 7.52.
  - 4 Core Principles: *Build with purpose*, *Learn by building*, *Think full stack*, *Improve every detail*.
- **CreateBand**: 4 pill tiles: `"I"`, `"Build"`, `→`, `"Better"`.
- **Selected Projects**:
  - 3-card layout (3rd card spans full width for intentional editorial grid balance).
  - **AgroEquipAI**: AI-Assisted Smart Agriculture mobile app.
  - **Multi-Tenant Sales & Calling Platform**: Architectural highlight chip formula: `Access = Tenant Access + Feature Enabled + Role Permission`.
  - **Smart Support Ticket Classifier**: Flask & NLP classification application.
  - Clicking any card opens the **Project Detail Modal** with architecture details, features, and tags.
- **Experience**:
  - Expandable Services-row style cards for **Ford** (React Developer Intern) and **NSIC Chennai** (Web Development Intern).
  - Highlighted line with burnt-orange accent for React + API integration + backend learning.
- **Skills / Technical Toolkit**:
  - 5 honest categorized rows with transparent tags (`Practical`, `Practical / Learning`, `Practical / Foundational`, `Foundational`).
- **Continuous Learning**:
  - Infosys Springboard, Accenture, LinkedIn Learning Python, Google Digital Marketing, NPTEL courses, B.Tech IT, Internships.
- **Stats**:
  - Scroll-triggered count-up animation: `03` Projects, `02` Internships, `04` Focus Areas, `2026` Graduation.
- **Contact & Footer**:
  - *"Have an idea worth building?"* CTA.
  - Interactive RequestModal with name, email, project inquiry fields, and mailto/success state handling.
  - Background watermark `"NAVEEN"`.
