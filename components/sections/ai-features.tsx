'use client'
import { FaRobot } from 'react-icons/fa'

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

// Componente IdentifyCat
function IdentifyCatForm() {
  const t = useTranslations('aiFeatures.identifyCat')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (!file) {
      setError('Por favor, selecione uma imagem')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('data', file)

      const response = await fetch('/api/identify-cat', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao identificar gato')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            {t('form.image')}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        {preview && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-catbytes-purple text-white rounded-lg font-semibold hover:bg-catbytes-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('form.submit')}...
            </>
          ) : (
            <>{t('form.submit')}</>
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

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-semibold">
              Análise concluída{result.cached && ' (do cache ⚡)'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">Idade Estimada:</h4>
                <p className="text-gray-600 dark:text-gray-300">{result.idade}</p>
              </div>

              {result.racas && result.racas.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">Raças Possíveis:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.racas.map((raca: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-catbytes-purple/20 text-catbytes-purple rounded-full text-sm"
                      >
                        {raca}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.personalidade && result.personalidade.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">Personalidade:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.personalidade.map((trait: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-catbytes-pink/20 text-catbytes-pink rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.observacoes && (
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">Observações:</h4>
                  <p className="text-gray-600 dark:text-gray-300">{result.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Componente DonateCat
function DonateCatForm() {
  const t = useTranslations('aiFeatures.donateCat')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      setError('Por favor, descreva o gato para doação')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })

      const data = await response.json()
      console.log('API Response:', { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || data.details || `Erro ${response.status}`)
      }

      if (!data.data) {
        throw new Error('Resposta inválida da API')
      }

      setResult(data.data)
    } catch (err) {
      console.error('Generate ad error:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Heart className="w-6 h-6 text-catbytes-pink" />
        {t('title')}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{t('description')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            {t('form.description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('form.descriptionPlaceholder')}
            rows={6}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Inclua: idade, cor, temperamento, vacinação, castração, localização, requisitos
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-catbytes-pink text-white rounded-lg font-semibold hover:bg-catbytes-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('form.submit')}...
            </>
          ) : (
            <>{t('form.submit')}</>
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

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-semibold">Anúncio gerado com sucesso!</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700 space-y-6">
            {result.title && (
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">Título:</h4>
                <p className="text-lg font-semibold text-catbytes-purple">{result.title}</p>
              </div>
            )}

            {result.ad_copy && (
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">Texto do Anúncio:</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{result.ad_copy}</p>
                </div>
              </div>
            )}

            {result.hashtags && result.hashtags.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">Hashtags:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-catbytes-pink/20 text-catbytes-pink rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.posting_plan && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 dark:text-white">Plano de Divulgação (7 dias):</h4>

                {result.posting_plan.when && result.posting_plan.when.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Quando Postar:</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.posting_plan.when.map((time: any, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm"
                        >
                          {time.day} {time.time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.posting_plan.platforms && result.posting_plan.platforms.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Plataformas:</h5>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                      {result.posting_plan.platforms.map((platform: string, index: number) => (
                        <li key={index}>{platform}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.posting_plan.where_to_post && result.posting_plan.where_to_post.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Onde Postar:</h5>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                      {result.posting_plan.where_to_post.map((where: string, index: number) => (
                        <li key={index}>{where}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.posting_plan.who_to_tag && result.posting_plan.who_to_tag.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Quem Marcar:</h5>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                      {result.posting_plan.who_to_tag.map((who: string, index: number) => (
                        <li key={index}>{who}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.posting_plan.cta_tips && result.posting_plan.cta_tips.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Dicas de Mídia:</h5>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                      {result.posting_plan.cta_tips.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.posting_plan.crosspost_tips && result.posting_plan.crosspost_tips.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Dicas de Crosspost:</h5>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                      {result.posting_plan.crosspost_tips.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
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
          <FaRobot className="text-violet-600 dark:text-violet-300" />
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
