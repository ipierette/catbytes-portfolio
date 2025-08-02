// public/js/modules/ui.js

/**
 * Controla a abertura e fechamento do menu de navegação em dispositivos móveis.
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!menuToggle || !mobileMenu) return;

    const menuIcon = menuToggle.querySelector('i');

    menuToggle.addEventListener('click', () => {
        const isActive = mobileMenu.classList.toggle('active');
        mobileMenu.classList.toggle('hidden');
        menuIcon.classList.toggle('fa-bars', !isActive);
        menuIcon.classList.toggle('fa-times', isActive);
    });

    // Fecha o menu ao clicar em um link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenu.classList.add('hidden');
            menuIcon.classList.add('fa-bars');
            menuIcon.classList.remove('fa-times');
        });
    });
}

/**
 * Gerencia a funcionalidade de troca de tema (claro/escuro).
 */
function initThemeToggle() {
    const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    const body = document.body;

    // Aplica o tema salvo no localStorage ou o padrão do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    
    const applyTheme = (dark) => {
        body.classList.toggle('dark-mode', dark);
        themeToggles.forEach(toggle => {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-moon', !dark);
                icon.classList.toggle('fa-sun', dark);
            }
        });
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    };
    
    applyTheme(isDarkMode);

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isCurrentlyDark = body.classList.contains('dark-mode');
            applyTheme(!isCurrentlyDark);
        });
    });
}

/**
 * Controla a visibilidade e a ação do botão "Voltar ao Topo".
 */
function initBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Atualiza a barra de progresso de rolagem no topo da página.
 */
function initScrollProgressBar() {
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    if (!scrollProgressBar) return;

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        scrollProgressBar.style.width = `${progress}%`;
    });
}

/**
 * Função principal que inicializa todos os componentes de UI.
 * Esta é a única função exportada pelo módulo.
 */
export function initUI() {
    initMobileMenu();
    initThemeToggle();
    initBackToTopButton();
    initScrollProgressBar();
}