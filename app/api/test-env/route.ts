import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'CONFIGURADA ✓' : 'NÃO ENCONTRADA ✗',
    SERPAPI_KEY: process.env.SERPAPI_KEY ? 'CONFIGURADA ✓' : 'NÃO ENCONTRADA ✗',
    OPENAI_KEY_PREFIX: process.env.OPENAI_API_KEY?.substring(0, 10) || 'N/A',
    NODE_ENV: process.env.NODE_ENV,
    ALL_ENV_KEYS: Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('API'))
  }

  return NextResponse.json(envVars)
}
