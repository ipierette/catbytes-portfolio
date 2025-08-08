// js/modules/adoptCat.js

// Endpoint do n8n Cloud
const N8N = {
  ADOPT_CAT: 'https://ipierette-cloud.app.n8n.cloud/webhook/adote-gatinho',
};

// Utils DOM
const $ = (s) => document.querySelector(s);

// Valida URL segura (http/https)
function parseUrlSafe(raw) {
  try {
    const u = new URL(String(raw));
    if (u.protocol === 'http:' || u.protocol === 'https:') return u;
  } catch (_) {}
  return null;
}

// Extrai domínio para "Fonte"
function domainFrom(urlObj) {
  return urlObj ? urlObj.hostname.replace(/^www\./, '') : '';
}

// Chamada genérica
async function callN8nWebhook(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(()=>'');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

function renderResults(container, data) {
  container.innerHTML = '';

  const msg = document.createElement('div');
  msg.className = 'mb-4 font-semibold text-green-700';
  msg.textContent = data?.mensagem || '';
  container.appendChild(msg);

  const items = Array.isArray(data?.anuncios) ? data.anuncios : [];
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'text-gray-500 italic';
    empty.textContent = 'Nenhum anúncio encontrado para sua busca.';
    empty.setAttribute('role', 'status');
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'space-y-6';

  items.forEach(a => {
    const item = document.createElement('li');
    item.className = 'flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition';

    // badge
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'flex flex-col items-center mr-4 mb-2 sm:mb-0';
    const scoreLabel = document.createElement('div');
    scoreLabel.className = 'text-xs font-semibold text-yellow-700 mb-1 text-center';
    scoreLabel.textContent = 'Score da IA';
    const badge = document.createElement('span');
    badge.className = 'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500';
    badge.textContent = a?.score ? Math.round(a.score * 100) : 0;
    badgeWrap.appendChild(scoreLabel);
    badgeWrap.appendChild(badge);

    // conteúdo
    const content = document.createElement('div');
    content.className = 'flex-1 w-full';

    // título (link só se URL válida)
    const top = document.createElement('div');
    top.className = 'mb-2 w-full';

    const urlObj = parseUrlSafe(a?.url);
    const titleText = a?.titulo || 'Anúncio de Adoção';

    if (urlObj) {
      const aTag = document.createElement('a');
      aTag.href = urlObj.toString();
      aTag.target = '_blank';
      aTag.rel = 'noopener noreferrer';
      aTag.className = 'text-lg font-bold text-blue-700 hover:underline break-all focus:outline-green-500';
      aTag.textContent = titleText;
      top.appendChild(aTag);
    } else {
      const span = document.createElement('span');
      span.className = 'text-lg font-bold text-gray-800 break-all';
      span.textContent = `${titleText} (sem link)`;
      top.appendChild(span);
    }

    // descrição
    const desc = document.createElement('p');
    desc.className = 'text-gray-700 text-sm mt-1';
    desc.textContent = a?.descricao || '';

    // fonte (depois da descrição)
    const fonte = document.createElement('div');
    fonte.className = 'text-xs text-gray-500 mt-1';
    const fonteDom = domainFrom(urlObj);
    fonte.textContent = `Fonte: ${fonteDom || (a?.fonte || 'desconhecida')}`;

    content.appendChild(top);
    content.appendChild(desc);
    content.appendChild(fonte);

    item.appendChild(badgeWrap);
    item.appendChild(content);
    list.appendChild(item);
  });

  container.appendChild(list);
}

export function initAdoptCat() {
  const form = document.querySelector('#adopt-cat form');
  if (!form) return;

  let results = document.querySelector('#adopt-results-container');
  if (!results) {
    results = document.createElement('div');
    results.id = 'adopt-results-container';
    results.setAttribute('aria-live','polite');
    results.className = 'mt-8';
    form.parentNode.appendChild(results);
  }

  // habilita o botão
  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = false;
    btn.classList.remove('opacity-50','cursor-not-allowed');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    results.innerHTML = '<div class="text-gray-500 text-sm">Buscando anúncios...</div>';

    const payload = {
      age: document.querySelector('#cat-age')?.value || '',
      color: document.querySelector('#cat-color')?.value || '',
      localizacao: document.querySelector('#cat-location')?.value || '',
    };

    try {
      const data = await callN8nWebhook(N8N.ADOPT_CAT, payload);
      renderResults(results, data);
    } catch (err) {
      console.error('[Adopt] erro:', err);
      results.innerHTML = `<div class="text-red-600" role="alert">
        Erro ao buscar anúncios. ${err?.message || 'Tente novamente.'}
      </div>`;
    }
  });
}
