/**
 * Security utilities for form input sanitization and XSS prevention
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
    .slice(0, 1000) // Limit input length
}

/**
 * Sanitize HTML for display (converts special characters to HTML entities)
 */
export function escapeHTML(input: string): string {
  if (typeof input !== 'string') return ''

  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate file size and type
 */
export function isValidFile(
  file: File,
  maxSizeMB: number = 8,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Use: ${allowedTypes.join(', ')}`
    }
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

/**
 * Rate limiting - client side check (basic implementation)
 * For production, use server-side rate limiting
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  canAttempt(key: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // Remove old attempts outside the time window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs)

    if (recentAttempts.length >= this.maxAttempts) {
      return false
    }

    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
    return true
  }

  getRemainingTime(key: string): number {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    const recentAttempts = attempts.filter(time => now - time < this.windowMs)

    if (recentAttempts.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts)
      return this.windowMs - (now - oldestAttempt)
    }

    return 0
  }
}

/**
 * Validate and sanitize form data
 */
export interface SanitizedFormData {
  [key: string]: string | number | boolean
}

export function sanitizeFormData(data: Record<string, any>): SanitizedFormData {
  const sanitized: SanitizedFormData = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Content Security Policy helpers
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://serpapi.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}
