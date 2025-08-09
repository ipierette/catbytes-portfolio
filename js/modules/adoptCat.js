// js/modules/adoptCat.js
import { callN8nWebhook } from './utils.js';

// link “seguro”
function bestUrl(anuncio) {
  try {
    const u = anuncio?.url || anuncio?.link || '';
    if (!u) return null;
    const hasProto = /^https?:\/\//i.test(u);
    return new URL(hasProto ? u : 'https://' + u).toString();
  } catch {
    return null;
  }
}

const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, className = '', text = '') {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text) n.textContent = text;
  return n;
}

function renderSadNotice(container) {
  const box = el(
    'div',
    'mt-4 mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800'
  );
  const msg = el(
    'p',
    'text-sm leading-relaxed'
  );
  msg.innerHTML =
    '😿 <strong>Ops!</strong> Apesar da quantidade enorme de fofuras sem lar, não conseguimos selecionar anúncios confiáveis via automação agora. ' +
    'Por favor, use os <em>links genéricos</em> abaixo para ao menos dar uma olhadinha — e quem sabe achar seu novo(a) aum… digo, miauor amigo(a)!';

  box.appendChild(msg);
  container.appendChild(box);
}

export function renderAdoptionResults(container, data) {
  container.innerHTML = '';

  // título/mensagem do servidor (quando vier)
  if (data?.mensagem) {
    container.appendChild(
      el('div', 'mb-4 font-semibold text-green-700', data.mensagem)
    );
  }

  let anuncios = Array.isArray(data?.anuncios) ? data.anuncios : [];

  // Se o backend disser que são só fallbacks, avisa com o gatinho triste
  const onlyFallbacks = Boolean(data?.meta?.onlyFallbacks);

  if (!anuncios.length) {
    // fallback extra de segurança no front (com score alto)
    anuncios = [
      {
        titulo: 'Resultados de adoção perto de você (Google)',
        descricao: 'Busca sugerida de adoção de gatos.',
        url: 'https://www.google.com/search?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'google.com',
        score: 6
      },
      {
        titulo: 'Veja anúncios de adoção no OLX',
        descricao: 'Busca sugerida de gatos disponíveis para adoção no OLX.',
        url: 'https://www.olx.com.br/brasil?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'olx.com.br',
        score: 7
      }
    ];
  }

  if (onlyFallbacks) {
    renderSadNotice(container);
  }

  const list = el('ul', 'space-y-6');
  container.appendChild(list);

  anuncios.forEach((anuncio) => {
    const li = el(
      'li',
      'flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition group'
    );

    // Badge (score)
    const badgeWrap = el('div', 'flex flex-col items-center mr-4 mb-2 sm:mb-0');
    badgeWrap.appendChild(
      el('div', 'text-xs font-semibold text-yellow-700 mb-1 text-center', 'Score da IA')
    );

    const scoreRaw = typeof anuncio.score === 'number'
      ? anuncio.score
      : Number(anuncio.score) || 0;

    const scoreShown = scoreRaw > 1 ? Math.round(scoreRaw) : Math.round(scoreRaw * 100);

    const badge = el(
      'span',
      'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500 cursor-help select-none',
      String(scoreShown || 0)
    );
    badge.title = 'Selo de confiabilidade: quanto maior o score, mais confiável o anúncio segundo a IA.';
    badgeWrap.appendChild(badge);

    // Conteúdo (alinhado à esquerda, título e descrição juntos)
    const content = el('div', 'flex-1 w-full');

    const href = bestUrl(anuncio);
    const titleText = anuncio.titulo || 'Anúncio de Adoção';

    const titleEl = href
      ? (() => {
          const a = el(
            'a',
            'text-lg font-bold text-blue-700 group-hover:underline mr-2 break-normal focus:outline-green-500',
            titleText
          );
          a.href = href;
          a.target = '_blank';
          a.rel = 'noopener';
          return a;
        })()
      : el('span', 'text-lg font-bold text-gray-700 mr-2 break-normal', `${titleText} (sem link)`);

    const desc = el('p', 'text-gray-700 text-sm', anuncio.descricao || '');

    // bloco título + descrição (um abaixo do outro) = alinhado à esquerda
    const titleDescWrap = el('div', 'flex flex-col gap-1 mb-2');
    titleDescWrap.appendChild(titleEl);
    if (anuncio.descricao) titleDescWrap.appendChild(desc);

    const fonte = el(
      'div',
      'text-xs text-gray-400',
      `Fonte: ${anuncio.fonte || (href ? new URL(href).hostname.replace(/^www\./,'') : 'desconhecida')}`
    );

    content.appendChild(titleDescWrap);
    content.appendChild(fonte);

    li.appendChild(badgeWrap);
    li.appendChild(content);
    list.appendChild(li);
  });
}

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
      resultsContainer.innerHTML = '<div class="text-red-600" role="alert">Erro ao buscar anúncios. Tente novamente.</div>';
    }
  });
}
