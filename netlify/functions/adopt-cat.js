const SOURCE_SITES = [
  'olx.com.br',
  'adoteumgatinho.org.br',
  'catland.org.br',
  'adotepetz.com.br',
  'adotebicho.com.br',
  'paraisodosfocinhos.com.br',
  'adoteumpet.com.br'
];

const BAD_WORDS = [
  'venda', 'apenas venda', 'só venda', 'so venda', 'r$', 'preço',
  'doação com valor', 'doação com preço', 'doacao com valor',
  'doacao com preco', 'custo', 'taxa de entrega'
];

const isValidUrl = (u) => {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
};

async function getAIScore(anuncio, apiKey, searchParams) {
  if (!apiKey) return { score: 5, reason: "Chave da IA não configurada." };

  const { titulo, descricao, fonte } = anuncio;
  const { color, localizacao } = searchParams;

  const prompt = `Analise este anúncio de adoção de gatos no Brasil e dê uma nota de 1 a 10.
Critérios: confiabilidade da fonte, detalhes do anúncio, adequação ao que foi buscado.

ANÚNCIO:
- Título: "${titulo}"
- Descrição: "${descricao}"
- Fonte: "${fonte}"

BUSCA DO USUÁRIO:
- Cor: "${color || 'qualquer'}"
- Localização: "${localizacao || 'qualquer'}"

Retorne APENAS um JSON: {"score": <1-10>, "reason": "explicação breve", "is_adopted": <true/false>}

REGRAS:
- ONGs confiáveis (adoteumgatinho.org.br, catland.org.br): nota alta
- Se mencionar "adotado" ou "não disponível": is_adopted = true
- Anúncios detalhados (castração, vacinas, temperamento): nota alta
- Combine com cor/localização buscada: bônus
- Suspeita de venda ou vago: nota baixa`;

  try {
    const body = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await resp.json();
    
    if (!resp.ok) {
      console.error("Erro na API Gemini:", data);
      return { score: 4, reason: "Falha ao contatar a IA.", is_adopted: false };
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    try {
      // Tenta extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(1, Math.min(10, parsed.score || 4)),
          reason: parsed.reason || "Análise da IA",
          is_adopted: !!parsed.is_adopted
        };
      }
    } catch (e) {
      console.error("Erro parsing JSON:", e);
    }
    
    return { score: 4, reason: "Resposta da IA não compreendida.", is_adopted: false };
  } catch (error) {
    console.error("Erro chamada Gemini:", error);
    return { score: 4, reason: "Falha ao contatar a IA.", is_adopted: false };
  }
}

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const SERPAPI_KEY = process.env.SERPAPI_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    
    if (!SERPAPI_KEY) {
      return { statusCode: 500, body: 'Faltando SERPAPI_KEY no ambiente.' };
    }

    const { age = '', color = '', localizacao = '' } = JSON.parse(event.body || '{}');

    // Monta a query (apenas termos úteis + restrição aos sites definidos)
    const terms = ['adoção de gatos'];
    if (color) terms.push(`gato ${color}`);
    if (age) terms.push(String(age));
    if (localizacao) terms.push(localizacao);

    const siteFilter = SOURCE_SITES.map(s => `site:${s}`).join(' OR ');
    const query = `${terms.join(' ')} ${siteFilter}`;

    // Chamada SerpAPI (Google)
    const serpUrl = new URL('https://serpapi.com/search');
    serpUrl.searchParams.set('engine', 'google');
    serpUrl.searchParams.set('hl', 'pt-BR');
    serpUrl.searchParams.set('gl', 'br');
    serpUrl.searchParams.set('num', '12');
    serpUrl.searchParams.set('q', query);
    serpUrl.searchParams.set('api_key', SERPAPI_KEY);

    const res = await fetch(serpUrl.toString());
    if (!res.ok) {
      const text = await res.text();
      return { statusCode: 502, body: `Erro SerpAPI: ${text}` };
    }
    const data = await res.json();

    // Normaliza resultados
    const raw = Array.isArray(data.organic_results) ? data.organic_results : [];
    let anuncios = raw.map(r => ({
      titulo: r.title || 'Anúncio de Adoção',
      descricao: r.snippet || '',
      url: r.link || '',
      fonte: r.displayed_link || r.source || 'desconhecida',
      score: 0
    }))
    .filter(a =>
      a.descricao &&
      a.descricao.length >= 30 &&
      !BAD_WORDS.some(w => a.descricao.toLowerCase().includes(w)) &&
      a.url && isValidUrl(a.url)
    );

    // Usar IA para scoring inteligente se disponível
    if (GEMINI_KEY && anuncios.length > 0) {
      console.log("Usando IA para análise de", anuncios.length, "anúncios");
      
      const searchParams = { color, localizacao };
      const scoringPromises = anuncios.map(anuncio =>
        getAIScore(anuncio, GEMINI_KEY, searchParams).catch(err => {
          console.error("Erro no scoring do anúncio:", err);
          return { score: 4, reason: "Erro na análise", is_adopted: false };
        })
      );
      
      const scores = await Promise.all(scoringPromises);
      
      anuncios.forEach((anuncio, index) => {
        const aiResult = scores[index];
        anuncio.score = aiResult.score / 10; // Normaliza para 0-1
        anuncio.is_adopted = aiResult.is_adopted;
        anuncio.ai_reason = aiResult.reason;
      });
    } else {
      // Fallback: scoring simples
      console.log("Usando scoring simples (sem IA)");
      const prefer = (a) => {
        let s = 0;
        if (color && a.descricao.toLowerCase().includes(color.toLowerCase())) s += 0.35;
        if (localizacao && a.descricao.toLowerCase().includes(localizacao.toLowerCase())) s += 0.35;
        s += Math.min(a.descricao.length / 220, 0.3);
        return s;
      };
      anuncios.forEach(a => {
        a.score = prefer(a);
        a.is_adopted = false;
      });
    }
    
    anuncios.sort((a, b) => (b.score || 0) - (a.score || 0));
    anuncios = anuncios.slice(0, 6);

    // Fallback se nada passou no filtro
    if (!anuncios.length) {
      const qBase = encodeURIComponent(terms.join(' '));
      anuncios = [
        {
          titulo: 'Resultados de adoção no Google',
          descricao: 'Busca direta com os melhores resultados próximos.',
          url: `https://www.google.com/search?q=${qBase}`,
          fonte: 'google.com',
          score: 0
        }
      ];
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sucesso: true,
        quantidade: anuncios.length,
        anuncios,
        mensagem: anuncios.length > 1
          ? 'Veja os anúncios de adoção encontrados.'
          : 'Não achamos anúncios específicos; sugerimos uma busca direta.',
        meta: { engine: 'serpapi-google', terms, sites: SOURCE_SITES }
      })
    };
  } catch (err) {
    return { statusCode: 500, body: `Erro: ${err.message}` };
  }
};