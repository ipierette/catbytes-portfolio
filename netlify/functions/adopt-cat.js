// netlify/functions/adopt-cat.js
// Versão refatorada com IA (Gemini) para scoring, melhor estrutura e resiliência.

const SOURCE_SITES = [
  'olx.com.br', 'adoteumgatinho.org.br', 'catland.org.br', 'adotepetz.com.br',
  'adotebicho.com.br', 'paraisodosfocinhos.com.br', 'adoteumpet.com.br'
];
const BAD_WORDS = [
  'venda', 'vende-se', 'valor', 'preço', 'r$', 'custo', 'taxa'
];

const isValidUrl = (u) => {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
};

const jsonResponse = (status, data) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// Helper para pontuar um anúncio usando a IA do Gemini
async function getAIScore(anuncio, apiKey) {
  const { titulo, descricao } = anuncio;
  if (!apiKey) return { score: 5, reason: "Chave da IA não configurada." };

  const prompt = `
    Você é um assistente de IA treinado para avaliar a qualidade e confiabilidade de anúncios de adoção de animais.
    Analise o título e a descrição do anúncio fornecidos.
    Retorne APENAS um objeto JSON com o seguinte formato: {"score": <de 1 a 10>, "reason": "Justificativa curta"}.

    - Score 1-3 (Baixo): Anúncio vago, com pouca informação, ou que parece suspeito.
    - Score 4-7 (Médio): Anúncio razoável, com informações básicas, mas que poderia ser mais detalhado.
    - Score 8-10 (Alto): Anúncio claro, detalhado, que inspira confiança, mencionando cuidados, temperamento, etc.

    Título: "${titulo}"
    Descrição: "${descricao}"
  `;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);

    return { score: 4, reason: "Não foi possível analisar com a IA." };
  } catch (error) {
    console.error("Erro na chamada da IA:", error);
    return { score: 4, reason: "Falha ao contatar a IA." };
  }
}

// Fallback para o método de scoring antigo se a IA falhar
function getSimpleScore(anuncio, { color, localizacao }) {
  let s = 0;
  const desc = anuncio.descricao.toLowerCase();
  if (color && desc.includes(color.toLowerCase())) s += 0.35;
  if (localizacao && desc.includes(localizacao.toLowerCase())) s += 0.35;
  s += Math.min(anuncio.descricao.length / 220, 0.3);
  return Math.round(s * 10); // Retorna de 0 a 10
}

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return jsonResponse(405, { error: 'Method Not Allowed' });
    }

    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!SERPAPI_KEY) {
      return jsonResponse(500, { error: 'Chave da SerpApi não configurada no ambiente.' });
    }

    const body = JSON.parse(event.body || '{}');
    const { age = '', color = '', localizacao = '' } = body;

    const terms = ['adoção de gatos'];
    if (color) terms.push(`gato ${color}`);
    if (age) terms.push(String(age));
    if (localizacao) terms.push(localizacao);

    const siteFilter = SOURCE_SITES.map(s => `site:${s}`).join(' OR ');
    const query = `${terms.join(' ')} -filhotes ${siteFilter}`; // Adiciona '-filhotes' para evitar sites de venda

    const serpUrl = new URL('https://serpapi.com/search');
    Object.entries({
      engine: 'google',
      hl: 'pt-BR',
      gl: 'br',
      num: '12',
      q: query,
      api_key: SERPAPI_KEY,
    }).forEach(([key, value]) => serpUrl.searchParams.set(key, value));

    const res = await fetch(serpUrl.toString());
    if (!res.ok) {
      const text = await res.text();
      console.error("Erro SerpAPI:", text);
      return jsonResponse(502, { error: 'Falha ao buscar anúncios na fonte externa.' });
    }
    const data = await res.json();

    const raw = Array.isArray(data.organic_results) ? data.organic_results : [];
    let anuncios = raw
      .map(r => ({
        titulo: r.title || 'Anúncio de Adoção',
        descricao: r.snippet || '',
        url: r.link || '',
        fonte: r.displayed_link || r.source || 'desconhecida',
        score: 0,
      }))
      .filter(a =>
        a.descricao &&
        a.descricao.length >= 40 &&
        !BAD_WORDS.some(w => a.descricao.toLowerCase().includes(w)) &&
        a.url && isValidUrl(a.url)
      );

    if (anuncios.length > 0) {
      // Pontua todos os anúncios em paralelo usando IA
      const scoringPromises = anuncios.map(anuncio =>
        getAIScore(anuncio, GEMINI_KEY).catch(e => {
          console.error("Promise de score rejeitada:", e);
          return null; // Garante que Promise.all não falhe
        })
      );
      const scores = await Promise.all(scoringPromises);

      anuncios.forEach((anuncio, index) => {
        const aiResult = scores[index];
        if (aiResult && aiResult.score) {
          anuncio.score = aiResult.score / 10; // Normaliza para 0-1 para o frontend
        } else {
          // Usa o scoring antigo como fallback
          anuncio.score = getSimpleScore(anuncio, body) / 10;
        }
      });

      // Ordena pelo score e pega os 6 melhores
      anuncios.sort((a, b) => (b.score || 0) - (a.score || 0));
      anuncios = anuncios.slice(0, 6);
    }

    if (!anuncios.length) {
      const qBase = encodeURIComponent(terms.join(' '));
      anuncios = [
        {
          titulo: 'Resultados de adoção no Google',
          descricao: 'Busca direta com os melhores resultados próximos.',
          url: `https://www.google.com/search?q=${qBase}&tbm=isch`,
          fonte: 'google.com',
          score: 0.5,
        },
        {
          titulo: 'Busque por ONGs na sua região',
          descricao: 'Encontre organizações de resgate e proteção animal perto de você.',
          url: `https://www.google.com/search?q=ongs+de+adocao+de+animais+${encodeURIComponent(localizacao || '')}`,
          fonte: 'google.com',
          score: 0.5,
        },
      ];
      return jsonResponse(200, {
        sucesso: true,
        quantidade: anuncios.length,
        anuncios,
        mensagem: 'Não achamos anúncios específicos. Que tal tentar uma busca mais ampla?',
        meta: { onlyFallbacks: true, engine: 'serpapi-google', terms, sites: SOURCE_SITES },
      });
    }

    return jsonResponse(200, {
      sucesso: true,
      quantidade: anuncios.length,
      anuncios,
      mensagem: 'Veja os anúncios de adoção que encontramos e analisamos para você.',
      meta: { engine: 'serpapi-google', terms, sites: SOURCE_SITES },
    });
  } catch (err) {
    console.error("Erro inesperado no handler:", err);
    return jsonResponse(500, { error: `Erro interno no servidor: ${err.message}` });
  }
};
