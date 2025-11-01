'use client'
import { FaUser, FaCat } from 'react-icons/fa'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { Code, Laptop, Coffee, BookOpen } from 'lucide-react'

export function About() {
  const t = useTranslations('about')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const skills = [
    { icon: Code, label: t('skills.programming'), color: 'text-green-500' },
    { icon: Laptop, label: t('skills.webDevelopment'), color: 'text-blue-500' },
    { icon: Coffee, label: t('skills.coffeeAndCreativity'), color: 'text-orange-500' },
    { icon: BookOpen, label: t('skills.continuousLearning'), color: 'text-purple-500' },
  ]

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 px-4 bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-comfortaa font-bold text-center mb-12 flex items-center justify-center gap-3"
        >
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
          <FaCat className="text-orange-500 dark:text-orange-400" />
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <Image
              src="/images/izadora.webp"
              alt="Izadora Cury Pierette"
              width={500}
              height={500}
              className="rounded-2xl shadow-2xl mx-auto border-4 border-catbytes-green"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {t('intro')}
            </p>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {t('description')}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              {skills.map((skill, index) => {
                const Icon = skill.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="flex flex-col items-center gap-2"
                    title={skill.label}
                  >
                    <Icon className={`w-10 h-10 ${skill.color}`} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
