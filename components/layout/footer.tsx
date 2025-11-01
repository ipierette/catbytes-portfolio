'use client'

import { useTranslations } from 'next-intl'
import { Heart, Coffee } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <p className="text-gray-300">
            {t('copyright', { year: currentYear })}
          </p>
          <p className="flex items-center justify-center gap-2 text-gray-400">
            {t('madeWith').split('❤️')[0]}
            <Heart className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" />
            {t('madeWith').split('❤️')[1].split('☕')[0]}
            <Coffee className="w-4 h-4 text-amber-500" />
            {t('madeWith').split('☕')[1]}
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            {t('accessibility')}
          </p>
        </div>
      </div>
    </footer>
  )
}
