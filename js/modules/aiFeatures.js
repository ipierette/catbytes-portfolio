// js/modules/aiFeatures.js

// URLs dos seus webhooks do n8n (substitua pelos seus)
const N8N_WEBHOOKS = {
    GENERATE_AD: 'URL_DO_SEU_WEBHOOK_N8N_PARA_GERAR_ANUNCIO',
    ADOPT_CAT: 'http://ipi-server.lat/webhook/adote-gatinho',
    IDENTIFY_CAT: 'URL_DO_SEU_WEBHOOK_N8N_PARA_IDENTIFICAR_GATOS'
};

// Utilitários de DOM para reduzir repetição
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');

// Função genérica para fazer chamadas à API
async function callN8nWebhook(webhookUrl, payload) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }

        return await response.json();

    } catch (error) {
        console.error(`Erro ao chamar o webhook ${webhookUrl}:`, error);
        throw error; // Re-lança o erro para ser tratado pela função que chamou
    }
}


// --- Lógica da Funcionalidade "Gerar Anúncio" ---
function setupGenerateAd() {
    const generateAdBtn = $('#generate-ad-btn');
    const catDescriptionInput = $('#cat-description');
    const generatedAdContainer = $('#generated-ad-container');
    const generatedAdText = $('#generated-ad-text');
    const loadingIndicator = $('#loading-indicator');

    if (!generateAdBtn) return;

    generateAdBtn.addEventListener('click', async () => {
        const description = catDescriptionInput.value.trim();
        if (!description) {
            alert('Por favor, descreva o gatinho para gerar o anúncio.');
            return;
        }

        show(loadingIndicator);
        hide(generatedAdContainer);

// Prepara o payload para o n8n
        try {
            const payload = {
                description,
                prompt: `Gere um anúncio atraente para doação de um gatinho com as seguintes características: ${description}. Inclua um título cativante e um apelo emocional.`
            };

            // Chama o webhook do n8n
            const result = await callN8nWebhook(N8N_WEBHOOKS.GENERATE_AD, payload);

            // O n8n deve retornar um JSON com a propriedade 'generatedText'
            if (result && result.generatedText) {
                generatedAdText.textContent = result.generatedText;
            } else {
                throw new Error('Resposta inesperada do servidor.');
            }

        } catch (error) {
            generatedAdText.textContent = 'Ocorreu um erro ao gerar o anúncio. Por favor, tente novamente mais tarde.';
            console.error('Erro na geração do anúncio:', error);
        } finally {
            hide(loadingIndicator);
            show(generatedAdContainer);
        }
    });

    // Lógica de copiar texto (pode ser movida para cá também, sem alterações)
}


// --- Lógica da Funcionalidade "Adote um Gatinho" (Preparada para n8n) ---
// --- Função para renderizar os resultados de adoção ---
function renderAdoptionResults(container, data) {
    container.innerHTML = ''; // Limpa

    // Mensagem de status
    const msg = document.createElement('div');
    msg.className = 'mb-4 font-semibold text-green-700';
    msg.textContent = data.mensagem || '';
    container.appendChild(msg);

    if (!data.anuncios || !data.anuncios.length) {
        // Nenhum resultado encontrado
        const empty = document.createElement('div');
        empty.className = 'text-gray-500 italic';
        empty.textContent = 'Nenhum anúncio encontrado para sua busca.';
        empty.setAttribute('role', 'status');
        container.appendChild(empty);
        return;
    }

    // Lista de anúncios
    const list = document.createElement('ul');
    list.className = 'space-y-6';

    data.anuncios.forEach(anuncio => {
        const item = document.createElement('li');
        item.className = 'flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition group';

        // Coluna da badge (visível só se houver score)
        const badgeWrap = document.createElement('div');
        badgeWrap.className = 'flex flex-col items-center mr-4 mb-2 sm:mb-0';

        // Label de score
        const scoreLabel = document.createElement('div');
        scoreLabel.className = 'text-xs font-semibold text-yellow-700 mb-1 text-center';
        scoreLabel.textContent = 'Score da IA';

        // Tooltip explicando o selo de confiança
        const badge = document.createElement('span');
        badge.className = 'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500 cursor-help select-none';
        badge.textContent = anuncio.score ? Math.round(anuncio.score * 100) : 0;
        badge.setAttribute('tabindex', '0');
        badge.setAttribute('role', 'img');
        badge.setAttribute('aria-label', `Score da IA: ${badge.textContent} de 100. Quanto maior, mais confiável o anúncio.`);
        badge.setAttribute('title', 'Selo de confiabilidade: quanto maior o score, mais confiável o anúncio segundo a IA.');

        badgeWrap.appendChild(scoreLabel);
        badgeWrap.appendChild(badge);

        // Coluna do conteúdo do anúncio
        const content = document.createElement('div');
        content.className = 'flex-1 w-full';

        // Linha título + fonte + imagem
        const topRow = document.createElement('div');
        topRow.className = 'flex flex-col sm:flex-row sm:items-center mb-2 w-full';

        // Título/link do anúncio
        const title = document.createElement('a');
        title.href = anuncio.url;
        title.target = '_blank';
        title.rel = 'noopener';
        title.className = 'text-lg font-bold text-blue-700 group-hover:underline mr-2 break-all focus:outline-green-500';
        title.textContent = anuncio.titulo || 'Anúncio de Adoção';
        title.setAttribute('aria-label', `Abrir anúncio: ${anuncio.titulo || 'Anúncio de Adoção'}`);

        // Fonte (opcional)
        let fonte = null;
        if (anuncio.fonte) {
            fonte = document.createElement('span');
            fonte.className = 'ml-2 text-xs text-gray-400 font-semibold';
            fonte.textContent = anuncio.fonte;
            fonte.setAttribute('aria-label', `Fonte: ${anuncio.fonte}`);
        }

        topRow.appendChild(title);
        if (fonte) topRow.appendChild(fonte);
        if (img) topRow.appendChild(img);

        // Descrição
        const desc = document.createElement('p');
        desc.className = 'text-gray-700 text-sm mt-1 mb-2';
        desc.textContent = anuncio.descricao || '';

        content.appendChild(topRow);
        content.appendChild(desc);

        // Estrutura final acessível
        item.appendChild(badgeWrap);
        item.appendChild(content);

        list.appendChild(item);
    });

    container.appendChild(list);
}

