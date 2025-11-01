'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { 
  SiHtml5, SiCss3, SiJavascript, SiReact, SiNextdotjs, 
  SiTypescript, SiTailwindcss, SiNodedotjs, SiPostgresql, 
  SiGit, SiPython, SiFigma 
} from 'react-icons/si'
import { FaBook } from 'react-icons/fa'

const skillsData = [
  { name: 'HTML5', level: 95, color: 'bg-orange-500', icon: SiHtml5 },
  { name: 'CSS3', level: 90, color: 'bg-blue-500', icon: SiCss3 },
  { name: 'JavaScript', level: 85, color: 'bg-yellow-400', icon: SiJavascript },
  { name: 'React', level: 88, color: 'bg-cyan-500', icon: SiReact },
  { name: 'Next.js', level: 82, color: 'bg-black dark:bg-white', icon: SiNextdotjs },
  { name: 'TypeScript', level: 75, color: 'bg-blue-600', icon: SiTypescript },
  { name: 'Tailwind CSS', level: 92, color: 'bg-teal-500', icon: SiTailwindcss },
  { name: 'Node.js', level: 70, color: 'bg-green-600', icon: SiNodedotjs },
  { name: 'PostgreSQL', level: 65, color: 'bg-blue-700', icon: SiPostgresql },
  { name: 'Git', level: 80, color: 'bg-red-600', icon: SiGit },
  { name: 'Python', level: 60, color: 'bg-yellow-500', icon: SiPython },
  { name: 'Figma', level: 72, color: 'bg-purple-600', icon: SiFigma },
]

export function Skills() {
  const t = useTranslations('skills')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="skills"
      ref={ref}
      className="py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-comfortaa font-bold text-center mb-4 flex items-center justify-center gap-3"
        >
          <FaBook className="text-violet-600 dark:text-violet-300" />
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 text-lg"
        >
          {t('description')}
        </motion.p>

        {/* Skills Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16"
        >
          {skillsData.map((skill, index) => {
            const Icon = skill.icon
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className={`${skill.color} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden group`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Icon */}
                <div className="relative z-10">
                  <Icon className="text-5xl mb-3" />
                  <h3 className="font-bold text-lg mb-2">{skill.name}</h3>
                  <div className="text-3xl font-extrabold">{skill.level}%</div>
                  <p className="text-xs mt-1 opacity-90">
                    {skill.level >= 71 ? '🐱 Gato Mestre' : skill.level >= 41 ? '😺 Miado Intermediário' : '🐾 Ronronado Iniciante'}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Níveis de Miado Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h3 className="text-2xl font-comfortaa font-bold text-center mb-6 text-purple-600 dark:text-purple-400">
            {t('levels.title')}
          </h3>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {t('levels.intro')}
          </p>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🐾</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Ronronado Iniciante (Básico):</strong>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('levels.beginner')}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">😺</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Miado Intermediário (Mediano):</strong>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('levels.intermediate')}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🐱</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Gato Mestre (Avançado):</strong>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('levels.advanced')}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">😻</span>
              <div>
                <strong className="text-gray-900 dark:text-white">Miaucódigo Mestre (Especialista):</strong>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('levels.expert')}</p>
              </div>
            </li>
          </ul>

          <p className="mt-6 text-center italic text-gray-600 dark:text-gray-400">
            {t('levels.conclusion')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
