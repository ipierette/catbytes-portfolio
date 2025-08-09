// js/modules/adoptCat.js

// ————————————————————————————————
// Config
// ————————————————————————————————
const N8N_WEBHOOK_ADOPT = 'https://ipierette-cloud.app.n8n.cloud/webhook/adote-gatinho';

// ————————————————————————————————
// Helpers DOM
// ————————————————————————————————
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => root.querySelectorAll(sel);

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

// ————————————————————————————————
// HTTP
// ————————————————————————————————
async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} – ${res.statusText} ${text ? '· ' + text : ''}`);
  }
  return res.json();
}

// ————————————————————————————————
// Renderização
// ————————————————————————————————
function safeHostnameFrom(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function bestUrl(anuncio) {
  // Seja defensiva: diferentes fontes podem nomear o link de forma diferente
  const candidate = anuncio?.url || anuncio?.link || anuncio?.href || anuncio?.result_url || '';
  if (!candidate || typeof candidate !== 'string') return '';
  try {
    // se vier sem protocolo, tenta “consertar”
    if (!/^https?:\/\//i.test(candidate) && /^[\w.-]+\.[a-z]{2,}([/:].*)?$/i.test(candidate)) {
      return new URL('https://' + candidate).toString();
    }
    return new URL(candidate).toString();
  } catch {
    return '';
  }
}

function renderAdoptionResults(container, data) {
  container.innerHTML = '';

  // Mensagem de status
  const msg = el('div', 'mb-4 font-semibold text-green-700', data?.mensagem || '');
  container.appendChild(msg);

  const anuncios = Array.isArray(data?.anuncios) ? data.anuncios : [];
  if (!anuncios.length) {
    const empty = el('div', 'text-gray-500 italic', 'Nenhum anúncio encontrado para sua busca.');
    empty.setAttribute('role', 'status');
    container.appendChild(empty);
    return;
  }

  // Opcional: log dos 3 primeiros para debug
  try { console.table(anuncios.slice(0, 3)); } catch {}

  const ul = el('ul', 'space-y-6');
  container.appendChild(ul);

  anuncios.forEach((anuncio) => {
    const li = el('li', 'flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition group');

    // Coluna badge (score)
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

    // Coluna conteúdo
    const content = el('div', 'flex-1 w-full');

    // Linha topo: título/link
    const topRow = el('div', 'flex flex-col sm:flex-row sm:items-center mb-2 w-full');

    const href = bestUrl(anuncio);
    const titleText = anuncio?.titulo || 'Anúncio de Adoção';
    if (href) {
      const a = el('a', 'text-lg font-bold text-blue-700 group-hover:underline mr-2 break-all focus:outline-green-500', titleText);
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', `Abrir anúncio: ${titleText}`);
      topRow.appendChild(a);
    } else {
      const span = el('span', 'text-lg font-bold text-gray-700 mr-2 break-all', `${titleText} (sem link)`);
      topRow.appendChild(span);
    }

    // Descrição
    const desc = el('p', 'text-gray-700 text-sm mt-1 mb-2', anuncio?.descricao || '');
    // Fonte (sempre após a descrição)
    const fonteTextRaw = anuncio?.fonte && anuncio.fonte !== 'desconhecida'
      ? anuncio.fonte
      : (href ? safeHostnameFrom(href) : 'desconhecida');
    const fonte = el('div', 'text-xs text-gray-400', `Fonte: ${fonteTextRaw || 'desconhecida'}`);

    // Monta
    content.appendChild(topRow);
    content.appendChild(desc);
    content.appendChild(fonte);

    li.appendChild(badgeWrap);
    li.appendChild(content);
    ul.appendChild(li);
  });
}

// ————————————————————————————————
// Setup principal
// ————————————————————————————————
export function initAdoptCat() {
  const form = document.querySelector('#adopt-cat form');
  if (!form) return;

  // Garante o container de resultados
  let resultsContainer = $('#adopt-results-container');
  if (!resultsContainer) {
    resultsContainer = el('div', 'mt-8');
    resultsContainer.id = 'adopt-results-container';
    resultsContainer.setAttribute('aria-live', 'polite');
    form.parentNode.appendChild(resultsContainer);
  }

  // Habilita botão (se estiver desabilitado no HTML)
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
      localizacao: $('#cat-location')?.value || ''
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
