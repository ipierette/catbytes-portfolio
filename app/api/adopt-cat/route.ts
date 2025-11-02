import { NextRequest, NextResponse } from 'next/server'

// Cache simples em memória (em produção, use Redis/Vercel KV)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 30 // 30 minutos

// Rate limiting simples (em produção, use Upstash/Vercel KV)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // 10 requests
const RATE_WINDOW = 1000 * 60 * 60 // 1 hora

const SOURCE_SITES = [
  'olx.com.br',
  'adoteumgatinho.org.br',
  'catland.org.br',
  'adotepetz.com.br',
  'adotebicho.com.br',
  'paraisodosfocinhos.com.br',
  'adoteumpet.com.br'
]

const BAD_WORDS = [
  'venda', 'apenas venda', 'só venda', 'so venda', 'r$', 'preço',
  'doação com valor', 'doação com preço', 'doacao com valor',
  'doacao com preco', 'custo', 'taxa de entrega'
]

interface AdoptRequest {
  age?: string
  color?: string
  localizacao?: string
}

interface AdResult {
  titulo: string
  descricao: string
  url: string
  fonte: string
  score: number
  is_adopted?: boolean
  ai_reason?: string
}

interface SerpApiResult {
  title?: string
  snippet?: string
  link?: string
  displayed_link?: string
  source?: string
}

interface AIScore {
  score: number
  reason: string
  is_adopted: boolean
}

// Rate limiting check
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

// Cache check
function getCached(key: string): any | null {
  const cached = cache.get(key)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return cached.data
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// AI Scoring com OpenAI
async function getAIScore(
  anuncio: AdResult,
  searchParams: AdoptRequest,
  openaiKey: string
): Promise<AIScore> {
  const { titulo, descricao, fonte } = anuncio
  const { color, localizacao } = searchParams

  const prompt = `Analise este anúncio de adoção de gatos no Brasil e dê uma nota de 1 a 10.
Critérios: confiabilidade da fonte, detalhes do anúncio, adequação ao que foi buscado.

ANÚNCIO:
- Título: "${titulo}"
- Descrição: "${descricao}"
- Fonte: "${fonte}"

BUSCA DO USUÁRIO:
- Cor: "${color || 'qualquer'}"
- Localização: "${localizacao || 'qualquer'}"

Retorne APENAS um JSON válido: {"score": <1-10>, "reason": "explicação breve", "is_adopted": <true/false>}

REGRAS:
- ONGs confiáveis (adoteumgatinho.org.br, catland.org.br): nota alta (8-10)
- Se mencionar "adotado" ou "não disponível": is_adopted = true, score baixo
- Anúncios detalhados (castração, vacinas, temperamento): nota alta
- Combine com cor/localização buscada: bônus
- Suspeita de venda ou vago: nota baixa (1-4)`

  try {
    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em avaliar anúncios de adoção de gatos. Sempre responda com JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300
    }

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000) // 10s timeout
      }
    )

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return { score: 5, reason: 'Erro na análise IA', is_adopted: false }
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content || ""

    if (!text) {
      return { score: 5, reason: 'Resposta da IA vazia', is_adopted: false }
    }

    // Parse JSON response
    const parsed = JSON.parse(text)
    return {
      score: Math.max(1, Math.min(10, parsed.score || 5)),
      reason: parsed.reason || 'Análise da IA',
      is_adopted: !!parsed.is_adopted
    }
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error)
    return { score: 5, reason: 'Erro na análise IA', is_adopted: false }
  }
}

