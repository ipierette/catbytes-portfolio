// public/js/modules/projectsGallery.js

const projects = [
    {
        title: "CatCommerce: Loja Online de Produtos Felinos",
        description: "Um e-commerce responsivo para produtos de gatos, construído com HTML semântico, CSS avançado (Flexbox e Grid) e JavaScript para funcionalidades de carrinho e filtros.",
        image: "./images/projeto-memoria.gif",
        liveUrl: "#",
        githubUrl: "#"
    },
    {
        title: "Miaulist: Gerenciador de Tarefas Diárias",
        description: "Um aplicativo simples de lista de tarefas, desenvolvido com JavaScript puro para manipulação do DOM. Permite adicionar, remover e marcar tarefas como concluídas.",
        image: "https://placehold.co/600x400/2F4F4F/FFFFFF?text=Miaulist",
        liveUrl: "#",
        githubUrl: "#"
    },
    {
        title: "Blog Felino: Artigos e Dicas para Tutores",
        description: "Um blog responsivo com artigos sobre cuidados com gatos. Utiliza HTML para estrutura, CSS para um design limpo e JS para carregamento dinâmico.",
        image: "https://placehold.co/600x400/4A5568/FFFFFF?text=Blog+Felino",
        liveUrl: "#",
        githubUrl: "#"
    },
    {
        title: "Jogo da Memória: Gatos Programadores",
        description: "Um divertido jogo da memória com tema de gatos e programação, focado na lógica de jogo e animações CSS para uma experiência envolvente.",
        image: "https://placehold.co/600x400/36454F/FFFFFF?text=Jogo+Memoria",
        liveUrl: "#",
        githubUrl: "#"
    }
];

let currentProjectIndex = 0;
const projectDots = [];
let activeDotIndex = 0;

function updateProjectContent(project) {
    const projectImage = document.getElementById('project-image');
    const projectTitle = document.getElementById('project-title');
    const projectDescription = document.getElementById('project-description');
    const liveLink = document.querySelector('.project-links a[aria-label="Ver projeto ao vivo"]');
    const githubLink = document.querySelector('.project-links a[aria-label="Ver código do projeto no GitHub"]');

    if (projectImage) projectImage.src = project.image;
    if (projectTitle) projectTitle.textContent = project.title;
    if (projectDescription) projectDescription.textContent = project.description;
    if (liveLink) liveLink.href = project.liveUrl;
    if (githubLink) githubLink.href = project.githubUrl;
}

function createProjectDots() {
    const projectDotsContainer = document.getElementById('project-dots');
    if (!projectDotsContainer) return;

    projectDotsContainer.innerHTML = '';
    projects.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('project-dot');
        if (index === currentProjectIndex) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            currentProjectIndex = index;
            updateProjectContent(projects[currentProjectIndex]);
            updateProjectDots();
        });
        projectDotsContainer.appendChild(dot);
        projectDots.push(dot);
    });
}

function updateProjectDots() {
    if (projectDots[activeDotIndex]) {
        projectDots[activeDotIndex].classList.remove('active');
    }
    if (projectDots[currentProjectIndex]) {
        projectDots[currentProjectIndex].classList.add('active');
    }
    activeDotIndex = currentProjectIndex;
}

export function initProjectsGallery() {
    const prevProjectBtn = document.getElementById('prev-project');
    const nextProjectBtn = document.getElementById('next-project');

    if (!prevProjectBtn || !nextProjectBtn || !document.getElementById('project-image')) return;

    prevProjectBtn.addEventListener('click', () => {
        currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
        updateProjectContent(projects[currentProjectIndex]);
        updateProjectDots();
    });

    nextProjectBtn.addEventListener('click', () => {
        currentProjectIndex = (currentProjectIndex + 1) % projects.length;
        updateProjectContent(projects[currentProjectIndex]);
        updateProjectDots();
    });

    createProjectDots();
    // Inicializa o conteúdo do primeiro projeto
    updateProjectContent(projects[currentProjectIndex]);
    updateProjectDots();
}