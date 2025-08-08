// js/modules/generateAd.js

const N8N = {
  GENERATE_AD: '', // quando criar o workflow, cole aqui
};

const $ = (s) => document.querySelector(s);
const show = (el) => el && el.classList.remove('hidden');
const hide = (el) => el && el.classList.add('hidden');

async function callN8nWebhook(url, payload) {
  const res = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

export function initGenerateAd() {
  const btn = $('#generate-ad-btn');
  if (!btn) return;

  const input = $('#cat-description');
  const box = $('#generated-ad-container');
  const text = $('#generated-ad-text');
  const loader = $('#loading-indicator');

  btn.addEventListener('click', async () => {
    const description = (input?.value || '').trim();
    if (!description) {
      alert('Por favor, descreva o gatinho para gerar o anúncio.');
      return;
    }
    if (!N8N.GENERATE_AD) {
      alert('A geração de anúncio ainda não está disponível. Em breve!');
      return;
    }

    show(loader); hide(box);
    try {
      const payload = {
        description,
        prompt: `Gere um anúncio atraente para doação de um gatinho com as seguintes características: ${description}. Inclua um título cativante e um apelo emocional.`
      };
      const out = await callN8nWebhook(N8N.GENERATE_AD, payload);
      if (out?.generatedText) text.textContent = out.generatedText;
      else throw new Error('Resposta inesperada do servidor.');
    } catch (e) {
      text.textContent = 'Ocorreu um erro ao gerar o anúncio. Tente novamente.';
      console.error('[GenerateAd] erro:', e);
    } finally {
      hide(loader); show(box);
    }
  });
}
