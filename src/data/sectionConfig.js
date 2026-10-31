/* ==========================================================================
   SECTION & ANIMATION CONFIGURATION
   ========================================================================== */

export const SECTION_CONFIG = {
  hero: {
    scrollDistance: "370svh",
    phases: {
      typing: [0.0, 0.28],
      push: [0.28, 0.72],
      statement: [0.72, 0.88],
      exit: [0.88, 1.0]
    },
    lightingModes: {
      day: { value: 0.0, theme: "day" },
      sunset: { value: 0.55, theme: "sunset" },
      night: { value: 0.88, theme: "night" }
    }
  },
  why: {
    flyIn: {
      x: 120,
      y: 150,
      rotate: 6,
      scale: 0.92,
      opacity: 0,
      ease: "power3.out",
      duration: 1.2
    }
  },
  footer: {
    animations: ["waving", "thumbsUp", "stretch"],
    crossfadeDuration: 0.6
  }
};