// Scoring simples (fallback)
function getSimpleScore(ad: AdResult, searchParams: AdoptRequest): number {
  let score = 0
  const { color, localizacao } = searchParams

  // Bônus por localização
  if (localizacao) {
    const loc = localizacao.toLowerCase()
    if (ad.descricao.toLowerCase().includes(loc) || ad.titulo.toLowerCase().includes(loc)) {
      score += 0.5
    }
  }

  // Bônus por cor
  if (color && ad.descricao.toLowerCase().includes(color.toLowerCase())) {
    score += 0.25
  }

  // Bônus por descrição detalhada
  score += Math.min(ad.descricao.length / 200, 0.25)

  return score
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit excedido. Tente novamente em 1 hora.' },
        { status: 429 }
      )
    }

    const SERPAPI_KEY = process.env.SERPAPI_KEY
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    if (!SERPAPI_KEY) {
      return NextResponse.json(
        { error: 'Configuração de API ausente' },
        { status: 500 }
      )
    }

    const body: AdoptRequest = await request.json()
    const { age = '', color = '', localizacao = '' } = body

    // Cache key
    const cacheKey = `adopt:${age}:${color}:${localizacao}`
    const cached = getCached(cacheKey)
    if (cached) {
      console.log('Cache hit:', cacheKey)
      return NextResponse.json({ ...cached, cached: true })
    }

    // Monta query de busca
    const baseTerms = ['adoção de gatos']
    if (color) baseTerms.push(`gato ${color}`)
    if (age) baseTerms.push(age)

    const siteFilter = SOURCE_SITES.map((s: string) => `site:${s}`).join(' OR ')

    let query: string
    if (localizacao) {
      query = `${baseTerms.join(' ')} "${localizacao}" (${siteFilter})`
    } else {
      query = `${baseTerms.join(' ')} (${siteFilter})`
    }

    console.log('Buscando:', query)

    // Chamada SerpAPI
    const serpUrl = new URL('https://serpapi.com/search')
    serpUrl.searchParams.set('engine', 'google')
    serpUrl.searchParams.set('hl', 'pt-BR')
    serpUrl.searchParams.set('gl', 'br')
    serpUrl.searchParams.set('num', '10')
    serpUrl.searchParams.set('q', query)
    serpUrl.searchParams.set('api_key', SERPAPI_KEY)

    const response = await fetch(serpUrl.toString(), {
      signal: AbortSignal.timeout(10000) // 10s timeout
    })

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`)
    }

    const data = await response.json()
    const raw = Array.isArray(data.organic_results) ? data.organic_results : []

    // Processa resultados
    let anuncios: AdResult[] = raw
      .map((r: SerpApiResult) => ({
        titulo: r.title || 'Anúncio de Adoção',
        descricao: r.snippet || '',
        url: r.link || '',
        fonte: r.displayed_link || r.source || 'desconhecida',
        score: 0
      }))
      .filter((a: AdResult) => {
        if (!a.descricao || a.descricao.length < 20) return false
        if (!a.url) return false
        if (BAD_WORDS.some((w: string) => a.descricao.toLowerCase().includes(w))) return false
        return true
      })

    // Filtro por localização
    if (localizacao && anuncios.length > 0) {
      const locMatch = anuncios.filter((a: AdResult) =>
        a.descricao.toLowerCase().includes(localizacao.toLowerCase()) ||
        a.titulo.toLowerCase().includes(localizacao.toLowerCase())
      )
      if (locMatch.length > 0) {
        anuncios = locMatch
      }
    }

    // AI Scoring (limita a 6 para performance)
    if (OPENAI_API_KEY && anuncios.length > 0) {
      const adsForAI = anuncios.slice(0, 6)
      console.log(`Analisando ${adsForAI.length} anúncios com IA`)

      const scoringPromises = adsForAI.map((ad: AdResult) =>
        getAIScore(ad, body, OPENAI_API_KEY).catch(() => ({
          score: 5,
          reason: 'Erro na análise',
          is_adopted: false
        }))
      )

      const scores = await Promise.all(scoringPromises)

      adsForAI.forEach((ad: AdResult, index: number) => {
        const aiResult = scores[index]
        ad.score = aiResult.score / 10 // Normaliza 0-1
        ad.is_adopted = aiResult.is_adopted
        ad.ai_reason = aiResult.reason
      })

      // Scoring simples para o resto
      if (anuncios.length > 6) {
        anuncios.slice(6).forEach((ad: AdResult) => {
          ad.score = getSimpleScore(ad, body)
        })
      }
    } else {
      // Fallback: scoring simples
      anuncios.forEach((ad: AdResult) => {
        ad.score = getSimpleScore(ad, body)
      })
    }

    // Ordena e limita
    anuncios.sort((a: AdResult, b: AdResult) => (b.score || 0) - (a.score || 0))
    anuncios = anuncios.slice(0, 6)

    // Fallback se vazio
    if (anuncios.length === 0) {
      const qBase = encodeURIComponent(baseTerms.join(' '))
      anuncios = [{
        titulo: 'Resultados de adoção no Google',
        descricao: 'Busca direta com os melhores resultados próximos.',
        url: `https://www.google.com/search?q=${qBase}`,
        fonte: 'google.com',
        score: 0
      }]
    }

    const result = {
      sucesso: true,
      quantidade: anuncios.length,
      anuncios,
      mensagem: anuncios.length > 1
        ? 'Veja os anúncios de adoção encontrados.'
        : 'Não achamos anúncios específicos; sugerimos uma busca direta.',
      meta: {
        engine: 'serpapi-google',
        terms: baseTerms,
        sites: SOURCE_SITES,
        cached: false
      }
    }

    // Salva no cache
    setCache(cacheKey, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro em /api/adopt-cat:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar anúncios',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
