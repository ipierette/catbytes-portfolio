// public/js/main.js (ou ./js/main.js)
import { initUI } from './modules/ui.js';
import { initScrollAnimations, initCatPopup } from './modules/animations.js';
import { initProjectsGallery } from './modules/projectsGallery.js';
import { initSkillsCarousel } from './modules/skillsCarousel.js';

// 👇 novos imports
import { initIATabs } from './modules/iaTabs.js';
import { initAdoptCat } from './modules/adoptCat.js';
import { initGenerateAd } from './modules/generateAd.js';
import { initIdentifyCat } from './modules/identifyCat.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initScrollAnimations();
  initCatPopup();
  initProjectsGallery();
  initSkillsCarousel();

  // — IA Felina —
  initIATabs();
  initAdoptCat();
  initGenerateAd();
  initIdentifyCat();
});