// js/modules/aiFeatures.js

// URLs dos seus webhooks do n8n
const N8N_WEBHOOKS = {
  GENERATE_AD: '', // Quando criar o workflow, cole aqui
  ADOPT_CAT: 'https://ipierette-cloud.app.n8n.cloud/webhook/adote-gatinho',
  IDENTIFY_CAT: '' // Futuro
};

// Utilitários de DOM
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const show = (el) => el && el.classList.remove('hidden');
const hide = (el) => el && el.classList.add('hidden');

// Chamada genérica ao n8n
async function callN8nWebhook(webhookUrl, payload) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      throw new Error(`Erro na API (${response.status}): ${response.statusText} ${txt || ''}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[n8n webhook] ${webhookUrl} falhou:`, error);
    throw error;
  }
}

/* =========================
   GERAR ANÚNCIO (placeholder)
   ========================= */
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

    if (!N8N_WEBHOOKS.GENERATE_AD) {
      alert('A geração de anúncio ainda não está disponível. Em breve!');
      return;
    }

    show(loadingIndicator);
    hide(generatedAdContainer);

    try {
      const payload = {
        description,
        prompt: `Gere um anúncio atraente para doação de um gatinho com as seguintes características: ${description}. Inclua um título cativante e um apelo emocional.`
      };

      const result = await callN8nWebhook(N8N_WEBHOOKS.GENERATE_AD, payload);

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
}

/* ==========================================
   ADOTE UM GATINHO — render dos resultados
   ========================================== */
function renderAdoptionResults(container, data) {
  container.innerHTML = ''; // limpa

  // Mensagem de status
  const msg = document.createElement('div');
  msg.className = 'mb-4 font-semibold text-green-700';
  msg.textContent = data?.mensagem || '';
  container.appendChild(msg);

  if (!data?.anuncios || !data.anuncios.length) {
    const empty = document.createElement('div');
    empty.className = 'text-gray-500 italic';
    empty.textContent = 'Nenhum anúncio encontrado para sua busca.';
    empty.setAttribute('role', 'status');
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'space-y-6';

  data.anuncios.forEach((anuncio) => {
    const item = document.createElement('li');
    item.className = 'flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition group';

    // Badge (score)
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'flex flex-col items-center mr-4 mb-2 sm:mb-0';

    const scoreLabel = document.createElement('div');
    scoreLabel.className = 'text-xs font-semibold text-yellow-700 mb-1 text-center';
    scoreLabel.textContent = 'Score da IA';

    const badge = document.createElement('span');
    badge.className = 'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500 cursor-help select-none';
    badge.textContent = anuncio.score ? Math.round(anuncio.score * 100) : 0;
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('role', 'img');
    badge.setAttribute('aria-label', `Score da IA: ${badge.textContent} de 100. Quanto maior, mais confiável o anúncio.`);
    badge.setAttribute('title', 'Selo de confiabilidade: quanto maior o score, mais confiável o anúncio segundo a IA.');

    badgeWrap.appendChild(scoreLabel);
    badgeWrap.appendChild(badge);

    // Conteúdo
    const content = document.createElement('div');
    content.className = 'flex-1 w-full';

    const topRow = document.createElement('div');
    topRow.className = 'flex flex-col sm:flex-row sm:items-center mb-2 w-full';

    const title = document.createElement('a');
    title.href = anuncio.url;
    title.target = '_blank';
    title.rel = 'noopener';
    title.className = 'text-lg font-bold text-blue-700 group-hover:underline mr-2 break-all focus:outline-green-500';
    title.textContent = anuncio.titulo || 'Anúncio de Adoção';
    title.setAttribute('aria-label', `Abrir anúncio: ${anuncio.titulo || 'Anúncio de Adoção'}`);

    let fonte = null;
    if (anuncio.fonte) {
      fonte = document.createElement('span');
      fonte.className = 'ml-2 text-xs text-gray-400 font-semibold';
      fonte.textContent = anuncio.fonte;
      fonte.setAttribute('aria-label', `Fonte: ${anuncio.fonte}`);
    }

    topRow.appendChild(title);
    if (fonte) topRow.appendChild(fonte);

    const desc = document.createElement('p');
    desc.className = 'text-gray-700 text-sm mt-1 mb-2';
    desc.textContent = anuncio.descricao || '';

    content.appendChild(topRow);
    content.appendChild(desc);

    // monta o card
    item.appendChild(badgeWrap);
    item.appendChild(content);
    list.appendChild(item);
  });

  container.appendChild(list);
}

/* =====================================
   ADOTE UM GATINHO — lógica principal
   ===================================== */
function setupAdoptCat() {
  const form = document.querySelector('#adopt-cat form');
  if (!form) return;

  let resultsContainer = document.querySelector('#adopt-results-container');
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'adopt-results-container';
    resultsContainer.setAttribute('aria-live', 'polite');
    resultsContainer.className = 'mt-8';
    form.parentNode.appendChild(resultsContainer);
  }

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
      const results = await callN8nWebhook(N8N_WEBHOOKS.ADOPT_CAT, payload);
      console.log('[Adote] payload enviado:', payload);
      console.log('[Adote] resposta do n8n:', results);
      renderAdoptionResults(resultsContainer, results);
    } catch (error) {
      console.error('[Adote] webhook falhou:', error);
      resultsContainer.innerHTML = `
        <div class="text-red-600" role="alert">
          Erro ao buscar anúncios. ${error?.message || 'Tente novamente.'}
        </div>`;
    }
  });
}

/* =====================================
   IDENTIFICAR GATINHO (placeholder)
   ===================================== */
function setupIdentifyCat() {
  const form = $('#identify-cat form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Funcionalidade de identificação em breve!');
  });
}

// Inicializador público
export function initAIFeatures() {
  const tabButtons = $$('.tab-button');
  const tabContents = $$('.tab-content');

  const activateTab = (tabId) => {
    tabButtons.forEach((btn) => {
      btn.classList.toggle('active-tab', btn.dataset.tab === tabId);
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

  setupGenerateAd();
  setupAdoptCat();
  setupIdentifyCat();
}
