// js/modules/aiFeatures.js

// URLs dos seus webhooks do n8n (substitua pelos seus)
const N8N_WEBHOOKS = {
    GENERATE_AD: 'URL_DO_SEU_WEBHOOK_N8N_PARA_GERAR_ANUNCIO',
    ADOPT_CAT: 'URL_DO_SEU_WEBHOOK_N8N_PARA_BUSCAR_GATOS',
    IDENTIFY_CAT: 'URL_DO_SEU_WEBHOOK_N8N_PARA_IDENTIFICAR_GATOS'
};

// Função genérica para fazer chamadas à API
async function callN8nWebhook(webhookUrl, payload) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
    const generateAdBtn = document.getElementById('generate-ad-btn');
    const catDescriptionInput = document.getElementById('cat-description');
    const generatedAdContainer = document.getElementById('generated-ad-container');
    const generatedAdText = document.getElementById('generated-ad-text');
    const loadingIndicator = document.getElementById('loading-indicator');

    if (!generateAdBtn) return;

    generateAdBtn.addEventListener('click', async () => {
        const description = catDescriptionInput.value.trim();
        if (!description) {
            alert('Por favor, descreva o gatinho para gerar o anúncio.');
            return;
        }

        loadingIndicator.classList.remove('hidden');
        generatedAdContainer.classList.add('hidden');

        try {
            // Prepara o payload para o n8n
            const payload = {
                description: description,
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
            loadingIndicator.classList.add('hidden');
            generatedAdContainer.classList.remove('hidden');
        }
    });
    
    // Lógica de copiar texto (pode ser movida para cá também, sem alterações)
}


// --- Lógica da Funcionalidade "Adote um Gatinho" (Preparada para n8n) ---
function setupAdoptCat() {
    const form = document.querySelector('#adopt-cat form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Esta funcionalidade está desabilitada no HTML, mas aqui está a lógica pronta.
        alert('Funcionalidade de adoção em breve!');
        
        /* // Lógica para quando for implementar:
        const payload = {
            age: document.getElementById('cat-age').value,
            color: document.getElementById('cat-color').value,
            location: document.getElementById('cat-location').value
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
    const form = document.querySelector('#identify-cat form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert('Funcionalidade de identificação em breve!');

        /*
        // Lógica para quando for implementar:
        // O envio de arquivos (fotos) é mais complexo, geralmente usando FormData.
        // O n8n precisa ser configurado para receber 'binary data'.
        const photoInput = document.getElementById('cat-photo');
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

            if(!response.ok) throw new Error('Erro no upload');

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
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active-tab'));
            button.classList.add('active-tab');

            tabContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active-content');
            });

            const targetContent = document.getElementById(tabId);
            if(targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active-content');
            }
        });
    });

    // Inicia as funcionalidades de cada aba
    setupGenerateAd();
    setupAdoptCat();
    setupIdentifyCat();
}