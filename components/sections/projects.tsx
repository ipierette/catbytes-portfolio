'use client'
import { FaRocket, FaLightbulb } from 'react-icons/fa'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react'

const projectsData = [
  {
    id: 'meowflix',
    image: 'https://placehold.co/600x400/8A2BE2/FFFFFF?text=MeowFlix+IA',
    link: '#',
    github: '#'
  },
  {
    id: 'catbutler',
    image: 'https://placehold.co/600x400/00BFFF/FFFFFF?text=CATButler',
    link: '#',
    github: '#'
  },
  {
    id: 'chatbot',
    image: 'https://placehold.co/600x400/2E8B57/FFFFFF?text=ChatBot+IA',
    link: '#',
    github: '#'
  },
  {
    id: 'agent',
    image: 'https://placehold.co/600x400/FF8C00/FFFFFF?text=Agente+IA',
    link: '#',
    github: '#'
  },
  {
    id: 'medical',
    image: 'https://placehold.co/600x400/FF69B4/FFFFFF?text=Site+Médico',
    link: '#',
    github: '#'
  }
]

export function Projects() {
  const t = useTranslations('projects')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projectsData.length)
  }

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projectsData.length) % projectsData.length)
  }

  const currentProject = projectsData[currentIndex]

  return (
    <section id="projects" ref={ref} className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-comfortaa font-bold text-center mb-12 flex items-center justify-center gap-3"
        >
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
          <FaLightbulb className="text-yellow-500 dark:text-yellow-400" />
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div className="relative h-64 md:h-full">
              <Image
                src={currentProject.image}
                alt={t(`items.${currentProject.id}.title`)}
                fill
                className="object-cover rounded-lg"
                unoptimized
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-comfortaa font-bold mb-4 text-gray-800 dark:text-white">
                  {t(`items.${currentProject.id}.title`)}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {t(`items.${currentProject.id}.description`)}
                </p>
              </div>

              <div className="flex gap-4">
                <a
                  href={currentProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-catbytes-purple text-white rounded-lg hover:bg-catbytes-blue transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t('viewProject')}
                </a>
                <a
                  href={currentProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 border-2 border-catbytes-purple text-catbytes-purple dark:text-white rounded-lg hover:bg-catbytes-purple hover:text-white transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={prevProject}
            className="p-3 bg-catbytes-purple text-white rounded-full hover:bg-catbytes-blue transition-colors"
            aria-label={t('prevButton')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {projectsData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-catbytes-purple'
                    : 'w-3 bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to project ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextProject}
            className="p-3 bg-catbytes-purple text-white rounded-full hover:bg-catbytes-blue transition-colors"
            aria-label={t('nextButton')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
