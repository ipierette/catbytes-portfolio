import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { BackToTop } from '@/components/ui/back-to-top'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isValidLocale = routing.locales.includes(locale as any)
  if (!isValidLocale) return {}

  const translations: Record<string, any> = {
    'pt-BR': {
      title: 'Izadora Cury Pierette | CatBytes — Portfólio Criativo',
      description: 'Desenvolvedora front-end especializada em React, Next.js e IA. Criando experiências digitais que unem criatividade e tecnologia.'
    },
    'en-US': {
      title: 'Izadora Cury Pierette | CatBytes — Creative Portfolio',
      description: 'Front-end developer specialized in React, Next.js and AI. Creating digital experiences that combine creativity and technology.'
    }
  }

  const t = translations[locale]

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `https://catbytes.com/${locale}`,
      languages: {
        'pt-BR': 'https://catbytes.com/pt-BR',
        'en-US': 'https://catbytes.com/en-US'
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      alternateLocale: locale === 'pt-BR' ? 'en_US' : 'pt_BR',
      url: `https://catbytes.com/${locale}`,
      title: t.title,
      description: t.description,
      siteName: 'CatBytes',
      images: [
        {
          url: '/images/og-1200x630-safe.jpg',
          width: 1200,
          height: 630,
          alt: 'CatBytes Portfolio'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description,
      images: ['/images/og-1200x630-safe.jpg']
    }
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Await params (Next.js 15 requirement)
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="alternate" hrefLang="pt-BR" href="https://catbytes.com/pt-BR" />
        <link rel="alternate" hrefLang="en-US" href="https://catbytes.com/en-US" />
        <link rel="alternate" hrefLang="x-default" href="https://catbytes.com/pt-BR" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ScrollProgress />
            <Header />
            <main>{children}</main>
            <Footer />
            <BackToTop />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
