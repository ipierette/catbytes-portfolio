// public/js/modules/animations.js

/**
 * Anima as seções quando elas entram na tela (scroll).
 */
export function initScrollAnimations() {
    const sectionsToAnimate = document.querySelectorAll('section.section-animated');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                Array.from(entry.target.children).forEach((child, index) => {
                    if (!child.classList.contains('scroll-progress-bar')) {
                        child.style.transitionDelay = `${index * 0.1}s`;
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
        sectionObserver.observe(section);
    });
}

/**
 * Controla a animação de digitação do popup do gato na seção Hero.
 */
export function initCatPopup() {
    const catHoverArea = document.getElementById('cat-hover-area');
    const catPopup = document.getElementById('cat-popup');

    if (!catHoverArea || !catPopup) return;

    const catPopupTextElement = catPopup.querySelector('p');
    const fullText = "Prrrr! Sou o Axel, o gato mascote e guardião deste portfólio! Explore tudo com carinho… ou vou arranhar seu mouse! 🐾";
    let typingInterval;
    let isTyping = false;

    const startTyping = () => {
        if (!catPopupTextElement || isTyping) return;
        isTyping = true;
        catPopup.classList.remove('finished');
        catPopupTextElement.textContent = "";
        let i = 0;
        typingInterval = setInterval(() => {
            if (i < fullText.length) {
                catPopupTextElement.textContent += fullText.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                catPopup.classList.add('finished');
                isTyping = false;
            }
        }, 50);
    };

    const stopTyping = () => {
        clearInterval(typingInterval);
        isTyping = false;
        if (catPopupTextElement) {
            catPopupTextElement.textContent = "";
        }
    };

    catHoverArea.addEventListener('mouseenter', () => {
        catPopup.classList.add('visible');
        startTyping();
    });

    catHoverArea.addEventListener('mouseleave', () => {
        catPopup.classList.remove('visible');
        stopTyping();
    });


}