import type { Metadata } from 'next'
import { Inter, Comfortaa } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

const comfortaa = Comfortaa({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comfortaa',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://catbytes.com'),
  title: {
    default: 'Izadora Cury Pierette | CatBytes — Portfólio Criativo',
    template: '%s | CatBytes'
  },
  description: 'Conheça projetos que unem design moderno, código limpo e soluções com inteligência artificial e automação.',
  keywords: ['react', 'next.js', 'desenvolvedor front-end', 'portfolio', 'web development', 'AI'],
  authors: [{ name: 'Izadora Cury Pierette' }],
  creator: 'Izadora Cury Pierette',
  publisher: 'CatBytes',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/favicon-32x32.png',
    apple: '/images/favicon-32x32.png',
  },
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale?: string }
}) {
  return (
    <html
      lang={params?.locale || 'pt-BR'}
      className={`${inter.variable} ${comfortaa.variable}`}
      suppressHydrationWarning
    >
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
