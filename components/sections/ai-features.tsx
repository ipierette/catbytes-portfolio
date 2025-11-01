'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Home, Camera, Heart } from 'lucide-react'

export function AIFeatures() {
  const t = useTranslations('aiFeatures')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeTab, setActiveTab] = useState<'adopt' | 'identify' | 'donate'>('adopt')

  const tabs = [
    { id: 'adopt' as const, label: t('tabs.adopt'), icon: Home },
    { id: 'identify' as const, label: t('tabs.identify'), icon: Camera },
    { id: 'donate' as const, label: t('tabs.donate'), icon: Heart },
  ]

  return (
    <section id="ai-features" ref={ref} className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-comfortaa font-bold text-center mb-12 flex items-center justify-center gap-3"
        >
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
          <span>🤖</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'text-catbytes-purple border-b-2 border-catbytes-purple'
                      : 'text-gray-600 dark:text-gray-400 hover:text-catbytes-purple'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'adopt' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {t('adoptCat.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{t('adoptCat.description')}</p>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">{t('adoptCat.note')}</p>
                </div>
                <p className="text-sm text-gray-500 italic">🚧 Funcionalidade em desenvolvimento...</p>
              </motion.div>
            )}

            {activeTab === 'identify' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {t('identifyCat.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{t('identifyCat.description')}</p>
                <p className="text-sm text-gray-500 italic">🚧 Funcionalidade em desenvolvimento...</p>
              </motion.div>
            )}

            {activeTab === 'donate' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {t('donateCat.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{t('donateCat.description')}</p>
                <p className="text-sm text-gray-500 italic">🚧 Funcionalidade em desenvolvimento...</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
