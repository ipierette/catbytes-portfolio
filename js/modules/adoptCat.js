// public/js/modules/adoptCat.js
// Mantém o fluxo original (submit -> Netlify -> render).
// Alterações APENAS visuais/responsividade (cards + badge do score).

const NETLIFY_FN = '/.netlify/functions/adopt-cat';

/* ---------------- Helpers ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, className = '', text = '') {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text) n.textContent = text;
  return n;
}

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${t ? ` · ${t}` : ''}`);
  }
  return res.json();
}

function bestUrl(anuncio) {
  try {
    const raw = anuncio?.url || anuncio?.link || '';
    if (!raw) return null;
    const hasProto = /^https?:\/\//i.test(raw);
    return new URL(hasProto ? raw : `https://${raw}`).toString();
  } catch {
    return null;
  }
}

function hostname(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return 'desconhecida';
  }
}

/* ---- clamp para evitar overflow em mobile ---- */
function clampLines(node, lines = 4) {
  if (!node) return;
  Object.assign(node.style, {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: String(lines),
    overflow: 'hidden'
  });
}

/* ---------------- Aviso fallback ---------------- */
function renderSadNotice(container) {
  const box = el(
    'div',
    'rounded-lg border border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-100/20 dark:text-amber-200 p-3 my-3'
  );
  const p = el(
    'p',
    'text-sm leading-relaxed',
    '😿 Ops! Apesar da quantidade enorme de fofuras sem lar, ainda não conseguimos selecionar anúncios confiáveis via automação agora. ' +
    'Por favor, use os links genéricos abaixo para ao menos dar uma olhadinha.'
  );
  box.appendChild(p);
  container.appendChild(box);
}

