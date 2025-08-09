// js/modules/adoptCat.js
// Autônomo: sem imports de utils.js

const N8N_WEBHOOK_ADOPT = 'https://ipierette-cloud.app.n8n.cloud/webhook/adote-gatinho';

// Helpers DOM
const $ = (sel, root = document) => root.querySelector(sel);
function el(tag, className = '', text = '') {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text) n.textContent = text;
  return n;
}

// HTTP (substitui callN8nWebhook utils)
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

function bestUrl(anuncio) {
  try {
    const raw = anuncio?.url || anuncio?.link || '';
    if (!raw) return null;
    const hasProto = /^https?:\/\//i.test(raw);
    return new URL(hasProto ? raw : 'https://' + raw).toString();
  } catch { return null; }
}
function hostname(u) {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'desconhecida'; }
}

function renderSadNotice(container) {
  const box = el('div','mt-4 mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800');
  const p = el('p','text-sm leading-relaxed');
  p.innerHTML =
    '😿 <strong>Ops!</strong> Apesar da quantidade enorme de fofuras sem lar, não conseguimos selecionar anúncios confiáveis via automação agora. ' +
    'Por favor, use os <em>links genéricos</em> abaixo para ao menos dar uma olhadinha.';
  box.appendChild(p);
  container.appendChild(box);
}

export function renderAdoptionResults(container, data) {
  container.innerHTML = '';

  if (data?.mensagem) {
    container.appendChild(el('div','mb-4 font-semibold text-green-700', data.mensagem));
  }

  let anuncios = Array.isArray(data?.anuncios) ? data.anuncios : [];
  const onlyFallbacks = Boolean(data?.meta?.onlyFallbacks);

  if (!anuncios.length) {
    anuncios = [
      {
        titulo: 'Resultados de adoção perto de você (Google)',
        descricao: 'Busca sugerida de adoção de gatos.',
        url: 'https://www.google.com/search?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'google.com',
        score: 0.80
      },
      {
        titulo: 'Veja anúncios de adoção no OLX',
        descricao: 'Busca sugerida de gatos disponíveis para adoção no OLX.',
        url: 'https://www.olx.com.br/brasil?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'olx.com.br',
        score: 0.70
      }
    ];
  }

  if (onlyFallbacks) renderSadNotice(container);

  const list = el('ul','space-y-6');
  container.appendChild(list);

  anuncios.forEach(anuncio => {
    const li = el('li','flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition group');

    // Badge score
    const badgeWrap = el('div','flex flex-col items-center mr-4 mb-2 sm:mb-0');
    badgeWrap.appendChild(el('div','text-xs font-semibold text-yellow-700 mb-1 text-center','Score da IA'));
    const scoreRaw = typeof anuncio.score === 'number' ? anuncio.score : Number(anuncio.score) || 0;
    const shown = scoreRaw > 1 ? Math.round(scoreRaw) : Math.round(scoreRaw * 100);
    const badge = el('span','inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500 cursor-help select-none', String(shown || 0));
    badge.title = 'Selo de confiabilidade: quanto maior o score, mais confiável o anúncio segundo a IA.';
    badgeWrap.appendChild(badge);

    // Conteúdo
    const content = el('div','flex-1 w-full');
    const href = bestUrl(anuncio);
    const titleText = anuncio.titulo || 'Anúncio de Adoção';
    const titleEl = href
      ? (() => {
          const a = el('a','text-lg font-bold text-blue-700 group-hover:underline mr-2 break-normal focus:outline-green-500', titleText);
          a.href = href; a.target = '_blank'; a.rel = 'noopener';
          return a;
        })()
      : el('span','text-lg font-bold text-gray-700 mr-2 break-normal', `${titleText} (sem link)`);

    const desc = el('p','text-gray-700 text-sm', anuncio.descricao || '');
    const fonte = el('div','text-xs text-gray-400', `Fonte: ${anuncio.fonte || (href ? hostname(href) : 'desconhecida')}`);

    const block = el('div','flex flex-col gap-1 mb-2');
    block.appendChild(titleEl);
    if (anuncio.descricao) block.appendChild(desc);
    block.appendChild(fonte);

    content.appendChild(block);
    li.appendChild(badgeWrap);
    li.appendChild(content);
    list.appendChild(li);
  });
}

export function initAdoptCat() {
  const form = document.querySelector('#adopt-cat form');
  if (!form) return;

  let resultsContainer = document.querySelector('#adopt-results-container');
  if (!resultsContainer) {
    resultsContainer = el('div','mt-8');
    resultsContainer.id = 'adopt-results-container';
    resultsContainer.setAttribute('aria-live','polite');
    form.parentNode.appendChild(resultsContainer);
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('opacity-50','cursor-not-allowed'); }

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
    } catch (err) {
      console.error('Erro ao buscar anúncios:', err);
      resultsContainer.innerHTML = '<div class="text-red-600" role="alert">Erro ao buscar anúncios. Tente novamente.</div>';
    }
  });
}
