// public/js/main.js

import { initUI } from './modules/ui.js';
import { initScrollAnimations, initCatPopup } from './modules/animations.js';
import { initProjectsGallery } from './modules/projectsGallery.js';
import { initSkillsCarousel } from './modules/skillsCarousel.js';
import { initAdoptCat } from './modules/adoptCat.js';
import { initGenerateAd } from './modules/generateAd.js';
import { initIdentifyCat } from './modules/identifyCat.js';
import { initContactForm } from './modules/contactForm.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initScrollAnimations();
  initCatPopup();
  initProjectsGallery();
  initSkillsCarousel();
  initAdoptCat();
  initGenerateAd();
  initIdentifyCat();
  initContactForm();
});