/* ---------------- Render principal (somente estilo/responsivo) ---------------- */
export function renderAdoptionResults(container, data, { append = false } = {}) {
  let list;
  const onlyFallbacks = Boolean(data?.meta?.onlyFallbacks);

  if (append) {
    // Se for para adicionar, encontra a lista existente e remove o botão antigo.
    list = container.querySelector('.grid');
    const oldBtn = container.querySelector('.show-more-btn');
    if (oldBtn) oldBtn.remove();
  } else {
    // Se for a primeira renderização, limpa tudo e cria a estrutura.
    container.innerHTML = '';
    if (data?.mensagem) {
      container.appendChild(
        el('div', 'mb-4 font-semibold text-emerald-700 dark:text-emerald-300', data.mensagem)
      );
    }
    list = el('div', 'mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3');
    container.appendChild(list);
  }

  if (!list) {
    console.error('Container da lista não encontrado para renderizar anúncios.');
    return;
  }

  let anuncios = Array.isArray(data?.anuncios) ? data.anuncios : [];

  if (!anuncios.length) {
    anuncios = [
      {
        titulo: 'Resultados de adoção perto de você (Google)',
        descricao: 'Busca sugerida de adoção de gatos.',
        url: 'https://www.google.com/search?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'google.com',
        score: 0.8,
      },
      {
        titulo: 'Veja anúncios de adoção no OLX',
        descricao: 'Busca sugerida de gatos disponíveis para adoção no OLX.',
        url: 'https://www.olx.com.br/brasil?q=ado%C3%A7%C3%A3o+de+gatos',
        fonte: 'olx.com.br',
        score: 0.7,
      },
    ];
  }

  anuncios.forEach((anuncio) => {
    const href = bestUrl(anuncio);

 const card = el(
  'article',
  [
    'flex flex-col gap-2',
    'rounded-xl border border-zinc-200 dark:border-zinc-700',
    // 👇 fundo claro no light, “midnight” no dark (sem classe custom)
    'bg-white dark:bg-[rgb(11,19,32)]',
    'shadow-sm hover:shadow-md transition',
    'p-4 sm:p-5'
  ].join(' ')
);

    // Layout responsivo: coluna no mobile, linha em telas maiores.
    // O texto também se alinha de acordo com o tamanho da tela.
    const top = el(
      'div',
      'flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left'
    );

    // Coluna esquerda: label + badge
    const badgeWrap = el('div', 'w-auto sm:w-[72px] shrink-0');
    badgeWrap.appendChild(
      el('div', 'text-[11px] font-medium text-zinc-500 dark:text-slate-300 mb-1', 'Score da IA')
    );

    // Normaliza score para 1–10
    let rawScore = Number(anuncio.score) || 0;
    if (rawScore <= 1) rawScore *= 10;                  // se veio 0–1, converte
    rawScore = Math.max(1, Math.min(10, rawScore));     // clamp 1–10
    const shown = Math.round(rawScore);

    const palette =
      rawScore >= 8
        ? { bg: 'bg-emerald-500', ring: 'ring-emerald-300/60' }
        : rawScore >= 5
          ? { bg: 'bg-amber-500',   ring: 'ring-amber-300/60' }
          : { bg: 'bg-rose-500',     ring: 'ring-rose-300/60' };

// === Tooltip click-only com auto-close, links enxutos e feedback no badge ===

// wrapper relativo para posicionar tooltip em relação ao badge
const tipWrap = el('div', 'relative inline-block');

// BOTÃO (badge clicável) — mantém seu visual + efeito de “levantar” no hover
const badgeBtn = el('button', [
  'inline-grid place-items-center',
  'w-12 h-12 rounded-full text-sm font-bold select-none',
  'text-white cursor-pointer',
  'ring-2 ring-offset-2',
  'ring-offset-white dark:ring-offset-zinc-900',
  'transition-transform transition-shadow duration-200',
  'hover:-translate-y-1 hover:shadow-lg',
  palette.bg, palette.ring
].join(' '), String(shown)); // use "shown" (ou score10) conforme seu arquivo
badgeBtn.type = 'button';
badgeBtn.setAttribute('aria-haspopup', 'dialog');
badgeBtn.setAttribute('aria-expanded', 'false');
badgeBtn.setAttribute('aria-label', `Score ${shown} de 10`);

// TOOLTIP (inicialmente fechado) — acima do badge, centralizado
const tooltip = el('div', [
  'invisible opacity-0 translate-y-1',
  'transition',
  'absolute z-50',
  'left-1/2 -translate-x-1/2',
  'bottom-full mb-2',                 // fica acima do botão
  'w-64 max-w-[82vw]',
  'rounded-xl px-3 py-2',
  'text-[12px] leading-relaxed',
  'shadow-xl ring-1 ring-black/10 dark:ring-white/10',
  'bg-white/95 dark:bg-gray-800/95',
  'text-gray-700 dark:text-gray-200',
  'backdrop-blur',
  'text-left'
].join(' '));
tooltip.setAttribute('role', 'tooltip');
tooltip.tabIndex = -1; // permite foco dentro do tooltip

// conteúdo enxuto
const level = shown >= 8 ? 'alto' : shown >= 5 ? 'moderado' : 'baixo';
tooltip.appendChild(el('div', 'font-semibold mb-1', `Score ${shown}/10 — nível ${level}`));
tooltip.appendChild(el(
  'div',
  '',
  level === 'alto'
    ? 'Confiabilidade alta. Ainda assim, verifique detalhes.'
    : (level === 'moderado'
        ? 'Confiabilidade moderada. Leia com atenção e peça mais infos.'
        : 'Confiabilidade baixa. Prefira fontes/ONGs reconhecidas.')
));

// LINKS enxutos com underline animado
const linksRow = el('div', 'flex gap-3 mt-2 text-[12px] flex-wrap');

// helper: cria link com underline animado
const proLink = (href, label) => {
  const a = el('a', [
    'relative text-sky-600 dark:text-sky-300 font-medium',
    'after:content-[""] after:absolute after:left-0 after:bottom-0',
    'after:w-0 after:h-[2px] after:bg-sky-500 dark:after:bg-sky-400',
    'after:transition-all after:duration-300',
    'hover:after:w-full hover:text-sky-700 dark:hover:text-sky-200'
  ].join(' '), label);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
};

linksRow.appendChild(proLink(
  'https://www.zooplus.pt/magazine/gatos/adotar-um-gato/10-coisas-que-deve-saber-antes-de-adotar-um-gato?utm_source=catbytes',
  'Zooplus'
));
linksRow.appendChild(proLink(
  'https://omeuanimal.elanco.com/pt/tutores/cuidados-basicos-antes-de-acolher-um-gato-em-casa?utm_source=catbytes',
  'OmeuAnimal'
));
tooltip.appendChild(linksRow);

// seta do balão, apontando para o centro do badge
const tipArrow = el('span', [
  'absolute top-full mt-0.5 left-1/2 -translate-x-1/2',
  'w-2 h-2 rotate-45',
  'bg-white dark:bg-gray-800',
  'ring-1 ring-black/5 dark:ring-white/10'
].join(' '));
tooltip.appendChild(tipArrow);

// estado + controle de abertura/fechamento
let isOpen = false;
let closeTimer = null;

const showTip = () => {
  tooltip.classList.remove('invisible', 'opacity-0', 'translate-y-1');
  badgeBtn.classList.add('ring-4', 'ring-sky-300/40', 'scale-105'); // feedback aberto
  badgeBtn.setAttribute('aria-expanded', 'true');
  isOpen = true;
};

const hideTip = () => {
  tooltip.classList.add('invisible', 'opacity-0', 'translate-y-1');
  badgeBtn.classList.remove('ring-4', 'ring-sky-300/40', 'scale-105');
  badgeBtn.setAttribute('aria-expanded', 'false');
  isOpen = false;
};

const scheduleClose = (delay = 350) => {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => { if (isOpen) hideTip(); }, delay);
};
const cancelClose = () => { clearTimeout(closeTimer); };

// abre/fecha no clique do badge
badgeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  isOpen ? hideTip() : showTip();
});

// interação do mouse/teclado/touch para auto-close
tipWrap.addEventListener('mouseenter', cancelClose);
tipWrap.addEventListener('mouseleave', () => scheduleClose(400));
tooltip.addEventListener('focusin', cancelClose);
tooltip.addEventListener('focusout', () => scheduleClose(400));
badgeBtn.addEventListener('blur', () => scheduleClose(400));

