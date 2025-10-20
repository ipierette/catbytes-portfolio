// public/js/modules/projectsGallery.js
import { registerLazy } from './lazyLoad.js';

const projects = [
    {
        title: "Projeto MeowFlix IA",
        description: "Sistema de recomendação de filmes com IA que analisa o humor do usuário através de linguagem natural (Google Gemini) e sugere filmes personalizados usando dados reais do TMDB. Desenvolvido com React/TypeScript, originalmente n8n porém com workfow convertido para deploy serverless no Netlify, interface acessível e responsiva com tema de gatos e netflix-inspired.",
        image: "./images/meowflixia.png",
        liveUrl: "https://meowflixia.netlify.app/",
        githubUrl: "https://github.com/ipierette/meowflix-ai-mood-matcher"
    },
    {
        title: "CATButler-Assistente de IA para Casa (SPA)",
        description: "SPA responsiva estilo Dashboard o CATButler é uma aplicação web inovadora que transforma a rotina doméstica com IA, ajudando a organizar tarefas, planejar refeições e fazer compras inteligentes de forma sustentável. Une interface moderna, gamificação e recomendações personalizadas. Desenvolvido em React/Vite, com backend em Node.js/Express em desenvolvimento.",
        image: "./images/catbutler.png",
        liveUrl: "https://catbutler-frontend.vercel.app/",
        githubUrl: "https://github.com/ipierette/catbutler-frontend"
    },
    {
        title: "Chat-Bot Via Lactea",
        description: "Aplicação front-end que simula um chatbot com personalidade dinâmica e respostas contextuais, utilizando HTML5, CSS3 e JavaScript puro. O projeto incorpora efeitos visuais interativos, animações suaves e design responsivo, proporcionando uma experiência de usuário envolvente. Inclui manipulação avançada do DOM e lógica modular para fácil expansão de funcionalidades.",
        image: "./images/chatbot.webp",
        liveUrl: "https://ipierette.github.io/chat-bot-via-lactea/",
        githubUrl: "https://github.com/ipierette/chat-bot-via-lactea"
    },
    {
        title: "Agente de IA",
        description: "Sistema automatizado de atendimento via WhatsApp com múltiplos agentes de IA. Desenvolvido em n8n, realiza qualificação de leads, agendamento e confirmação de consultas. Possui memória conversacional (PostgreSQL), processamento multimodal (áudio, imagem e texto) e envio de lembretes automáticos. Reduz até 20h mensais em tarefas manuais. Ideal para clínicas, pet shops, academias e escritórios, salões de beleza e qualquer negócio que precisa automatizar atendimento via WhatsApp e reduzir ausências de clientes agendados. Reduz até 20 horas mensais gastas com confirmações manuais.",
        image: "./images/demo-agente.png",
        liveUrl: "https://demo-agenteia.netlify.app/",
        githubUrl: "https://github.com/ipierette/demo-agente"
    },

    {
        title: "Site Institucional Médico - Plataforma Completa de Gestão",
        description: "Sistema web para clínicas e consultórios com backend em n8n e IA integrada. Inclui chat inteligente com OpenAI baseado em fontes científicas (OMS, CDC, NIH), agendamento com bloqueio automático de finais de semana e feriados, gestão de convênios e validação em tempo real. Usa n8n e Supabase para automações seguras e sincronizadas. Tecnologias: HTML, CSS, JS, OpenAI API, Supabase, Netlify.",
        image: "./images/simples-medico.png",
        liveUrl: "https://simples-medico.netlify.app/",
        githubUrl: "https://github.com/ipierette/simples-m-dico"
    }
];

let currentProjectIndex = 0;
const projectDots = [];
let activeDotIndex = 0;

// --- helper de preload do próximo slide ---
function preload(src) {
  if (!src) return;
  const img = new Image();
  img.decoding = 'async';
  img.loading = 'eager';
  img.src = src;
}

function updateProjectContent(project) {
    const projectImage = document.getElementById('project-image');
    const projectTitle = document.getElementById('project-title');
    const projectDescription = document.getElementById('project-description');
    const liveLink = document.querySelector('.project-links a[aria-label="Ver projeto ao vivo"]');
    const githubLink = document.querySelector('.project-links a[aria-label="Ver código do projeto no GitHub"]');

    // --- CARREGAMENTO DO SLIDE ATUAL (EAGER) ---
    // Substitui o antigo bloco de lazy aqui para evitar o atraso na animação
    // (antes: loading="lazy", data-src e registerLazy) :contentReference[oaicite:1]{index=1}
    if (projectImage) {
        // evita layout shift (ajuste se seu card tiver outro tamanho)
        if (!projectImage.width)  projectImage.width  = 600;
        if (!projectImage.height) projectImage.height = 400;

        // remover qualquer resquício de lazy do slide anterior
        projectImage.classList.remove('lazy');
        projectImage.removeAttribute('data-src');
        projectImage.removeAttribute('loading');

        // prioriza decodificação/pintura imediata
        projectImage.decoding = 'async';
        projectImage.setAttribute('fetchpriority', 'high');

        // define o recurso real diretamente (GIF ou WebP animado)
        projectImage.src = project.image;

        // pré-carrega o PRÓXIMO slide em background
        const nextIdx = (currentProjectIndex + 1) % projects.length;
        const next = projects[nextIdx];
        if (next?.image) preload(next.image);
    }

    if (projectTitle) projectTitle.textContent = project.title;
    if (projectDescription) projectDescription.textContent = project.description;
    if (liveLink) {
        liveLink.href = project.liveUrl;
        liveLink.target = "_blank";
        liveLink.rel = "noopener noreferrer";
    }
    if (githubLink) {
        githubLink.href = project.githubUrl;
        githubLink.target = "_blank";
        githubLink.rel = "noopener noreferrer";
    }
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
