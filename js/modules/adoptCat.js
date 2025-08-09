// js/modules/adoptCat.js

// ----------------------------------------------------
// Utils embutidos (para não depender de utils.js)
// ----------------------------------------------------
async function callN8nWebhook(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Erro ${res.status} ${res.statusText}${text ? ' · ' + text : ''}`);
  }
  return res.json();
}

function $(sel, root = document) {
  return root.querySelector(sel);
}

function el(tag, className = '', text = '') {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text) n.textContent = text;
  return n;
}

// ----------------------------------------------------
// Helpers de renderização
// ----------------------------------------------------
function normalizeUrl(candidate) {
  try {
    if (!candidate || typeof candidate !== 'string') return '';
    // se vier sem http/https mas parecer domínio, prefixa
    if (!/^https?:\/\//i.test(candidate) && /^[\w.-]+\.[a-z]{2,}([/:].*)?$/i.test(candidate)) {
      return new URL('https://' + candidate).toString();
    }
    return new URL(candidate).toString();
  } catch {
    return '';
  }
}

function bestUrl(anuncio) {
  return (
    normalizeUrl(
      anuncio?.url ||
      anuncio?.link ||
      anuncio?.href ||
      anuncio?.result_url ||
      ''
    ) || ''
  );
}

function hostnameFrom(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function scoreToInt(score) {
  if (typeof score !== 'number' || !isFinite(score)) return 0;
  // Se vier 0–1, converte pra 0–100; se já vier >= 1, assume 0–100
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
}

// ----------------------------------------------------
// Render
// ----------------------------------------------------
export function renderAdoptionResults(container, data) {
  container.innerHTML = '';

  const msg = el('div', 'mb-4 font-semibold text-green-700', data?.mensagem || '');
  container.appendChild(msg);

  let anuncios = Array.isArray(data?.anuncios) ? data.anuncios : [];

  // Fallbacks (apenas se NENHUM anúncio real chegou)
  if (!anuncios.length) {
    anuncios = [
      {
        titulo: 'Resultados de adoção perto de você (Google)',
        descricao: 'Busca sugerida de adoção de gatos.',
        url: 'https://www.google.com/search?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'google.com',
        score: 8,
      },
      {
        titulo: 'Veja anúncios de adoção no OLX',
        descricao: 'Busca sugerida de gatos para adoção no OLX.',
        url: 'https://www.olx.com.br/brasil?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'olx.com.br',
        score: 7,
      },
    ];
  }

  const list = el('ul', 'space-y-6');

  anuncios.forEach((anuncio) => {
    const item = el(
      'li',
      'flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition group'
    );

    // Badge de score
    const badgeWrap = el('div', 'flex flex-col items-center mr-4 mb-2 sm:mb-0');
    badgeWrap.appendChild(el('div', 'text-xs font-semibold text-yellow-700 mb-1 text-center', 'Score da IA'));
    const badge = el(
      'span',
      'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500 cursor-help select-none',
      String(scoreToInt(anuncio?.score))
    );
    badge.title = 'Selo de confiabilidade: quanto maior o score, mais confiável o anúncio segundo a IA.';
    badgeWrap.appendChild(badge);

    // Conteúdo
    const content = el('div', 'flex-1 w-full');
    const titleDescWrap = el('div', 'flex flex-col gap-1 mb-2');

    // Título (com link, se válido)
    const href = bestUrl(anuncio);
    const titleText = anuncio?.titulo || 'Anúncio de Adoção';
    if (href) {
      const a = el(
        'a',
        'text-lg font-bold text-blue-700 group-hover:underline mr-2 break-normal focus:outline-green-500',
        titleText
      );
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      titleDescWrap.appendChild(a);
    } else {
      titleDescWrap.appendChild(
        el('span', 'text-lg font-bold text-gray-700 mr-2 break-normal', `${titleText} (sem link)`)
      );
    }

    // Descrição (logo abaixo do título)
    if (anuncio?.descricao) {
      titleDescWrap.appendChild(el('p', 'text-gray-700 text-sm', anuncio.descricao));
    }

    // Fonte (hostname derivado do link, se possível)
    const fonteRaw = anuncio?.fonte || (href ? hostnameFrom(href) : '');
    const fonte = el('span', 'text-xs text-gray-400 font-semibold mt-1', `Fonte: ${fonteRaw || 'desconhecida'}`);
    titleDescWrap.appendChild(fonte);

    content.appendChild(titleDescWrap);
    item.appendChild(badgeWrap);
    item.appendChild(content);
    list.appendChild(item);
  });

  container.appendChild(list);
}

// ----------------------------------------------------
// Init
// ----------------------------------------------------
export function setupAdoptCat() {
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

  // (Re)habilita o botão do formulário
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = '<div class="text-gray-500 text-sm">Buscando anúncios...</div>';

    const payload = {
      age: $('#cat-age')?.value || '',
      color: $('#cat-color')?.value || '',
      localizacao: $('#cat-location')?.value || '',
    };

    try {
      const webhookUrl = 'https://ipierette-cloud.app.n8n.cloud/webhook/adote-gatinho';
      const results = await callN8nWebhook(webhookUrl, payload);
      renderAdoptionResults(resultsContainer, results);
    } catch (err) {
      console.error('Erro ao buscar anúncios:', err);
      resultsContainer.innerHTML =
        '<div class="text-red-600" role="alert">Erro ao buscar anúncios. Tente novamente.</div>';
    }
  });
}
