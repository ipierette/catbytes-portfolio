import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // Lista de idiomas suportados
  locales: ['pt-BR', 'en-US'],

  // Idioma padrão
  defaultLocale: 'pt-BR',

  // Prefixo de URL (as-needed = /pt-BR e /en-US apenas quando necessário)
  localePrefix: 'always'
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
