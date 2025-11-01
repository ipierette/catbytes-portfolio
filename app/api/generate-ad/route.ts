import { NextRequest, NextResponse } from 'next/server'

// Cache simples em memória (30 minutos)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 30

// Rate limiting (5 requests por hora por IP - mais restritivo pois gera texto longo)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW = 1000 * 60 * 60

interface GenerateAdRequest {
  description: string
}

interface PostingPlan {
  when: Array<{ day: string; time: string }>
  platforms: string[]
  where_to_post: string[]
  who_to_tag: string[]
  cta_tips: string[]
  crosspost_tips: string[]
}

interface GenerateAdResult {
  title: string
  ad_copy: string
  hashtags: string[]
  posting_plan: PostingPlan
}

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

function makePrompt(description: string): string {
  return `Você é um redator de social media para adoção de gatos no Brasil.
Com base na descrição abaixo, gere um PACOTE EM JSON PURO (sem markdown, sem comentários).

DESCRIÇÃO
"""${description}"""

INSTRUÇÕES
- Tom acolhedor e responsável (sem sensacionalismo).
- Título até 60 caracteres.
- Anúncio com 3–5 parágrafos curtos + call-to-action.
- 8–12 hashtags (pt-BR).
- Plano de divulgação para 7 dias: horários, plataformas, onde postar, quem marcar, dicas de mídia, crosspost.

FORMATO JSON EXATO
{
  "title": "string",
  "ad_copy": "string",
  "hashtags": ["#tag1", "#tag2"],
  "posting_plan": {
    "when": [{"day":"qui","time":"10:30"},{"day":"dom","time":"19:00"}],
    "platforms": ["Instagram","Facebook","WhatsApp","X/Twitter"],
    "where_to_post": ["Grupos locais de adoção","ONGs (marcar nos comentários)","Stories + Reels"],
    "who_to_tag": ["@prefeitura (bem-estar animal)","@ongs_local_1","@ongs_local_2","amigos com alcance"],
    "cta_tips": ["3 fotos nítidas","vídeo 10–15s","localização e requisitos"],
    "crosspost_tips": ["Reaproveitar texto no Facebook/grupos","Repost no Stories pedindo compartilhamento"]
  }
}
Se faltar algum dado, assuma de forma realista e deixe claro no texto.
Retorne SOMENTE o JSON.`
}

function tryParseJSON(str: string): any | null {
  try {
    return JSON.parse(str)
  } catch {}

  const a = str.indexOf("{")
  const b = str.lastIndexOf("}")
  if (a !== -1 && b !== -1 && b > a) {
    try {
      return JSON.parse(str.slice(a, b + 1))
    } catch {}
  }

  return null
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

    const GEMINI_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_KEY) {
      return NextResponse.json(
        { error: 'Configuração de API ausente' },
        { status: 500 }
      )
    }

    const body: GenerateAdRequest = await request.json()
    const { description } = body

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'description é obrigatório' },
        { status: 400 }
      )
    }

    // Cache key baseado na descrição
    const cacheKey = `generate-ad:${description.substring(0, 100)}`
    const cached = getCached(cacheKey)
    if (cached) {
      console.log('Cache hit:', cacheKey.substring(0, 50))
      return NextResponse.json({ ok: true, data: cached, cached: true })
    }

    console.log('Gerando anúncio com Gemini...')

    // Call Gemini API
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{ text: makePrompt(description) }]
      }]
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000) // 20s timeout para geração de texto
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', errorData)
      throw new Error('Falha ao chamar Gemini API')
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || ""

    const parsedData = tryParseJSON(text) ?? { raw: text }

    // Cache the result
    setCache(cacheKey, parsedData)

    return NextResponse.json({
      ok: true,
      data: parsedData,
      cached: false
    })
  } catch (error) {
    console.error('Erro em /api/generate-ad:', error)
    return NextResponse.json(
      {
        error: 'Erro ao gerar anúncio',
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
