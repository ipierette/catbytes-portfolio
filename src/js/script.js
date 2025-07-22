document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = menuToggle ? menuToggle.querySelector('i') : null; // Get the icon element

    if (menuToggle && mobileMenu && menuIcon) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('active');

            // Toggle between bars and times icon
            if (mobileMenu.classList.contains('active')) {
                menuIcon.classList.replace('fa-bars', 'fa-times');
            } else {
                menuIcon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Fechar menu mobile ao clicar em um link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('active');
                // Ensure icon reverts to bars when menu closes
                if (menuIcon) {
                    menuIcon.classList.replace('fa-times', 'fa-bars');
                }
            });
        });
    }

    // --- Lógica da Galeria de Projetos Interativa ---
    const projects = [
        {
            title: "CatCommerce: Loja Online de Produtos Felinos",
            description: "Um e-commerce responsivo para produtos de gatos, construído com HTML semântico, CSS avançado (Flexbox e Grid) e JavaScript para funcionalidades de carrinho e filtros. Demonstra um layout moderno e uma experiência de compra intuitiva.",
            image: "../src/images/projeto-memoria.gif",
            liveUrl: "#",
            githubUrl: "#"
        },
        {
            title: "Miaulist: Gerenciador de Tarefas Diárias",
            description: "Um aplicativo simples e elegante de lista de tarefas, desenvolvido com JavaScript puro para manipulação do DOM. Permite adicionar, remover e marcar tarefas como concluídas, com persistência de dados no Local Storage.",
            image: "https://placehold.co/600x400/2F4F4F/FFFFFF?text=Miaulist",
            liveUrl: "#",
            githubUrl: "#"
        },
        {
            title: "Blog Felino: Artigos e Dicas para Tutores",
            description: "Um blog responsivo com artigos sobre cuidados com gatos, saúde e comportamento. Utiliza HTML para estrutura de conteúdo, CSS para um design limpo e atraente, e JavaScript para carregamento dinâmico de posts e navegação.",
            image: "https://placehold.co/600x400/4A5568/FFFFFF?text=Blog+Felino",
            liveUrl: "#",
            githubUrl: "#"
        },
        {
            title: "Jogo da Memória: Gatos Programadores",
            description: "Um divertido jogo da memória com tema de gatos e programação. Desenvolvido com HTML, CSS e JavaScript, foca na lógica de jogo, manipulação de eventos e animações CSS para uma experiência envolvente.",
            image: "https://placehold.co/600x400/36454F/FFFFFF?text=Jogo+Memoria",
            liveUrl: "#",
            githubUrl: "#"
        }
    ];

    let currentProjectIndex = 0;
    const projectImage = document.getElementById('project-image');
    const projectTitle = document.getElementById('project-title');
    const projectDescription = document.getElementById('project-description');
    const prevProjectBtn = document.getElementById('prev-project');
    const nextProjectBtn = document.getElementById('next-project');
    const projectDotsContainer = document.getElementById('project-dots');

    function updateProjectContent() {
        const project = projects[currentProjectIndex];
        if (projectImage) projectImage.src = project.image;
        if (projectTitle) projectTitle.textContent = project.title;
        if (projectDescription) projectDescription.textContent = project.description;

        // Atualizar links (se existirem)
        const liveLink = document.querySelector('.project-links a:nth-child(1)');
        const githubLink = document.querySelector('.project-links a:nth-child(2)');
        if (liveLink) liveLink.href = project.liveUrl;
        if (githubLink) githubLink.href = project.githubUrl;

        updateProjectDots();
    }

    function updateProjectDots() {
        if (projectDotsContainer) {
            projectDotsContainer.innerHTML = ''; // Limpa os pontos existentes
            projects.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('project-dot');
                if (index === currentProjectIndex) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    currentProjectIndex = index;
                    updateProjectContent();
                });
                projectDotsContainer.appendChild(dot);
            });
        }
    }

    if (prevProjectBtn && nextProjectBtn) {
        prevProjectBtn.addEventListener('click', () => {
            currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
            updateProjectContent();
        });

        nextProjectBtn.addEventListener('click', () => {
            currentProjectIndex = (currentProjectIndex + 1) % projects.length;
            updateProjectContent();
        });

        // Inicializa o conteúdo do projeto e os pontos
        updateProjectContent();
    }

    // --- Lógica das Abas de IA ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Função para ativar uma aba específica
    function activateTab(tabId) {
        // Remove o estado ativo de todos os botões
        tabButtons.forEach(button => {
            button.classList.remove('active-tab');
        });

        // Oculta todos os conteúdos das abas
        tabContents.forEach(content => {
            content.classList.add('hidden'); // Garante que esteja oculto
            content.classList.remove('active-content'); // Remove o estado ativo para resetar a transição
        });

        // Ativa o botão clicado
        const clickedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (clickedButton) {
            clickedButton.classList.add('active-tab');
        }

        // Mostra o conteúdo da aba correspondente
        const targetTabContent = document.getElementById(tabId);
        if (targetTabContent) {
            targetTabContent.classList.remove('hidden'); // Remove display: none
            targetTabContent.classList.add('active-content'); // Adiciona opacity: 1 e potencial transição
        }
    }

    // Adiciona listeners de clique aos botões das abas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            activateTab(button.dataset.tab);
        });
    });

    // Define a aba ativa inicial ao carregar a página
    // Encontra o botão que inicialmente tem a classe 'active-tab' no HTML
    const initialActiveButton = document.querySelector('.tab-button.active-tab');
    if (initialActiveButton) {
        // Se um botão ativo inicial for encontrado, ativa seu conteúdo de aba correspondente
        const initialTabId = initialActiveButton.dataset.tab;
        const initialTabContent = document.getElementById(initialTabId);
        if (initialTabContent) {
            initialTabContent.classList.remove('hidden');
            initialTabContent.classList.add('active-content');
        }
    } else if (tabButtons.length > 0) {
        // Se nenhuma aba ativa inicial for definida no HTML, ativa a primeira por padrão
        activateTab(tabButtons[0].dataset.tab);
    }

    // --- Lógica da Funcionalidade "Gerar Anúncio" (IA) ---
    const generateAdBtn = document.getElementById('generate-ad-btn');
    const catDescriptionInput = document.getElementById('cat-description');
    const generatedAdContainer = document.getElementById('generated-ad-container');
    const generatedAdText = document.getElementById('generated-ad-text');
    const copyAdBtn = document.getElementById('copy-ad-btn');
    const copyMessage = document.getElementById('copy-message');
    const loadingIndicator = document.getElementById('loading-indicator');

    if (generateAdBtn && catDescriptionInput && generatedAdContainer && generatedAdText && copyAdBtn && copyMessage && loadingIndicator) {
        generateAdBtn.addEventListener('click', async () => {
            const description = catDescriptionInput.value.trim();
            if (!description) {
                // Idealmente, um modal customizado no lugar de alert()
                alert('Por favor, descreva o gatinho para gerar o anúncio.');
                return;
            }

            loadingIndicator.classList.remove('hidden');
            generatedAdContainer.classList.add('hidden');
            copyMessage.classList.add('hidden');

            try {
                // Simulação de chamada à API Gemini
                // Em um ambiente real, você faria uma requisição fetch para a API do Gemini
                let chatHistory = [];
                chatHistory.push({ role: "user", parts: [{ text: `Gere um anúncio atraente para doação de um gatinho com as seguintes características: ${description}. Inclua um título cativante e um apelo emocional.` }] });
                const payload = { contents: chatHistory };
                const apiKey = ""; // Se você quiser usar modelos diferentes de gemini-2.0-flash ou imagen-3.0-generate-002, forneça uma chave de API aqui. Caso contrário, deixe como está.
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const generatedText = result.candidates[0].content.parts[0].text;
                    generatedAdText.textContent = generatedText;
                    generatedAdContainer.classList.remove('hidden');
                } else {
                    generatedAdText.textContent = 'Erro ao gerar anúncio. Tente novamente.';
                    generatedAdContainer.classList.remove('hidden');
                    console.error('Estrutura de resposta inesperada da API Gemini:', result);
                }

            } catch (error) {
                console.error('Erro ao chamar a API Gemini:', error);
                generatedAdText.textContent = 'Ocorreu um erro ao gerar o anúncio. Por favor, tente novamente mais tarde.';
                generatedAdContainer.classList.remove('hidden');
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        });

        // Lógica para copiar o texto do anúncio
        copyAdBtn.addEventListener('click', () => {
            const textToCopy = generatedAdText.textContent;
            if (textToCopy) {
                // Usar document.execCommand('copy') por causa de restrições de iframe
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed'; // Para que não afete o layout
                textarea.style.opacity = 0;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    copyMessage.classList.remove('hidden');
                    setTimeout(() => {
                        copyMessage.classList.add('hidden');
                    }, 2000);
                } catch (err) {
                    console.error('Falha ao copiar texto:', err);
                    // Fallback para navegadores mais antigos ou ambientes restritos
                    alert('Não foi possível copiar automaticamente. Por favor, selecione e copie o texto manualmente.');
                } finally {
                    document.body.removeChild(textarea);
                }
            }
        });
    }

    // --- Lógica do Modo Escuro ---
    const themeToggleDesktop = document.getElementById('theme-toggle');
    const themeIconDesktop = document.getElementById('theme-icon');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const themeIconMobile = document.getElementById('theme-icon-mobile');
    const body = document.body;

    // Função para aplicar o tema
    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            body.classList.add('dark-mode');
            if (themeIconDesktop) themeIconDesktop.classList.replace('fa-moon', 'fa-sun');
            if (themeIconMobile) themeIconMobile.classList.replace('fa-moon', 'fa-sun');
        } else {
            body.classList.remove('dark-mode');
            if (themeIconDesktop) themeIconDesktop.classList.replace('fa-sun', 'fa-moon');
            if (themeIconMobile) themeIconMobile.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // Carregar tema salvo no localStorage ou definir padrão para claro
    // Sempre começa com o tema claro, a menos que o localStorage explicitamente diga 'dark'
    applyTheme(false); // Define o tema claro como padrão inicial

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyTheme(true); // Se o tema salvo for 'dark', aplica-o
    }


    // Event listener para o botão de modo escuro (desktop)
    if (themeToggleDesktop) {
        themeToggleDesktop.addEventListener('click', () => {
            const isDarkMode = body.classList.contains('dark-mode');
            applyTheme(!isDarkMode);
            localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
        });
    }

    // Event listener para o botão de modo escuro (mobile)
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', () => {
            const isDarkMode = body.classList.contains('dark-mode');
            applyTheme(!isDarkMode);
            localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
        });
    }

    // --- Lógica do Botão Voltar ao Início ---
    const backToTopButton = document.getElementById('back-to-top');

    // Mostrar/ocultar o botão ao rolar
    window.addEventListener('scroll', () => {
        if (backToTopButton) {
            if (window.scrollY > 300) { // Mostra o botão após rolar 300px
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }
    });

    // Rolar para o topo ao clicar no botão
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Rolagem suave
            });
        });
    }

    // --- Lógica da Barra de Progresso de Rolagem ---
    const scrollProgressBar = document.getElementById('scroll-progress-bar');

    window.addEventListener('scroll', () => {
        if (scrollProgressBar) {
            const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolledHeight = window.scrollY;
            const scrollPercentage = (scrolledHeight / totalHeight) * 100;
            scrollProgressBar.style.width = scrollPercentage + '%';
        }
    });

    // --- Lógica das Animações de Entrada para Seções (Intersection Observer) ---
    const sectionsToAnimate = document.querySelectorAll('section.section-animated');

    

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Gatilho quando 10% da seção está visível
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Aplica animação escalonada aos filhos diretos
                Array.from(entry.target.children).forEach((child, index) => {
                    // Exclui a barra de progresso de rolagem se ela for um filho direto da seção
                    // (embora ela esteja no topo do body, é bom ter a verificação)
                    if (!child.classList.contains('scroll-progress-bar')) {
                        child.style.transitionDelay = `${index * 0.1}s`;
                    }
                });
                observer.unobserve(entry.target); // Para de observar uma vez que a seção foi animada
            }
        });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
        sectionObserver.observe(section);
    });
});