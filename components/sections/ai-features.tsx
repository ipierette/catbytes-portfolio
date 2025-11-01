'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Home, Camera, Heart, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'

// Componente AdoptCat
function AdoptCatForm() {
  const t = useTranslations('aiFeatures.adoptCat')
  const [formData, setFormData] = useState({ age: '', color: '', localizacao: '' })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/adopt-cat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar anúncios')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Home className="w-6 h-6 text-catbytes-blue" />
        {t('title')}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{t('description')}</p>

      <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>ℹ️ Observação:</strong> {t('note')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            {t('form.age')}
          </label>
          <select
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="">{t('form.ageSelect')}</option>
            <option value="filhote">{t('form.ageKitten')}</option>
            <option value="adulto">{t('form.ageAdult')}</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            {t('form.color')}
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder={t('form.colorPlaceholder')}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            {t('form.location')}
          </label>
          <input
            type="text"
            value={formData.localizacao}
            onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
            placeholder={t('form.locationPlaceholder')}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-catbytes-green text-white rounded-lg font-semibold hover:bg-catbytes-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('form.submit')}...
            </>
          ) : (
            <>
              {t('form.submit')}
            </>
          )}
        </button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </motion.div>
      )}

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-semibold">
              {results.quantidade} anúncio(s) encontrado(s)
              {results.meta?.cached && ' (do cache ⚡)'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {results.anuncios?.map((ad: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-catbytes-purple transition-colors"
              >
                <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                  {ad.titulo}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                  {ad.descricao}
                </p>
                {ad.score !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-catbytes-green h-2 rounded-full transition-all"
                          style={{ width: `${ad.score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-catbytes-purple">
                        {Math.round(ad.score * 10)}/10
                      </span>
                    </div>
                    {ad.ai_reason && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {ad.ai_reason}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {ad.fonte}
                  </span>
                  {ad.url && (
                    <a
                      href={ad.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-catbytes-blue hover:text-catbytes-purple transition-colors"
                    >
                      Ver anúncio
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Componente IdentifyCat (Placeholder - precisa criar API Route)
function IdentifyCatForm() {
  const t = useTranslations('aiFeatures.identifyCat')

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Camera className="w-6 h-6 text-catbytes-purple" />
        {t('title')}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{t('description')}</p>
      <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg">
        <p className="text-sm text-purple-800 dark:text-purple-300">
          <strong>ℹ️ Privacidade:</strong> {t('note')}
        </p>
      </div>
      <p className="text-sm text-gray-500 italic">🚧 API Route em desenvolvimento...</p>
    </div>
  )
}

// Componente DonateCat (Placeholder - precisa criar API Route)
function DonateCatForm() {
  const t = useTranslations('aiFeatures.donateCat')

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Heart className="w-6 h-6 text-catbytes-pink" />
        {t('title')}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{t('description')}</p>
      <p className="text-sm text-gray-500 italic">🚧 API Route em desenvolvimento...</p>
    </div>
  )
}

// Componente principal
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
            {activeTab === 'adopt' && <AdoptCatForm />}
            {activeTab === 'identify' && <IdentifyCatForm />}
            {activeTab === 'donate' && <DonateCatForm />}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
