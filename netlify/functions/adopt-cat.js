// netlify/functions/adopt-cat.js
// Buscar anúncios de adoção + scoring com IA (Gemini REST) + fallbacks sólidos.

const SOURCE_SITES = [
  'olx.com.br', 'adoteumgatinho.org.br', 'catland.org.br', 'adotepetz.com.br',
  'adotebicho.com.br', 'paraisodosfocinhos.com.br', 'adoteumpet.com.br'
];

const BAD_WORDS = [
  // 'custo' e 'taxa' removidos — ONG séria pode mencionar “taxa de adoção”.
  'venda', 'vende-se', 'valor', 'preço', 'r$'
];

// === Utils ===
const isValidUrl = (u) => {
  try { new URL(u); return true; } catch { return false; }
};

const jsonResponse = (status, data) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

const DEBUG = String(process.env.DEBUG || '').toLowerCase() === 'true';

// === IA (Gemini REST) ===
// Retry simples + timeout para evitar travas silenciosas
async function withTimeout(promise, ms) {
  const t = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
  return Promise.race([promise, t]);
}

async function geminiRESTCall(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 256,
    },
  };

  const res = await withTimeout(fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }), 8000);

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Gemini HTTP ${res.status}: ${txt.slice(0, 400)}`);
  }

  const data = await res.json();
  // caminho padrão do texto
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return typeof text === 'string' ? text : '';
}

function extractJsonObject(textRaw) {
  const cleaned = (textRaw || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// Helper para pontuar um anúncio usando a IA do Gemini (REST)
async function getAIScore(anuncio, apiKey) {
  const { titulo, descricao, fonte } = anuncio;

  if (!apiKey) {
    if (DEBUG) console.error('[AI] GEMINI_API_KEY ausente — usando simple score.');
    return null; // deixa o fallback atuar
  }

  const prompt = `
Responda **apenas** com um JSON válido (sem markdown), no formato:
{"score": <1-10>, "reason": "<curta>", "is_adopted": <true|false>}

Regras de avaliação:
- 8-10: ONG reconhecida (adoteumgatinho.org.br, catland.org.br), anúncio detalhado (castração, vacinas, temperamento). Se constar "adotado"/"adotada": manter 9-10 e is_adopted=true. "taxa de adoção" é positivo.
- 4-7: bom/ok, confiável.
- 1-3: vago/suspeito/comercial (venda explícita).

Dados:
Titulo: ${JSON.stringify(titulo || "")}
Descricao: ${JSON.stringify(descricao || "")}
Fonte: ${JSON.stringify(fonte || "")}
`.trim();

  try {
    const text = await geminiRESTCall(prompt, apiKey);
    if (DEBUG) console.error('[AI] raw:', String(text).slice(0, 400));

    const parsed = extractJsonObject(text);
    if (!parsed) {
      if (DEBUG) console.error('[AI] JSON não encontrado/parseável.');
      return null;
    }

    const scoreNum = Number(parsed.score);
    const normalizedScore = Number.isFinite(scoreNum)
      ? Math.max(1, Math.min(10, scoreNum))
      : null;

    return {
      score: normalizedScore, // 1..10
      reason: typeof parsed.reason === 'string' ? parsed.reason.slice(0, 140) : 'Analisado.',
      is_adopted: !!parsed.is_adopted,
    };
  } catch (error) {
    if (DEBUG) console.error('[AI] Erro na chamada REST:', error);
    return null; // deixa fallback atuar
  }
}

// Fallback para o método de scoring antigo se a IA falhar
function getSimpleScore(anuncio, { color, localizacao }) {
  let s = 0;
  const desc = (anuncio.descricao || '').toLowerCase();
  if (color && desc.includes(String(color).toLowerCase())) s += 0.35;
  if (localizacao && desc.includes(String(localizacao).toLowerCase())) s += 0.35;
  s += Math.min((anuncio.descricao || '').length / 220, 0.3);
  return Math.round(s * 10); // 0..10
}

// Helper para executar uma busca na SerpApi e normalizar os resultados
async function runQueryAndParse(query, apiKey) {
  const serpUrl = new URL('https://serpapi.com/search');
  Object.entries({
    engine: 'google',
    hl: 'pt-BR',
    gl: 'br',
    num: '10',
    q: query,
    api_key: apiKey,
  }).forEach(([key, value]) => serpUrl.searchParams.set(key, value));

  try {
    const res = await fetch(serpUrl.toString());
    if (!res.ok) {
      if (DEBUG) console.error(`SerpAPI query failed "${query}": ${res.status}`);
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
    if (DEBUG) console.error(`Error fetching/parsing SerpAPI "${query}":`, error);
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

    // Estratégia de busca (específica -> ampla)
    const siteFilter = SOURCE_SITES.map(s => `site:${s}`).join(' OR ');

    const specificTerms = ['adoção de gatos'];
    if (color) specificTerms.push(`gato ${color}`);
    if (age) specificTerms.push(String(age));
    if (localizacao) specificTerms.push(localizacao);

    const broadTerms = ['adoção de gatos'];
    if (localizacao) broadTerms.push(localizacao);

    const queries = [
      `${specificTerms.join(' ')} -filhotes (${siteFilter})`,
      `${broadTerms.join(' ')} -filhotes (${siteFilter})`,
    ];
    if (localizacao && localizacao.length > 3) {
      queries.push(`${broadTerms.join(' ')} -filhotes`);
    }

    const allResults = new Map();

    for (const query of queries) {
      if (allResults.size >= 15) break;
      const newAds = await runQueryAndParse(query, SERPAPI_KEY);
      newAds.forEach(ad => { if (ad.url && !allResults.has(ad.url)) allResults.set(ad.url, ad); });
    }

    let anuncios = Array.from(allResults.values());

    if (anuncios.length > 0) {
      // IA em paralelo (REST), com fallback para simple score
      const scoringPromises = anuncios.map(anuncio =>
        getAIScore(anuncio, GEMINI_KEY).catch(e => {
          if (DEBUG) console.error("Promise de score rejeitada:", e);
          return null;
        })
      );
      const scores = await Promise.all(scoringPromises);

      anuncios.forEach((anuncio, index) => {
        const aiResult = scores[index];

        if (aiResult && typeof aiResult.score === 'number' && Number.isFinite(aiResult.score)) {
          anuncio.score = aiResult.score / 10; // 0..1 p/ frontend
          anuncio.is_adopted = !!aiResult.is_adopted;
          anuncio._ai_failed = false;
        } else {
          const simple = getSimpleScore(anuncio, body); // 0..10
          anuncio.score = simple / 10;
          anuncio.is_adopted = false;
          anuncio._ai_failed = true; // útil p/ depurar no front (mostrar "—" no badge, por ex.)
        }
      });

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
      meta: {
        engine: 'serpapi-google',
        terms: specificTerms,
        sites: SOURCE_SITES,
        ai: GEMINI_KEY ? 'gemini-1.5-flash (REST)' : 'simple-score-fallback',
      },
    });
  } catch (err) {
    if (DEBUG) console.error("Erro inesperado no handler:", err);
    return jsonResponse(500, { error: `Erro interno no servidor: ${err.message}` });
  }
};
