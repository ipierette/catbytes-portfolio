// js/modules/adoptCat.js

// Webhook n8n
const N8N_WEBHOOK_ADOPT = 'https://ipierette-cloud.app.n8n.cloud/webhook/adote-gatinho';

// ------- Helpers DOM -------
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// ------- HTTP -------
async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${t ? '· ' + t : ''}`);
  }
  return res.json();
}

// ------- Utils -------
function bestUrl(anuncio) {
  const raw = anuncio?.url || anuncio?.link || anuncio?.href || anuncio?.result_url || '';
  if (!raw || typeof raw !== 'string') return '';
  try {
    if (!/^https?:\/\//i.test(raw) && /^[\w.-]+\.[a-z]{2,}([/:].*)?$/i.test(raw)) {
      return new URL('https://' + raw).toString();
    }
    return new URL(raw).toString();
  } catch {
    return '';
  }
}
function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

// ------- Render -------
function renderAdoptionResults(container, data) {
  container.innerHTML = '';

  const msg = el('div', 'mb-4 font-semibold text-green-700', data?.mensagem || '');
  container.appendChild(msg);

  let anuncios = Array.isArray(data?.anuncios) ? data.anuncios : [];

  // Fallbacks quando não vier nada do n8n
  if (!anuncios.length) {
    anuncios = [
      {
        titulo: 'Resultados de adoção perto de você (Google)',
        descricao: 'Busca sugerida de adoção de gatos.',
        url: 'https://www.google.com/search?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'google.com',
        score: 0.07,
      },
      {
        titulo: 'Veja anúncios de adoção no OLX',
        descricao: 'Busca sugerida de gatos disponíveis para adoção no OLX.',
        url: 'https://www.olx.com.br/brasil?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'olx.com.br',
        score: 0.08,
      },
    ];
  }

  const ul = el('ul', 'space-y-6');
  container.appendChild(ul);

  anuncios.forEach((anuncio) => {
    const li = el('li', 'flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition group');

    // Badge (score)
    const badgeWrap = el('div', 'flex flex-col items-center mr-4 mb-2 sm:mb-0');
    badgeWrap.appendChild(el('div', 'text-xs font-semibold text-yellow-700 mb-1 text-center', 'Score da IA'));
    const scoreVal = typeof anuncio.score === 'number'
      ? (anuncio.score > 1 ? anuncio.score : Math.round(anuncio.score * 100))
      : 0;
    const badge = el('span', 'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500');
    badge.textContent = String(isFinite(scoreVal) ? Math.max(0, scoreVal) : 0);
    badge.title = 'Selo de confiabilidade: quanto maior o score, mais confiável o anúncio segundo a IA.';
    badge.setAttribute('role', 'img');
    badge.setAttribute('aria-label', `Score da IA: ${badge.textContent} de 100.`);
    badgeWrap.appendChild(badge);

    // Conteúdo
    const content = el('div', 'flex-1 w-full');

    // Título (link se existir)
    const href = bestUrl(anuncio);
    const titleText = anuncio?.titulo || 'Anúncio de Adoção';
    const titleEl = href
      ? (() => {
          const a = el('a', 'text-lg font-bold text-blue-700 group-hover:underline mr-2 break-normal focus:outline-green-500', titleText);
          a.href = href;
          a.target = '_blank';
          a.rel = 'noopener';
          a.setAttribute('aria-label', `Abrir anúncio: ${titleText}`);
          return a;
        })()
      : el('span', 'text-lg font-bold text-gray-700 mr-2 break-normal', `${titleText} (sem link)`);

    // Descrição alinhada logo abaixo do título
    const desc = el('p', 'text-gray-700 text-sm', anuncio?.descricao || '');

    // Fonte após a descrição
    const fonteText = anuncio?.fonte && anuncio.fonte !== 'desconhecida'
      ? anuncio.fonte
      : (href ? hostname(href) : 'desconhecida');
    const fonte = el('div', 'text-xs text-gray-400', `Fonte: ${fonteText || 'desconhecida'}`);

    const block = el('div', 'flex flex-col gap-1 mb-2');
    block.appendChild(titleEl);
    if (anuncio?.descricao) block.appendChild(desc);
    block.appendChild(fonte);

    content.appendChild(block);

    li.appendChild(badgeWrap);
    li.appendChild(content);
    ul.appendChild(li);
  });
}

// ------- Init -------
export function initAdoptCat() {
  const form = document.querySelector('#adopt-cat form');
  if (!form) return;

  // container de resultados
  let resultsContainer = $('#adopt-results-container');
  if (!resultsContainer) {
    resultsContainer = el('div', 'mt-8');
    resultsContainer.id = 'adopt-results-container';
    resultsContainer.setAttribute('aria-live', 'polite');
    form.parentNode.appendChild(resultsContainer);
  }

  // habilita botão
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
      const data = await postJSON(N8N_WEBHOOK_ADOPT, payload);
      renderAdoptionResults(resultsContainer, data);
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      resultsContainer.innerHTML = '<div class="text-red-600" role="alert">Erro ao buscar anúncios. Tente novamente.</div>';
    }
  });
}