'use client'
import { FaHeart } from 'react-icons/fa'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export function Curiosities() {
  const t = useTranslations('curiosities')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="curiosities"
      ref={ref}
      className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-comfortaa font-bold text-center mb-12 flex items-center justify-center gap-3"
        >
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
          <FaHeart className="text-red-500" />
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-6 max-w-sm mx-auto"
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-xl border-4 border-purple-500">
              <Image
                src="/images/axel-filhote.webp"
                alt={t('imageAxelKitten')}
                width={300}
                height={300}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 90vw, 300px"
              />
            </div>
            <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-xl border-4 border-green-400">
              <Image
                src="/images/axel-adulto.webp"
                alt={t('imageAxelAdult')}
                width={300}
                height={300}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 90vw, 300px"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="space-y-6 text-gray-700 dark:text-gray-300"
          >
            <p className="text-lg leading-relaxed">{t('paragraph1')}</p>
            <p className="text-lg leading-relaxed">{t('paragraph2')}</p>
            <p className="text-lg leading-relaxed">{t('paragraph3')}</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