// --- Função principal da aba "Adote um Gatinho" ---
function setupAdoptCat() {
    const form = document.querySelector('#adopt-cat form');
    if (!form) return;

    // Adiciona o container de resultados logo após o formulário (se não existir)
    let resultsContainer = document.querySelector('#adopt-results-container');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'adopt-results-container';
        resultsContainer.setAttribute('aria-live', 'polite');
        resultsContainer.className = 'mt-8';
        form.parentNode.appendChild(resultsContainer);
    }

    // Habilita o botão, caso esteja desabilitado
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultsContainer.innerHTML = '<div class="text-gray-500 text-sm">Buscando anúncios...</div>';

        const payload = {
            age: document.querySelector('#cat-age').value,
            color: document.querySelector('#cat-color').value,
            localizacao: document.querySelector('#cat-location').value
        };

        try {
            // URL do seu webhook n8n — ajuste aqui!
            const webhookUrl = 'http://ipi-server.lat/webhook/adote-gatinho';
            const results = await callN8nWebhook(webhookUrl, payload);
            renderAdoptionResults(resultsContainer, results);
        } catch (error) {
            resultsContainer.innerHTML = '<div class="text-red-600" role="alert">Erro ao buscar anúncios. Tente novamente.</div>';
        }
    });
}



// --- Lógica da Funcionalidade "Identificar Gatinho" (Preparada para n8n) ---
function setupIdentifyCat() {
    const form = $('#identify-cat form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert('Funcionalidade de identificação em breve!');

        /*
        // Lógica para quando for implementar:
        // O envio de arquivos (fotos) é mais complexo, geralmente usando FormData.
        // O n8n precisa ser configurado para receber 'binary data'.
        const photoInput = $('#cat-photo');
        if (photoInput.files.length === 0) {
            alert('Por favor, selecione uma foto.');
            return;
        }

        const formData = new FormData();
        formData.append('file', photoInput.files[0]);

        try {
            // A chamada para upload de arquivo é diferente, não usa JSON.
            const response = await fetch(N8N_WEBHOOKS.IDENTIFY_CAT, {
                method: 'POST',
                body: formData
                // Não defina Content-Type, o browser faz isso para multipart/form-data
            });

            if (!response.ok) throw new Error('Erro no upload');

            const results = await response.json();
            // Processar e exibir resultados (raça, idade, etc.)
            console.log(results);

        } catch (error) {
            // Exibir mensagem de erro
        }
        */
    });
}


export function initAIFeatures() {
    // Lógica das abas
    const tabButtons = $$('.tab-button');
    const tabContents = $$('.tab-content');

            const activateTab = (tabId) => {
        tabButtons.forEach((btn) => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active-tab', isActive);
        });

        tabContents.forEach((content) => {
            const isActive = content.id === tabId;
            content.classList.toggle('hidden', !isActive);
            content.classList.toggle('active-content', isActive);
        });
    };

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => activateTab(button.dataset.tab));
    });

    // Inicia as funcionalidades de cada aba
    setupGenerateAd();
    setupAdoptCat();
    setupIdentifyCat();
}