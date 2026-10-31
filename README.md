# Naveen Kumar E — Creative Full-Stack Developer & Designer Portfolio

An advanced 3D creative developer portfolio for **Naveen Kumar E**, featuring a continuous WebGL/Three.js 3D character journey, dynamic atmospheric sky engine, bidirectional GSAP ScrollTrigger timeline orchestration, procedural Web Audio synthesizer, and responsive editorial layout replicating the benchmark experience of `codeofsagar.in`.

---

## 🚀 Key Architectural Highlights

### 1. Continuous 3D Character Journey (3 Coordinated Stages)
- **Stage 1: Hero Stone Hand & Desk Push Scrub (`HeroStageScene.js` & `characterTimeline.js`)**
  - Developer character sits perched on the giant stone knuckle typing on a concept MacBook (`typing.glb`).
  - As scroll progresses: hands slide outward, laptop launches upward with rotational tumble.
  - Character lands at mechanical desk (`desk2.glb` + `chair.glb`).
  - Push sequence scrubs bidirectionally across the viewport with character pushing against the desk (`push.glb`).
  - Giant typographical name (`NAVEEN KUMAR`) letters reveal sequentially in exact synchrony with character X position.
  - Camera glides in to frame the character for the dramatic transition into *"Let's make it simple."*
  - Pointer-driven bone tracking for interactive head yaw and pitch.
- **Stage 2: Why Custom Seated Workspace (`WhyDeskScene.js` & `scrollAnimations.js`)**
  - Seated developer typing at mechanical desk with subtle harmonic floating motion.
  - Viewport entry fly-in animation (`x: 80, y: 100, rot: 4, scale: 0.94, opacity: 0` -> normal).
  - Cursor tracking for head yaw and pitch.
  - Integrated with live customer review quote carousel.
- **Stage 3: Footer Standing Developer (`FooterCharacterScene.js`)**
  - Full-height standing 3D developer character on the right side of the footer.
  - Continuous cyclic animation crossfading (`waving` -> `thumbsUp` -> `armStretch`).
  - Interactive cursor tracking, live India time (IST) digital clock, copyable email clipboard interaction, and contact form.

### 2. Dynamic Atmospheric Sky Engine (`SkyScene.js`)
- Full WebGL custom shader with procedural Rayleigh/Mie atmospheric scattering and volumetric cumulus clouds.
- 4 atmospheric lighting modes:
  - **Day**: Clean blue sky with bright cumulus clouds and directional sunlight.
  - **Warm Day**: Golden-hour illumination with warm directional highlights.
  - **Sunset**: Rich burnt-orange / crimson dusk with glowing cloud fringes.
  - **Night**: Deep midnight indigo with twinkling star field and neon aurora borealis waves.
- Interactive Sky Dial with animated hand rotation and instant theme state toggling.

### 3. Bidirectional Smooth Scroll & Kinetic Typography
- **Lenis Smooth Scrolling** synchronized with GSAP ScrollTrigger via dual passive listeners ensuring desync-free reverse scrolling.
- **Rolling Letter Flip Animation (`.has-roll`)**: Dual-span letter-by-letter vertical carousel flip on hover.
- **Line Masks Reveal**: Staggered clip-path headline entry animations across all editorial sections.
- **Process On Film**: 4 responsive steps featuring synchronized looping MP4 video clips (`/process/step1.mp4` through `step4.mp4`).
- **Services Showreel**: High-definition looping video showcase (`/video/work-reel-cut.mp4`).

### 4. Zero-Dependency Procedural Audio Synthesizer (`src/utils/audio.js`)
- 100% self-contained Web Audio API synthesizer generating subtle UI click chirps (850Hz -> 420Hz) and whoosh transitions (260Hz -> 110Hz).
- Ambient harmonic drone with dual sine/triangle oscillators (174Hz / 261.63Hz) and lowpass filtering.

---

## 📁 Modular Directory Architecture

```
portfolio/
├── index.html                     # Semantic HTML5 structure with SEO, JSON-LD schema & meta tags
├── package.json                   # Dependencies (three, gsap, lenis, vite)
├── vite.config.js                 # Optimized Vite bundler configuration
├── public/
│   ├── models/                    # 3D GLTF/GLB models (sagar, desk2, chair, macbook)
│   │   └── anim/                  # Skeletal animation clips (typing, push, waving, thumbsUp, etc.)
│   ├── process/                   # Step 01-04 looping demonstration videos & posters
│   └── video/                     # Services showreel video & poster
├── src/
│   ├── main.js                    # Entry point initializing the unified app
│   ├── style.css                  # CSS aggregator importing modular style sheets
│   ├── app/
│   │   └── initializeApp.js       # App lifecycle coordinator
│   ├── data/
│   │   ├── portfolioData.js       # Centralized user content, bio, projects, and contacts
│   │   └── sectionConfig.js       # Scroll threshold & animation phase parameters
│   ├── scenes/
│   │   ├── HeroStageScene.js      # Hero Three.js canvas, stone hands, knuckles & desk
│   │   ├── WhyDeskScene.js        # Why Custom section seated developer scene
│   │   ├── FooterCharacterScene.js# Footer standing character with cyclic animation blend
│   │   ├── SkyScene.js            # Atmospheric shader, clouds, stars & aurora
│   │   └── Lighting.js            # Synchronized 3-point scene illumination
│   ├── animations/
│   │   ├── characterTimeline.js   # Master GSAP hero scroll timeline
│   │   ├── scrollAnimations.js    # Lenis smooth scroll, fly-in triggers, line masks
│   │   ├── textAnimations.js      # Rolling letter hover engine (.has-roll)
│   │   └── transitions.js         # Modal dialogs, review carousel, menu drawer
│   ├── styles/
│   │   ├── global.css             # Typography, reset, design tokens & color variables
│   │   ├── layout.css             # Section layouts, grid structures, cards & hero stage
│   │   ├── animations.css         # Keyframes, transitions & transforms
│   │   └── responsive.css         # Mobile, tablet, desktop & ultrawide queries
│   └── utils/
│       ├── assetLoader.js         # GLTF & Texture loader with caching & error handling
│       ├── audio.js               # Procedural Web Audio API sound generator
│       └── cleanup.js             # WebGL memory, geometry & texture disposal
```

---

## ⚡ Development & Production

### Development Server
```bash
npm run dev
```
Starts the local dev server at `http://localhost:5174/`.

### Production Build
```bash
npm run build
```
Generates an optimized, minified bundle in `dist/`.

### Preview Build
```bash
npm run preview
```
Previews the production build locally.

---

## 👤 User Identity & Content
- **Developer**: Naveen Kumar E (`CodeofNaveen`)
- **Education**: B.Tech Information Technology, KCG College of Technology (2022–2026)
- **Email**: `naveenkumar.dev@outlook.com`
- **Featured Projects**:
  1. **AgroEquipAI** — AI-Powered Smart Agriculture & Farm Equipment Platform
  2. **Multi-Tenant Sales & Calling Platform** — Enterprise CRM with Role-Based Access Control
  3. **Smart Support Ticket Classifier** — Flask & NLP-Driven Automated IT Ticketing Pipeline
