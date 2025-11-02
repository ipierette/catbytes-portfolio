/**
 * API Security Middleware and Utilities
 * Provides CORS, rate limiting, and security headers for API routes
 */

import { NextResponse } from 'next/server'

/**
 * CORS headers for API routes
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

/**
 * Security headers for API routes
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

/**
 * Input sanitization for API requests
 */
export function sanitizeAPIInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .slice(0, 10000) // API can handle more characters
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeAPIInput)
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeAPIInput(value)
    }
    return sanitized
  }

  return input
}

/**
 * Validate content length to prevent large payload attacks
 */
export function validateContentLength(
  contentLength: string | null,
  maxBytes: number = 1024 * 1024 // 1MB default
): { valid: boolean; error?: string } {
  if (!contentLength) {
    return { valid: true }
  }

  const length = parseInt(contentLength, 10)
  if (isNaN(length)) {
    return { valid: false, error: 'Invalid content length' }
  }

  if (length > maxBytes) {
    return {
      valid: false,
      error: `Payload too large. Maximum ${maxBytes / 1024 / 1024}MB allowed`
    }
  }

  return { valid: true }
}

/**
 * Create a secure API response with proper headers
 */
export function secureAPIResponse(
  data: any,
  status: number = 200,
  additionalHeaders?: Record<string, string>
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
      ...additionalHeaders,
    },
  })
}

/**
 * Create error response with security headers
 */
export function apiError(
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  return secureAPIResponse(
    {
      error: message,
      ...(details && { details }),
    },
    status
  )
}

/**
 * Validate API request method
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): { valid: boolean; error?: NextResponse } {
  if (!allowedMethods.includes(request.method)) {
    return {
      valid: false,
      error: apiError(
        `Method ${request.method} not allowed`,
        405,
        { allowed: allowedMethods }
      ),
    }
  }

  return { valid: true }
}

/**
 * Simple honeypot check for form submissions
 */
export function checkHoneypot(data: any, honeypotField: string = '_gotcha'): boolean {
  return !data[honeypotField] || data[honeypotField] === ''
}

/**
 * Validate and sanitize JSON body
 */
export async function getValidatedBody<T>(
  request: Request,
  schema?: (data: any) => T
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    // Check content length
    const contentLength = request.headers.get('content-length')
    const lengthValidation = validateContentLength(contentLength)
    if (!lengthValidation.valid) {
      return {
        error: apiError(lengthValidation.error || 'Invalid content length', 413),
      }
    }

    // Parse JSON
    const body = await request.json()

    // Sanitize input
    const sanitized = sanitizeAPIInput(body)

    // Validate with schema if provided
    if (schema) {
      const validated = schema(sanitized)
      return { data: validated }
    }

    return { data: sanitized }
  } catch (error) {
    return {
      error: apiError('Invalid JSON body', 400),
    }
  }
}

/**
 * Extract client IP address for rate limiting
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP.trim()
  }

  return 'unknown'
}
