// adoptCat.js
import { callN8nWebhook, $, show, hide } from './utils.js';

function bestUrl(anuncio) {
    return anuncio?.url && anuncio.url.startsWith('http') ? anuncio.url : null;
}

function el(tag, className = '', text = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
}

export function renderAdoptionResults(container, data) {
    container.innerHTML = '';

    const msg = el('div', 'mb-4 font-semibold text-green-700', data.mensagem || '');
    container.appendChild(msg);

    let anuncios = data.anuncios || [];

    // Se não houver anúncios reais, cria sugestões padrão (Google e OLX)
    if (!anuncios.length) {
        anuncios = [
            {
                titulo: 'Resultados de adoção perto de você (Google)',
                descricao: 'Busca sugerida de adoção de gatos.',
                url: 'https://www.google.com/search?q=ado%C3%A7%C3%A3o+de+gatos',
                fonte: 'google.com',
                score: 7
            },
            {
                titulo: 'Veja anúncios de adoção no OLX',
                descricao: 'Busca sugerida de gatos disponíveis para adoção no OLX.',
                url: 'https://www.olx.com.br/brasil?q=ado%C3%A7%C3%A3o+de+gatos',
                fonte: 'olx.com.br',
                score: 8
            }
        ];
    }

    const list = el('ul', 'space-y-6');

    anuncios.forEach(anuncio => {
        const item = el(
            'li',
            'flex flex-col sm:flex-row items-start bg-white rounded-lg shadow p-4 hover:shadow-lg transition group'
        );

        // Score badge
        const badgeWrap = el('div', 'flex flex-col items-center mr-4 mb-2 sm:mb-0');
        const scoreLabel = el('div', 'text-xs font-semibold text-yellow-700 mb-1 text-center', 'Score da IA');
        const badge = el(
            'span',
            'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500 cursor-help select-none',
            Math.round(anuncio.score * 100) || 0
        );
        badge.setAttribute('title', 'Selo de confiabilidade: quanto maior o score, mais confiável o anúncio segundo a IA.');

        badgeWrap.appendChild(scoreLabel);
        badgeWrap.appendChild(badge);

        // Conteúdo
        const content = el('div', 'flex-1 w-full');

        // Título + descrição no mesmo bloco
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

        const titleDescWrap = el('div', 'flex flex-col gap-1 mb-2');
        titleDescWrap.appendChild(titleEl);
        if (anuncio.descricao) titleDescWrap.appendChild(desc);

        // Fonte
        if (anuncio.fonte) {
            const fonte = el('span', 'text-xs text-gray-400 font-semibold mt-1', anuncio.fonte);
            titleDescWrap.appendChild(fonte);
        }

        content.appendChild(titleDescWrap);
        item.appendChild(badgeWrap);
        item.appendChild(content);
        list.appendChild(item);
    });

    container.appendChild(list);
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

    form.addEventListener('submit', async e => {
        e.preventDefault();
        resultsContainer.innerHTML = '<div class="text-gray-500 text-sm">Buscando anúncios...</div>';

        const payload = {
            age: document.querySelector('#cat-age').value,
            color: document.querySelector('#cat-color').value,
            localizacao: document.querySelector('#cat-location').value
        };

        try {
            const webhookUrl = 'https://ipierette-cloud.app.n8n.cloud/webhook/adote-gatinho';
            const results = await callN8nWebhook(webhookUrl, payload);
            renderAdoptionResults(resultsContainer, results);
        } catch (error) {
            resultsContainer.innerHTML = '<div class="text-red-600" role="alert">Erro ao buscar anúncios. Tente novamente.</div>';
        }
    });
}
