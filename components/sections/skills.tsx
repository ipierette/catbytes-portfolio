'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  SiHtml5, SiCss3, SiJavascript, SiReact, SiNextdotjs,
  SiTypescript, SiTailwindcss, SiNodedotjs, SiPostgresql,
  SiGit, SiPython, SiFigma
} from 'react-icons/si'
import { FaBook, FaInfoCircle } from 'react-icons/fa'
import { X } from 'lucide-react'

const skillsData = [
  { name: 'HTML5', level: 95, color: 'from-orange-500 to-orange-600', icon: SiHtml5, iconColor: 'text-orange-500' },
  { name: 'CSS3', level: 90, color: 'from-blue-500 to-blue-600', icon: SiCss3, iconColor: 'text-blue-500' },
  { name: 'JavaScript', level: 85, color: 'from-yellow-400 to-yellow-500', icon: SiJavascript, iconColor: 'text-yellow-400' },
  { name: 'React', level: 88, color: 'from-cyan-500 to-cyan-600', icon: SiReact, iconColor: 'text-cyan-500' },
  { name: 'Next.js', level: 82, color: 'from-gray-800 to-black', icon: SiNextdotjs, iconColor: 'text-gray-800 dark:text-white' },
  { name: 'TypeScript', level: 75, color: 'from-blue-600 to-blue-700', icon: SiTypescript, iconColor: 'text-blue-600' },
  { name: 'Tailwind CSS', level: 92, color: 'from-teal-500 to-teal-600', icon: SiTailwindcss, iconColor: 'text-teal-500' },
  { name: 'Node.js', level: 70, color: 'from-green-600 to-green-700', icon: SiNodedotjs, iconColor: 'text-green-600' },
  { name: 'PostgreSQL', level: 65, color: 'from-blue-700 to-blue-800', icon: SiPostgresql, iconColor: 'text-blue-700' },
  { name: 'Git', level: 80, color: 'from-red-600 to-red-700', icon: SiGit, iconColor: 'text-red-600' },
  { name: 'Python', level: 60, color: 'from-yellow-500 to-blue-500', icon: SiPython, iconColor: 'text-yellow-500' },
  { name: 'Figma', level: 72, color: 'from-purple-600 to-pink-600', icon: SiFigma, iconColor: 'text-purple-600' },
]

export function Skills() {
  const t = useTranslations('skills')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [showOffCanvas, setShowOffCanvas] = useState(false)

  const getLevelLabel = (level: number) => {
    if (level <= 40) return 'Ronronado Iniciante'
    if (level <= 70) return 'Miado Intermediário'
    if (level <= 99) return 'Gato Mestre'
    return 'Miaucódigo Mestre'
  }

  return (
    <section
      id="skills"
      ref={ref}
      className="py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 relative"
    >
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-comfortaa font-bold text-center mb-4 flex items-center justify-center gap-3"
        >
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
          <FaBook className="text-violet-600 dark:text-violet-300" />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 text-lg"
        >
          {t('description')}
        </motion.p>

        {/* Skills Grid with Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto"
        >
          {skillsData.map((skill, index) => {
            const Icon = skill.icon
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`text-3xl ${skill.iconColor}`} />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{skill.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{getLevelLabel(skill.level)}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{skill.level}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.03, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Floating Button to Open Off-Canvas - Only visible in Skills section */}
        <button
          onClick={() => setShowOffCanvas(true)}
          className="absolute right-0 top-1/3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-2 py-8 md:px-3 md:py-12 rounded-l-2xl shadow-2xl z-40 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
          aria-label="Ver Níveis de Miado"
          style={{ writingMode: 'vertical-rl' }}
        >
          <FaInfoCircle className="w-6 h-6 md:w-7 md:h-7" style={{ writingMode: 'horizontal-tb' }} />
          <span className="text-xs md:text-sm font-bold">
            Níveis de Miado
          </span>
        </button>

        {/* Off-Canvas Sidebar */}
        <AnimatePresence>
          {showOffCanvas && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOffCanvas(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />

              {/* Off-Canvas Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <FaBook className="w-6 h-6" />
                    <h3 className="text-2xl font-comfortaa font-bold">
                      {t('levels.title')}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowOffCanvas(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-base">
                    {t('levels.intro')}
                  </p>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-600">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">B</span>
                      </div>
                      <div>
                        <strong className="text-gray-900 dark:text-white text-base">Ronronado Iniciante (Básico):</strong>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('levels.beginner')}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">I</span>
                      </div>
                      <div>
                        <strong className="text-gray-900 dark:text-white text-base">Miado Intermediário (Mediano):</strong>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('levels.intermediate')}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-600">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">A</span>
                      </div>
                      <div>
                        <strong className="text-gray-900 dark:text-white text-base">Gato Mestre (Avançado):</strong>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('levels.advanced')}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-600">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">E</span>
                      </div>
                      <div>
                        <strong className="text-gray-900 dark:text-white text-base">Miaucódigo Mestre (Especialista):</strong>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('levels.expert')}</p>
                      </div>
                    </li>
                  </ul>

                  <p className="mt-6 text-center italic text-gray-600 dark:text-gray-400">
                    {t('levels.conclusion')}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
