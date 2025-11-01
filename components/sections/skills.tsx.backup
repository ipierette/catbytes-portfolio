'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

const skillsData = [
  { name: 'HTML5', level: 95, category: 'advanced' },
  { name: 'CSS3', level: 90, category: 'advanced' },
  { name: 'JavaScript', level: 85, category: 'advanced' },
  { name: 'React', level: 88, category: 'advanced' },
  { name: 'Next.js', level: 82, category: 'advanced' },
  { name: 'TypeScript', level: 75, category: 'advanced' },
  { name: 'Tailwind CSS', level: 92, category: 'advanced' },
  { name: 'Node.js', level: 70, category: 'intermediate' },
  { name: 'PostgreSQL', level: 65, category: 'intermediate' },
  { name: 'Git', level: 80, category: 'advanced' },
]

export function Skills() {
  const t = useTranslations('skills')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const getLevelLabel = (level: number) => {
    if (level <= 40) return t('levels.beginner')
    if (level <= 70) return t('levels.intermediate')
    if (level <= 99) return t('levels.advanced')
    return t('levels.expert')
  }

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
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
          <span>📚</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-center text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
        >
          {t('description')}
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {skillsData.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {skill.name}
                </h3>
                <span className="text-catbytes-purple font-bold">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${skill.level}%` } : {}}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-catbytes-purple via-catbytes-blue to-catbytes-green"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {getLevelLabel(skill.level)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Meow Levels Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="mt-16 max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
        >
          <h3 className="text-2xl font-comfortaa font-bold mb-4 text-center">
            {t('levels.title')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{t('levels.intro')}</p>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span>🐱</span>
              <span>{t('levels.beginner')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🐈</span>
              <span>{t('levels.intermediate')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🦁</span>
              <span>{t('levels.advanced')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🐯</span>
              <span>{t('levels.expert')}</span>
            </li>
          </ul>
          <p className="mt-6 text-gray-600 dark:text-gray-400 italic">
            {t('levels.conclusion')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
