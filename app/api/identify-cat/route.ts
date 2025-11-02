import { NextRequest, NextResponse } from 'next/server'

// Cache simples em memória (30 minutos)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 30

// Rate limiting (10 requests por hora por IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 1000 * 60 * 60

interface IdentifyResult {
  idade: string
  racas: string[]
  personalidade: string[]
  observacoes: string
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

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não configurada')
      return NextResponse.json(
        { error: 'Configuração de API ausente. Verifique OPENAI_API_KEY nas variáveis de ambiente.' },
        { status: 500 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('data') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhuma imagem fornecida' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'

    // Cache key baseado em hash da imagem (primeiros 100 chars do base64)
    const cacheKey = `identify:${base64Data.substring(0, 100)}`
    const cached = getCached(cacheKey)
    if (cached) {
      console.log('Cache hit:', cacheKey.substring(0, 50))
      return NextResponse.json({ ...cached, cached: true })
    }

    console.log('Analisando imagem com OpenAI Vision...')

    // Call OpenAI Vision API
    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em identificar gatos. Sempre responda com JSON válido em português brasileiro.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: 'auto'
              }
            },
            {
              type: 'text',
              text: 'Analise esta foto de gato e retorne SOMENTE JSON exatamente neste formato: {"idade":"~X meses/anos (intervalo)","racas":["raça1","raça2"],"personalidade":["traço1","traço2"],"observacoes":"observações gerais"} Seja breve e conservador nas estimativas. Se não for um gato, retorne {"observacoes":"imagem sem gato."}'
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500
    }

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000) // 20s timeout para análise de imagem
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('OpenAI API error:', response.status, errorData)
      throw new Error(`OpenAI API falhou: ${response.status}`)
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content || ""

    console.log('OpenAI response text:', text.substring(0, 200))

    // Parse JSON response
    let parsed: any
    try {
      parsed = JSON.parse(text)
    } catch {
      console.error('Failed to parse JSON:', text)
      const regex = /\{[\s\S]*\}/
      const match = regex.exec(text)
      parsed = match ? JSON.parse(match[0]) : { observacoes: text || "sem dados" }
    }

    // Normalize response (handle both pt-BR and en-US keys)
    let racas: string[] = []
    if (Array.isArray(parsed.racas)) {
      racas = parsed.racas
    } else if (Array.isArray(parsed.breeds)) {
      racas = parsed.breeds
    }

    let personalidade: string[] = []
    if (Array.isArray(parsed.personalidade)) {
      personalidade = parsed.personalidade
    } else if (Array.isArray(parsed.personality)) {
      personalidade = parsed.personality
    }

    const result: IdentifyResult = {
      idade: parsed.idade || parsed.age || "--",
      racas,
      personalidade,
      observacoes: parsed.observacoes || parsed.notes || parsed.observações || "",
    }

    // Cache the result
    setCache(cacheKey, result)

    return NextResponse.json({ ...result, cached: false })
  } catch (error) {
    console.error('Erro em /api/identify-cat:', error)
    return NextResponse.json(
      {
        error: 'Erro ao identificar gato',
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
