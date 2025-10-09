// public/js/modules/skillsCarousel.js

// DADOS UNIFICADOS DOS CARDS
const skillsData = [
    { icon: 'fas fa-code', title: 'HTML & CSS', description: 'Construção de layouts responsivos com HTML5 semântico e CSS3 avançado, utilizando Flexbox, Grid e animações.', progress: 95, level: 'Gato Mestre', color: '#E44D26' },
    { icon: 'fab fa-js-square', title: 'JavaScript (ES6+)', description: 'Manipulação do DOM, interatividade, requisições assíncronas (Fetch API) e lógica para aplicações web dinâmicas.', progress: 85, level: 'Gato Mestre', color: '#F7DF1E' },
    { icon: 'fab fa-tailwind', title: 'Tailwind CSS', description: 'Desenvolvimento ágil de interfaces com a metodologia utility-first, criando designs customizados sem sair do HTML.', progress: 50, level: 'Miado Intermediário', color: '#38B2AC' },
    { icon: 'fab fa-react', title: 'React.js', description: 'Criação de interfaces de usuário reativas e componentizadas para Single Page Applications (SPAs).', progress: 30, level: 'Ronronado Iniciante', color: '#61DAFB' },
    { icon: 'fab fa-vuejs', title: 'Vue.js', description: 'Conhecimento inicial no desenvolvimento de aplicações progressivas e componentes reutilizáveis.', progress: 15, level: 'Ronronado Iniciante', color: '#4FC08D' },
    { icon: 'fas fa-sitemap', title: 'n8n.io', description: 'Automação de fluxos de trabalho e criação de backends no-code/low-code para integrar serviços e APIs.', progress: 75, level: 'Miado Intermediário', color: '#6A2794' },
    { icon: 'fas fa-database', title: 'PostgreSQL', description: 'Modelagem e consulta de bancos de dados relacionais, garantindo a integridade e persistência dos dados.', progress: 40, level: 'Ronronado Iniciante', color: '#336791' },
    { icon: 'fas fa-server', title: 'Redis', description: 'Utilização de banco de dados em memória para caching e gerenciamento de sessões, otimizando a performance.', progress: 30, level: 'Ronronado Iniciante', color: '#DC382D' },
    { icon: 'fab fa-docker', title: 'Docker', description: 'Conteinerização de aplicações para garantir consistência entre ambientes de desenvolvimento e produção.', progress: 70, level: 'Miado Intermediário', color: '#2496ED' },
    { icon: 'fas fa-cloud-upload-alt', title: 'OCI', description: 'Implantação e manutenção de aplicações backend na Oracle Cloud Infrastructure, garantindo alta disponibilidade.', progress: 70, level: 'Miado Intermediário', color: '#ce1477ff' }
];

// FUNÇÃO PARA CRIAR CADA CARD INDIVIDUALMENTE
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

// FUNÇÃO PARA ANIMAR AS BARRAS DE PROGRESSO QUANDO VISÍVEIS
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

// ===================================================================
// FUNÇÃO PRINCIPAL DO CARROSSEL COM LÓGICA DE LOOP INFINITO
// ===================================================================
export function initSkillsCarousel() {
    const carousel = document.getElementById('skills-carousel');
    const prevBtn = document.getElementById('prev-skill');
    const nextBtn = document.getElementById('next-skill');

    if (!carousel || !prevBtn || !nextBtn) return;

    let currentIndex;
    let cards = [];
    let cardWidth = 0;
    let cardMargin = 0;
    let isTransitioning = false; // Flag para evitar cliques múltiplos durante a animação

    const getVisibleCardsCount = () => {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    };

    const setupCarousel = () => {
        const visibleCards = getVisibleCardsCount();
        
        // --- LÓGICA DE CLONAGEM PARA O LOOP ---
        const clonesStart = skillsData.slice(-visibleCards);
        const clonesEnd = skillsData.slice(0, visibleCards);
        const allItems = [...clonesStart, ...skillsData, ...clonesEnd];

        carousel.innerHTML = allItems.map(createSkillCard).join('');
        cards = carousel.querySelectorAll('.skill-card');

        // Calcula as métricas dos cards
        if (cards.length > 0) {
            const cardElement = cards[0];
            cardWidth = cardElement.offsetWidth;
            const styles = window.getComputedStyle(cardElement);
            cardMargin = parseInt(styles.marginLeft) + parseInt(styles.marginRight);
        }

        // Define o ponto de partida inicial (o primeiro item real após os clones)
        currentIndex = visibleCards;
        repositionCarousel(false); // Reposiciona sem animação
        
        setTimeout(animateProgressBars, 100);
    };

    const repositionCarousel = (animated = true) => {
        const step = cardWidth + cardMargin;
        const totalMovement = step * currentIndex;
        
        carousel.style.transition = animated ? 'transform 0.5s ease' : 'none';
        carousel.style.transform = `translateX(-${totalMovement}px)`;
    };
    
    const handleInfiniteJump = () => {
        isTransitioning = false; // Permite o próximo clique

        const visibleCards = getVisibleCardsCount();
        const totalOriginalCards = skillsData.length;

        // Se chegamos no clone do fim, saltamos para o início real
        if (currentIndex >= totalOriginalCards + visibleCards) {
            currentIndex = visibleCards;
            repositionCarousel(false);
        }
        
        // Se chegamos no clone do início, saltamos para o fim real
        if (currentIndex < visibleCards) {
            currentIndex = skillsData.length + currentIndex;
            repositionCarousel(false);
        }
    };

    nextBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        repositionCarousel(true);
        carousel.addEventListener('transitionend', handleInfiniteJump, { once: true });
    });

    prevBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        repositionCarousel(true);
        carousel.addEventListener('transitionend', handleInfiniteJump, { once: true });
    });

    window.addEventListener('resize', () => {
        // Reconstrói o carrossel para garantir que as medidas e clones estejam corretos
        setupCarousel();
    });

    // Inicia o carrossel
    setupCarousel();
}