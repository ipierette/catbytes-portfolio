// public/js/main.js

// Bloco de importações limpo e sem duplicatas
import { initUI } from './modules/ui.js';
import { initScrollAnimations, initCatPopup } from './modules/animations.js';
import { initProjectsGallery } from './modules/projectsGallery.js';
import { initSkillsCarousel } from './modules/skillsCarousel.js';
import { initAIFeatures } from './modules/aiFeatures.js';
import { initContactForm } from './modules/contactForm.js';

// UM ÚNICO listener para garantir que todo o código execute após o HTML carregar
document.addEventListener('DOMContentLoaded', () => {
    // Todas as funções de inicialização são chamadas aqui
    initUI();
    initScrollAnimations();
    initCatPopup(); // A chamada para o popup agora está no lugar certo
    initProjectsGallery();
    initSkillsCarousel();
    initAIFeatures();
    initContactForm();
});