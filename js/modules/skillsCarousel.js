// public/js/modules/skillsCarousel.js

// DADOS UNIFICADOS (sem alterações desta vez)
const skillsData = [
    { icon: 'fas fa-code', title: 'HTML & CSS', description: 'Construção de layouts responsivos com HTML5 semântico e CSS3 avançado, utilizando Flexbox, Grid e animações.', progress: 95, level: 'Gato Mestre', color: '#E44D26' },
    { icon: 'fab fa-js-square', title: 'JavaScript (ES6+)', description: 'Manipulação do DOM, interatividade, requisições assíncronas (Fetch API) e lógica para aplicações web dinâmicas.', progress: 85, level: 'Gato Mestre', color: '#F7DF1E' },
    { icon: 'fab fa-tailwind', title: 'Tailwind CSS', description: 'Desenvolvimento ágil de interfaces com a metodologia utility-first, criando designs customizados sem sair do HTML.', progress: 50, level: 'Miado Intermediário', color: '#38B2AC' },
    { icon: 'fab fa-react', title: 'React.js', description: 'Criação de interfaces de usuário reativas e componentizadas para Single Page Applications (SPAs).', progress: 30, level: 'Ronronado Iniciante', color: '#61DAFB' },
    { icon: 'fab fa-vuejs', title: 'Vue.js', description: 'Conhecimento inicial no desenvolvimento de aplicações progressivas e componentes reutilizáveis.', progress: 15, level: 'Ronronado Iniciante', color: '#4FC08D' },
    { icon: 'fas fa-sitemap', title: 'n8n.io', description: 'Automação de fluxos de trabalho e criação de backends no-code/low-code para integrar serviços e APIs.', progress: 60, level: 'Miado Intermediário', color: '#6A2794' },
    { icon: 'fas fa-database', title: 'PostgreSQL', description: 'Modelagem e consulta de bancos de dados relacionais, garantindo a integridade e persistência dos dados.', progress: 40, level: 'Ronronado Iniciante', color: '#336791' },
    { icon: 'fas fa-server', title: 'Redis', description: 'Utilização de banco de dados em memória para caching e gerenciamento de sessões, otimizando a performance.', progress: 30, level: 'Ronronado Iniciante', color: '#DC382D' },
    { icon: 'fab fa-docker', title: 'Docker', description: 'Conteinerização de aplicações para garantir consistência entre ambientes de desenvolvimento e produção.', progress: 70, level: 'Miado Intermediário', color: '#2496ED' },
    { icon: 'fas fa-cloud-upload-alt', title: 'Deploy 24/7 com OCI', description: 'Implantação e manutenção de aplicações backend na Oracle Cloud Infrastructure, garantindo alta disponibilidade.', progress: 70, level: 'Miado Intermediário', color: '#F80000' }
];

function createSkillCard(skill) {
    return `
        <div class="skill-card">
            <div class="skill-card-header">
                <i class="${skill.icon}" style="color: ${skill.color};"></i>
                <h3 class="skill-card-title">${skill.title}</h3>
            </div>
            <p class="skill-card-description">${skill.description}</p>
            <div class="progress-bar-container">
                <div class="progress-bar-inner" data-progress="${skill.progress}" style="background-color: ${skill.color};"></div>
            </div>
            <p class="meow-level">Nível de Miado: ${skill.level}</p>
        </div>
    `;
}

function animateProgressBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const progress = progressBar.dataset.progress;
                progressBar.style.width = `${progress}%`;
                observer.unobserve(progressBar);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.progress-bar-inner').forEach(bar => {
        observer.observe(bar);
    });
}

// FUNÇÃO PRINCIPAL DO CARROSSEL COM LÓGICA DE MOVIMENTO CORRIGIDA
export function initSkillsCarousel() {
    const carousel = document.getElementById('skills-carousel');
    const prevBtn = document.getElementById('prev-skill');
    const nextBtn = document.getElementById('next-skill');

    if (!carousel || !prevBtn || !nextBtn) return;

    carousel.innerHTML = skillsData.map(createSkillCard).join('');
    setTimeout(animateProgressBars, 100);

    let currentIndex = 0;
    const cards = carousel.querySelectorAll('.skill-card');
    const totalCards = cards.length;
    let cardWidth = 0;
    let cardMargin = 0;

    const calculateCardMetrics = () => {
        if (cards.length === 0) return;
        const cardElement = cards[0];
        cardWidth = cardElement.offsetWidth;
        const styles = window.getComputedStyle(cardElement);
        cardMargin = parseInt(styles.marginLeft) + parseInt(styles.marginRight);
    };

    const getVisibleCardsCount = () => {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    };

    const updateCarouselState = () => {
        if (cards.length === 0) return;

        const visibleCards = getVisibleCardsCount();

        // A distância a mover é a largura de um card mais o espaçamento completo
        const step = cardWidth + cardMargin;
        const totalMovement = step * currentIndex;

        carousel.style.transform = `translateX(-${totalMovement}px)`;

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= totalCards - visibleCards;
    };

    nextBtn.addEventListener('click', () => {
        const visibleCards = getVisibleCardsCount();
        if (currentIndex < totalCards - visibleCards) {
            currentIndex++;
            updateCarouselState();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarouselState();
        }
    });

    window.addEventListener('resize', () => {
        calculateCardMetrics();
        const visibleCards = getVisibleCardsCount();
        // Ajusta o índice se a janela diminuir e o índice atual se tornar inválido
        if (currentIndex > totalCards - visibleCards) {
            currentIndex = Math.max(0, totalCards - visibleCards);
        }
        updateCarouselState();
    });

    // Um pequeno timeout para garantir que as dimensões dos cards foram calculadas pelo navegador
    setTimeout(() => {
        calculateCardMetrics();
        updateCarouselState();
    }, 100);
}