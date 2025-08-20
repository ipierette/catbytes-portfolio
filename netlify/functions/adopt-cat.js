// netlify/functions/adopt-cat.js
// Buscar anúncios de adoção (SerpAPI) + scoring (Gemini REST) com fallbacks sólidos e logs.

// =========================
// Config & Constantes
// =========================
const SOURCE_SITES = [
  "olx.com.br",
  "adoteumgatinho.org.br",
  "catland.org.br",
  "adotepetz.com.br",
  "adotebicho.com.br",
  "paraisodosfocinhos.com.br",
  "adoteumpet.com.br",
];

const BAD_WORDS = [
  // "custo" e "taxa" NÃO entram: ONG séria pode falar em "taxa de adoção".
  "venda",
  "vende-se",
  "valor",
  "preço",
  "r$",
];

const DEBUG = String(process.env.DEBUG || "").toLowerCase() === "true";

// =========================
// Helpers gerais
// =========================
const jsonResponse = (status, data) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

function isValidUrl(u) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

function getHostname(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// =========================
// SerpAPI
// =========================
async function runQueryAndParse(query, apiKey) {
  const serpUrl = new URL("https://serpapi.com/search");
  Object.entries({
    engine: "google",
    hl: "pt-BR",
    gl: "br",
    num: "10",
    q: query,
    api_key: apiKey,
  }).forEach(([k, v]) => serpUrl.searchParams.set(k, v));

  try {
    const res = await fetch(serpUrl.toString());
    if (!res.ok) {
      if (DEBUG) console.error(`[SerpAPI] ${res.status} para "${query}"`);
      return [];
    }
    const data = await res.json();
    const raw = Array.isArray(data.organic_results) ? data.organic_results : [];

    return raw
      .map((r) => ({
        titulo: r.title || "Anúncio de Adoção",
        descricao: r.snippet || "",
        url: r.link || "",
        fonte: r.displayed_link || r.source || "desconhecida",
        score: 0,
      }))
      .filter(
        (a) =>
          a.descricao &&
          a.descricao.length >= 40 &&
          !BAD_WORDS.some((w) => a.descricao.toLowerCase().includes(w)) &&
          a.url &&
          isValidUrl(a.url)
      );
  } catch (err) {
    if (DEBUG) console.error(`[SerpAPI] erro "${query}":`, err);
    return [];
  }
}

// =========================
// Fallback simples (melhorado)
// =========================
function getSimpleScore(anuncio, { color, localizacao }) {
  let s = 0;
  const desc = (anuncio.descricao || "").toLowerCase();
  const host = getHostname(anuncio.url || "") || (anuncio.fonte || "").toLowerCase();

  // (1) Tamanho da descrição (até 0.3)
  s += Math.min((anuncio.descricao || "").length / 220, 0.3);

  // (2) Sinais de qualidade (até 0.4)
  const sinais = [
    /castrad[oa]/i,
    /vacinad[oa]/i,
    /\btemperamento\b/i,
    /\bdócil\b/i,
    /\bcarinhos[ao]\b/i,
    /\bfiv\b/i,
    /\bfelv\b/i,
    /\bvermifugad[oa]\b/i,
  ];
  const matches = sinais.reduce((acc, rgx) => acc + (rgx.test(desc) ? 1 : 0), 0);
  s += Math.min(matches * 0.1, 0.4);

  // (3) Cor/localização quando fornecidas (até 0.3)
  if (color && desc.includes(String(color).toLowerCase())) s += 0.15;
  if (localizacao && desc.includes(String(localizacao).toLowerCase())) s += 0.15;

  // (4) Boost por domínio confiável
  const topONGs = ["adoteumgatinho.org.br", "catland.org.br"];
  const outrasOk = SOURCE_SITES.filter((d) => !topONGs.includes(d));

  if (topONGs.some((d) => host.includes(d))) s += 0.4;
  else if (outrasOk.some((d) => host.includes(d))) s += 0.2;

  // clamp 0..1 → 0..10
  s = Math.max(0, Math.min(1, s));
  return Math.round(s * 10);
}

// =========================
// Gemini REST (IA)
// =========================
async function withTimeout(promise, ms) {
  const t = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
  return Promise.race([promise, t]);
}

// pequena função de retry: 1 tentativa extra em caso de erro transitório
async function withRetry(fn, { tries = 2, delayMs = 350 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

async function geminiRESTCall(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 128,
      // força retorno em JSON puro
      responseMimeType: "application/json",
      // schema para guiar o modelo
      responseSchema: {
        type: "OBJECT",
        properties: {
          score: { type: "INTEGER" },
          reason: { type: "STRING" },
          is_adopted: { type: "BOOLEAN" },
        },
        required: ["score", "reason", "is_adopted"],
      },
    },
  };

  const exec = async () => {
    const res = await withTimeout(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      8000
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Gemini HTTP ${res.status}: ${txt.slice(0, 400)}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return typeof text === "string" ? text : "";
  };

  return withRetry(exec, { tries: 2, delayMs: 300 });
}

function extractJsonObject(textRaw) {
  if (!textRaw) return null;

  // 1) com responseMimeType=application/json costuma vir JSON puro
  try {
    return JSON.parse(textRaw);
  } catch {}

  // 2) fallback: remove markdown e tenta extrair o primeiro {...}
  const cleaned = String(textRaw).replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function getAIScore(anuncio, apiKey) {
  const { titulo, descricao, fonte } = anuncio;

  if (!apiKey) {
    if (DEBUG) console.error("[AI] GEMINI_API_KEY ausente — fallback simples será usado.");
    return null; // deixa o fallback atuar
  }

  const prompt = `
Avalie o anúncio de adoção de gato e responda APENAS com JSON válido.

Formato exato:
{"score": <1-10>, "reason": "<curta>", "is_adopted": <true|false>}

Regras:
- 8-10: ONG reconhecida (adoteumgatinho.org.br, catland.org.br) e/ou descrição detalhada (castrado, vacinas, temperamento).
  Se "adotado" ou "adotada": manter 9-10 e is_adopted=true. "taxa de adoção" é positivo.
- 4-7: bom/ok, confiável.
- 1-3: vago/suspeito/comercial (venda explícita).

Dados:
Titulo: ${JSON.stringify(titulo || "")}
Descricao: ${JSON.stringify(descricao || "")}
Fonte: ${JSON.stringify(fonte || "")}
`.trim();

  try {
    const text = await geminiRESTCall(prompt, apiKey);
    if (DEBUG) console.error("[AI] raw:", String(text).slice(0, 400));

    const parsed = extractJsonObject(text);
    if (!parsed) {
      if (DEBUG) console.error("[AI] JSON não encontrado/parseável.");
      return null;
    }

    const scoreNum = Number(parsed.score);
    const normalized = Number.isFinite(scoreNum) ? Math.max(1, Math.min(10, scoreNum)) : null;

    return {
      score: normalized, // 1..10
      reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 160) : "Analisado.",
      is_adopted: !!parsed.is_adopted,
    };
  } catch (err) {
    if (DEBUG) console.error("[AI] erro:", err.message || err);
    return null; // fallback atua
  }
}

// =========================
export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return jsonResponse(405, { error: "Method Not Allowed" });
    }

    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!SERPAPI_KEY) {
      return jsonResponse(500, { error: "Chave da SerpApi não configurada no ambiente." });
    }

    const body = JSON.parse(event.body || "{}");
    const { age = "", color = "", localizacao = "" } = body;

    // ---------- Montagem das queries (específica → ampla)
    const siteFilter = SOURCE_SITES.map((s) => `site:${s}`).join(" OR ");

    const specificTerms = ["adoção de gatos"];
    if (color) specificTerms.push(`gato ${color}`);
    if (age) specificTerms.push(String(age));
    if (localizacao) specificTerms.push(localizacao);

    const broadTerms = ["adoção de gatos"];
    if (localizacao) broadTerms.push(localizacao);

    const queries = [
      `${specificTerms.join(" ")} -filhotes (${siteFilter})`,
      `${broadTerms.join(" ")} -filhotes (${siteFilter})`,
    ];
    if (localizacao && localizacao.length > 3) {
      queries.push(`${broadTerms.join(" ")} -filhotes`);
    }

    // ---------- Execução das buscas com desduplicação
    const all = new Map();
    for (const q of queries) {
      if (all.size >= 15) break;
      const found = await runQueryAndParse(q, SERPAPI_KEY);
      found.forEach((ad) => {
        if (ad.url && !all.has(ad.url)) all.set(ad.url, ad);
      });
    }

    let anuncios = Array.from(all.values());

    // ---------- Scoring
    if (anuncios.length > 0) {
      const scoringPromises = anuncios.map((anuncio) =>
        getAIScore(anuncio, GEMINI_KEY).catch((e) => {
          if (DEBUG) console.error("[AI] promise rejeitada:", e);
          return null;
        })
      );

      const scores = await Promise.all(scoringPromises);

      anuncios.forEach((anuncio, i) => {
        const ai = scores[i];

        if (ai && typeof ai.score === "number" && Number.isFinite(ai.score)) {
          anuncio.score = ai.score / 10; // 1..10 → 0..1 para o front
          anuncio.is_adopted = !!ai.is_adopted;
          anuncio.reason = ai.reason;
          anuncio._ai_failed = false;
        } else {
          const simple = getSimpleScore(anuncio, body); // 0..10
          anuncio.score = simple / 10;
          anuncio.is_adopted = false;
          anuncio._ai_failed = true;
        }
      });

      anuncios.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    // ---------- Sem resultados? Entrega fallback de busca
    if (!anuncios.length) {
      const qBase = encodeURIComponent(broadTerms.join(" "));
      anuncios = [
        {
          titulo: "Resultados de adoção no Google",
          descricao: "Busca direta com os melhores resultados próximos.",
          url: `https://www.google.com/search?q=${qBase}&tbm=isch`,
          fonte: "google.com",
          score: 0.5,
        },
        {
          titulo: "Busque por ONGs na sua região",
          descricao: "Encontre organizações de resgate e proteção animal perto de você.",
          url: `https://www.google.com/search?q=ongs+de+adocao+de+animais+${encodeURIComponent(localizacao || "")}`,
          fonte: "google.com",
          score: 0.5,
        },
      ];
      return jsonResponse(200, {
        sucesso: true,
        quantidade: anuncios.length,
        anuncios,
        mensagem: "Não achamos anúncios específicos. Que tal tentar uma busca mais ampla?",
        meta: {
          onlyFallbacks: true,
          engine: "serpapi-google",
          terms: broadTerms,
          sites: SOURCE_SITES,
        },
      });
    }

    // ---------- Resposta OK
    return jsonResponse(200, {
      sucesso: true,
      quantidade: anuncios.length,
      anuncios,
      mensagem: "Veja os anúncios de adoção que encontramos e analisamos para você.",
      meta: {
        engine: "serpapi-google",
        terms: specificTerms,
        sites: SOURCE_SITES,
        ai: GEMINI_KEY ? "gemini-1.5-flash (REST)" : "simple-score-fallback",
        debug: DEBUG,
      },
    });
  } catch (err) {
    if (DEBUG) console.error("[handler] erro inesperado:", err);
    return jsonResponse(500, { error: `Erro interno no servidor: ${err.message}` });
  }
};
