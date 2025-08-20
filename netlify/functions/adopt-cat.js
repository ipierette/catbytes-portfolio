// netlify/functions/adopt-cat.js
// Versão refatorada com IA (Gemini) para scoring, melhor estrutura e resiliência.

const SOURCE_SITES = [
  'olx.com.br', 'adoteumgatinho.org.br', 'catland.org.br', 'adotepetz.com.br',
  'adotebicho.com.br', 'paraisodosfocinhos.com.br', 'adoteumpet.com.br'
];
const BAD_WORDS = [
  // 'custo' e 'taxa' foram removidos. A IA é mais capaz de julgar o contexto.
  'venda', 'vende-se', 'valor', 'preço', 'r$'
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
  const { titulo, descricao, fonte } = anuncio;
  if (!apiKey) return { score: 5, reason: "Chave da IA não configurada." };

  const prompt = `
    Você é um assistente de IA especialista em avaliar a qualidade de anúncios de adoção de gatos no Brasil.
    Analise o título, descrição e fonte.
    Retorne APENAS um objeto JSON com o formato: {"score": <1-10>, "reason": "Justificativa curta", "is_adopted": <true/false>}.

    CRITÉRIOS DE PONTUAÇÃO (3 NÍVEIS):
    - **Excelente (8-10):** Anúncio de ONG reconhecida (adoteumgatinho.org.br, catland.org.br). É detalhado, com informações sobre castração, vacinas, temperamento.
      - **IMPORTANTE:** Se o anúncio mencionar "ADOTADO", "ADOTADA", etc., isso é um SINAL POSITIVO. Mantenha o score alto (9 ou 10) e defina "is_adopted": true. O objetivo é levar o usuário a conhecer a ONG.
      - Se mencionar "taxa de adoção", também é um sinal positivo de uma ONG séria.
    - **Bom (5-7):** Anúncio claro de outras fontes, com informações essenciais. Inspira confiança, mas não é de uma ONG de topo.
    - **Baixo (1-4):** Anúncio vago, suspeito, com pouca informação ou que pareça comercial (venda explícita).

    INFORMAÇÕES DO ANÚNCIO:
    - Título: "${titulo}"
    - Descrição: "${descricao}"
    - Fonte: "${fonte}"
  `;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Garante que a propriedade is_adopted sempre exista como booleano
        parsed.is_adopted = !!parsed.is_adopted;
        return parsed;
    }

    return { score: 4, reason: "Não foi possível analisar com a IA.", is_adopted: false };
  } catch (error) {
    console.error("Erro na chamada da IA:", error);
    return { score: 4, reason: "Falha ao contatar a IA.", is_adopted: false };
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

// Helper para executar uma busca na SerpApi e normalizar os resultados
async function runQueryAndParse(query, apiKey) {
  const serpUrl = new URL('https://serpapi.com/search');
  Object.entries({
    engine: 'google',
    hl: 'pt-BR',
    gl: 'br',
    num: '10', // Pede 10 por busca
    q: query,
    api_key: apiKey,
  }).forEach(([key, value]) => serpUrl.searchParams.set(key, value));

  try {
    const res = await fetch(serpUrl.toString());
    if (!res.ok) {
      console.error(`SerpAPI query failed for "${query}": ${res.status}`);
      return [];
    }
    const data = await res.json();
    const raw = Array.isArray(data.organic_results) ? data.organic_results : [];

    return raw
      .map(r => ({
        titulo: r.title || 'Anúncio de Adoção',
        descricao: r.snippet || '',
        url: r.link || '',
        fonte: r.displayed_link || r.source || 'desconhecida',
        score: 0,
      }))
      .filter(a =>
        a.descricao && a.descricao.length >= 40 &&
        !BAD_WORDS.some(w => a.descricao.toLowerCase().includes(w)) &&
        a.url && isValidUrl(a.url)
      );
  } catch (error) {
    console.error(`Error fetching or parsing SerpAPI for query "${query}":`, error);
    return [];
  }
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

    // --- Estratégia de busca em múltiplos estágios ---
    const siteFilter = SOURCE_SITES.map(s => `site:${s}`).join(' OR ');

    const specificTerms = ['adoção de gatos'];
    if (color) specificTerms.push(`gato ${color}`);
    if (age) specificTerms.push(String(age));
    if (localizacao) specificTerms.push(localizacao);

    const broadTerms = ['adoção de gatos'];
    if (localizacao) broadTerms.push(localizacao);

    // Lista de queries, da mais específica para a mais ampla
    const queries = [
      `${specificTerms.join(' ')} -filhotes (${siteFilter})`,
      `${broadTerms.join(' ')} -filhotes (${siteFilter})`,
    ];

    // Se a localização for um estado ou cidade grande, faz uma busca mais ampla sem o filtro de sites
    if (localizacao.length > 3) {
      queries.push(`${broadTerms.join(' ')} -filhotes`);
    }

    const allResults = new Map(); // Usamos Map para desduplicar por URL

    for (const query of queries) {
      // Se já temos resultados suficientes, podemos parar de buscar.
      if (allResults.size >= 15) break;

      const newAds = await runQueryAndParse(query, SERPAPI_KEY);
      newAds.forEach(ad => {
        if (ad.url && !allResults.has(ad.url)) {
          allResults.set(ad.url, ad);
        }
      });
    }

    let anuncios = Array.from(allResults.values());

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
          anuncio.is_adopted = aiResult.is_adopted || false; // Adiciona o status de adoção
        } else {
          // Usa o scoring antigo como fallback
          anuncio.score = getSimpleScore(anuncio, body) / 10;
          anuncio.is_adopted = false; // Padrão para o fallback
        }
      });

      // Ordena pelo score
      anuncios.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    if (!anuncios.length) {
      const qBase = encodeURIComponent(broadTerms.join(' '));
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
        meta: { onlyFallbacks: true, engine: 'serpapi-google', terms: broadTerms, sites: SOURCE_SITES },
      });
    }

    return jsonResponse(200, {
      sucesso: true,
      quantidade: anuncios.length,
      anuncios,
      mensagem: 'Veja os anúncios de adoção que encontramos e analisamos para você.',
      meta: { engine: 'serpapi-google', terms: specificTerms, sites: SOURCE_SITES },
    });
  } catch (err) {
    console.error("Erro inesperado no handler:", err);
    return jsonResponse(500, { error: `Erro interno no servidor: ${err.message}` });
  }
};
