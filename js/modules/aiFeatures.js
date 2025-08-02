// js/modules/aiFeatures.js

// URLs dos seus webhooks do n8n (substitua pelos seus)
const N8N_WEBHOOKS = {
    GENERATE_AD: 'URL_DO_SEU_WEBHOOK_N8N_PARA_GERAR_ANUNCIO',
    ADOPT_CAT: 'URL_DO_SEU_WEBHOOK_N8N_PARA_BUSCAR_GATOS',
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
function setupAdoptCat() {
    const form = $('#adopt-cat form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Esta funcionalidade está desabilitada no HTML, mas aqui está a lógica pronta.
        alert('Funcionalidade de adoção em breve!');

        /* // Lógica para quando for implementar:
        const payload = {
             age: $('#cat-age').value,
            color: $('#cat-color').value,
            location: $('#cat-location').value
        };

        try {
            const results = await callN8nWebhook(N8N_WEBHOOKS.ADOPT_CAT, payload);
            // Processar e exibir os resultados na tela
            console.log(results);
        } catch (error) {
            // Exibir mensagem de erro
        }
        */
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