# Naveen Kumar E — Cinematic Personal Developer Portfolio

> **Design Direction:** Cinematic Dark Developer Portfolio (Marcus Vane Aesthetic)  
> **Built with:** HTML5, Modern Vanilla CSS3, ESModules, Vite, and Lenis Smooth Scrolling.

---

## 🎨 Visual Identity & Design Tokens

| Property | Value | Description |
| :--- | :--- | :--- |
| **Primary Background** | `#08080A` | Deep charcoal / near-black |
| **Primary Text** | `#F3F1EA` | Editorial off-white |
| **Secondary Text** | `#807F78` | Muted neutral gray |
| **Card Surface** | `#111114` | Dark graphite card surface |
| **Elevated Surface** | `#17171B` | Elevated interaction layers |
| **Signature Accent** | `#FF3B1D` | Vivid tomato red |
| **Secondary Accent** | `#FF6A3D` | Warm crimson accent |
| **Display Typography** | `Anton` | Google Fonts (Oversized condensed display) |
| **Body Typography** | `Onest` | Google Fonts (Editorial, legible, modern) |

---

## 🚀 Key Features & Sections

1. **Cinematic Preloader:** High-precision counter (`00` to `100%`) with milestone status transitions and smooth upward curtain reveal.
2. **Fixed Navigation Bar:**
   - Circular outlined monogram containing **NK**.
   - Text logo `NAVEEN KUMAR` with live availability status indicator (`• AVAILABLE FOR ROLES`).
   - Animated red underline indicator on hover and active scroll tracking.
   - Mobile full-screen drawer menu with staggered entrance animations.
3. **Hero Composition:**
   - Full viewport height (`100vh`).
   - Upper-left: Professional role labels (Software Developer, React Developer, Full-Stack, Problem Solver).
   - Upper-right: Authentic introductory narrative.
   - Centerpiece: Massive two-line condensed Anton typography (`NAVEEN` / `KUMAR E`) in signature red `#FF3B1D`.
   - Layered developer portrait / silhouette asset with subtle bottom gradient blending into the next section.
   - Interactive "Scroll to Explore" indicator.
4. **Operating Principles Infinite Marquee:**
   - Seamless horizontal ticker: `BUILD WITH PURPOSE` • `DESIGN WITH CLARITY` • `ENGINEER FOR SCALE` • `LEARN CONTINUOUSLY` • `SHIP REAL SOLUTIONS`.
   - Pauses on hover; respects `prefers-reduced-motion`.
5. **About Me / Professional Story:**
   - Eyebrow: `THE DEVELOPER`
   - Heading: *“Turning ideas into working software.”*
   - Academic background: B.Tech Information Technology, KCG College of Technology (2022–2026, CGPA: 7.52).
   - Four development principles:
     - `01 — BUILD WITH PURPOSE`
     - `02 — LEARN BY BUILDING`
     - `03 — THINK FULL STACK`
     - `04 — IMPROVE EVERY DETAIL`
6. **Professional Experience:**
   - **Ford:** React Developer Intern (React.js frontend, Java & Spring Boot, REST APIs, GCP, Git/Agile).
   - **NSIC, Chennai:** Web Development Intern (HTML5, CSS3, JavaScript ES6+, React concepts).
7. **Featured Projects Showcase:**
   - **AgroEquipAI:** AI-Assisted Smart Agriculture mobile app (React Native, Expo, Node.js, Express.js, MongoDB).
   - **Multi-Tenant Sales & Calling Platform:** Enterprise CRM with strict tenant isolation, RBAC matrix, calling logs (`Access = Tenant Access + Feature Enabled + Role Permission`).
   - **Smart Support Ticket Classifier:** Flask & Machine Learning NLP classifier for support tickets.
   - **Interactive Modal Drawer:** Clicking "Details" on any project displays the full architectural diagram, invariants, key features, and technology tags.
8. **Technical Toolkit:**
   - Clear distinction between practical experience, foundational knowledge, and active learning (Java & Spring Boot).
9. **Continuous Learning & Certifications:**
   - Infosys Springboard, Accenture, LinkedIn Learning Python, Google Digital Marketing, and NPTEL courses.
10. **Portfolio Statistics Strip:**
    - 4-column oversized Anton counters (03 Projects, 02 Internships, 04 Core Focus Areas, 2026 Graduation).
11. **Contact Section:**
    - Eyebrow: `LET'S CONNECT`
    - Heading: *“Have an idea worth building?”*
    - Interactive email link with hover displacement: `naveenkumar.dev@outlook.com`.
    - One-click "Copy Email Address" button with live feedback tooltip.
    - Verified LinkedIn & GitHub outward links.
12. **Footer:**
    - `NAVEEN KUMAR E` — *“Designed with curiosity. Built with purpose.”*
    - Quick links and "Back to Top" smooth trigger.

---

## 🛠️ How to Run Locally

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in any browser.

### Build Production Bundle
```bash
npm run build
```
Creates an optimized static production build in `dist/`.

### Preview Production Build
```bash
npm run preview
```

---

## 📷 Customizing Your Portrait Photo

To swap out the placeholder silhouette with your own professional photo:
1. Save your photograph (ideally with a transparent background or dark background) as:
   `assets/images/developer-silhouette.jpg` (or `.png`).
2. If you change the filename, update the `<img src="/assets/images/..." />` tag inside [index.html](file:///d:/Nk's%20personal/portfolio/index.html).