document.addEventListener('click', (e) => {
  if (!tipWrap.contains(e.target)) hideTip();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideTip();
});
window.addEventListener('scroll', hideTip, { passive: true });
window.addEventListener('resize', hideTip);

// monta no DOM
tipWrap.appendChild(badgeBtn);
tipWrap.appendChild(tooltip);
badgeWrap.appendChild(tipWrap);
// === /Tooltip click-only ===

    // Conteúdo (título, fonte, descrição)
    // Ocupa toda a largura no mobile e se torna flexível em telas maiores.
    const content = el('div', 'w-full sm:w-auto flex-1 min-w-0');

    const titleText = anuncio.titulo || 'Anúncio de Adoção';
    const titleEl = href
      ? (() => {
          const a = el(
            'a',
            [
              'text-[15px] sm:text-base font-semibold leading-snug',
              'text-sky-700 dark:text-sky-200', // azul suave no dark
              'hover:underline underline-offset-2',
              'break-words hyphens-auto'
            ].join(' '),
            titleText
          );
          a.href = href;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          clampLines(a, 3);
          return a;
        })()
      : (() => {
          const span = el(
            'span',
            'text-[15px] sm:text-base font-semibold leading-snug break-words hyphens-auto',
            titleText
          );
          clampLines(span, 3);
          return span;
        })();

    const source = el(
      'span',
      'text-xs text-zinc-500 dark:text-slate-300 align-middle',
      ` (${anuncio.fonte || hostname(href)})`
    );

    const desc = el(
      'p',
      'mt-1 text-sm sm:text-[15px] text-zinc-700 dark:text-white leading-relaxed break-words hyphens-auto',
      anuncio.descricao || ''
    );
    clampLines(desc, 4);

    content.appendChild(titleEl);
    content.appendChild(source);
    content.appendChild(desc);

    top.appendChild(badgeWrap);
    top.appendChild(content);
    card.appendChild(top);

    list.appendChild(card);
  });

  if (!append && onlyFallbacks) renderSadNotice(container);
}

/* ---------------- Entry point (lógica original mantida) ---------------- */
export function initAdoptCat() {
  const form = document.querySelector('#adopt-cat form');
  if (!form) return;

  // --- State para paginação ---
  let allAds = [];
  let currentPage = 0;
  let backendResponse = {};
  const ADS_PER_PAGE = 6;

  let resultsContainer = document.querySelector('#adopt-results-container');
  if (!resultsContainer) {
    resultsContainer = el('div', 'mt-8');
    resultsContainer.id = 'adopt-results-container';
    resultsContainer.setAttribute('aria-live', 'polite');
    form.parentNode.appendChild(resultsContainer);
  }

  const renderCurrentPage = () => {
    const isAppending = currentPage > 0;
    const startIndex = currentPage * ADS_PER_PAGE;
    const endIndex = startIndex + ADS_PER_PAGE;
    const adsForPage = allAds.slice(startIndex, endIndex);

    const dataForRender = {
      anuncios: adsForPage,
      // Mensagem e meta só na primeira página para não repetir
      mensagem: isAppending ? null : backendResponse.mensagem,
      meta: backendResponse.meta,
    };

    // A função agora pode adicionar ao container em vez de limpar.
    renderAdoptionResults(resultsContainer, dataForRender, { append: isAppending });

    // Adiciona o botão "Mostrar mais" se houver mais anúncios
    const hasMore = allAds.length > endIndex;
    if (hasMore) {
      const showMoreBtn = el(
        'button',
        // Adicionada a classe .show-more-btn para ser encontrada e removida
        'show-more-btn mt-6 w-full sm:w-auto mx-auto block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105',
        'Mostrar mais anúncios'
      );
      showMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderCurrentPage();
        // A rolagem para o topo foi removida para uma experiência de "carregar mais" mais suave.
      });
      resultsContainer.appendChild(showMoreBtn);
    }
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reseta o estado a cada nova busca
    currentPage = 0;
    allAds = [];
    backendResponse = {};

    const payload = {
      age: $('#cat-age', form)?.value || '',
      color: $('#cat-color', form)?.value || '',
      localizacao: $('#cat-location', form)?.value || '',
    };

    resultsContainer.innerHTML =
      '<div class="text-sm text-zinc-600 dark:text-zinc-300">🔍 Buscando anúncios...</div>';

    try {
      backendResponse = await postJSON(NETLIFY_FN, payload);
      allAds = backendResponse.anuncios || [];
      renderCurrentPage(); // Renderiza a primeira página
    } catch (err) {
      console.error('Erro ao buscar anúncios:', err);
      renderAdoptionResults(resultsContainer, { anuncios: [] });
      resultsContainer.appendChild(
        el(
          'div',
          'text-rose-600 dark:text-rose-300 mt-2',
          'Erro ao buscar anúncios. Tente novamente em instantes.'
        )
      );
    }
  });
}
