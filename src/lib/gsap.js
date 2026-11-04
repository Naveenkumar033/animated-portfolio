import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP is bundled with the site, so the scroll plugin is always available
gsap.registerPlugin(ScrollTrigger);
const hasGsap = true;

export { gsap, ScrollTrigger, hasGsap };
