'use client'
import { FaRocket, FaLightbulb } from 'react-icons/fa'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ExternalLink, Github, ChevronLeft, ChevronRight, Code2, Layers } from 'lucide-react'

interface Project {
  id: string
  image: string
  link: string
  github: string
  stack: string[]
  type: string
  featured?: boolean
}

const projectsData: Project[] = [
  {
    id: 'meowflix',
    image: '/images/meowflixia.png',
    link: 'https://meowflixia.netlify.app/',
    github: 'https://github.com/ipierette/meowflix-ai-mood-matcher',
    stack: ['React', 'TypeScript', 'Gemini AI', 'TMDB API', 'Netlify Functions', 'Tailwind CSS'],
    type: 'Fullstack AI',
    featured: true
  },
  {
    id: 'catbutler',
    image: '/images/catbutler.png',
    link: 'https://catbutler-frontend.vercel.app/',
    github: 'https://github.com/ipierette/catbutler-frontend',
    stack: ['React', 'Vite', 'Node.js', 'Express', 'AI Integration', 'Gamification'],
    type: 'SPA Dashboard'
  },
  {
    id: 'chatbot',
    image: '/images/chatbot.webp',
    link: 'https://ipierette.github.io/chat-bot-via-lactea/',
    github: 'https://github.com/ipierette/chat-bot-via-lactea',
    stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'DOM Manipulation', 'Animations'],
    type: 'Frontend'
  },
  {
    id: 'agent',
    image: '/images/demo-agente.png',
    link: 'https://demo-agenteia.netlify.app/',
    github: 'https://github.com/ipierette/demo-agente',
    stack: ['n8n', 'PostgreSQL', 'WhatsApp API', 'OpenAI', 'Multimodal AI'],
    type: 'Automation System',
    featured: true
  },
  {
    id: 'medical',
    image: '/images/simples-medico.png',
    link: 'https://simples-medico.netlify.app/',
    github: 'https://github.com/ipierette/simples-m-dico',
    stack: ['HTML', 'CSS', 'JavaScript', 'n8n', 'Supabase', 'OpenAI API'],
    type: 'Institutional Website'
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
    <section id="projects" ref={ref} className="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-comfortaa font-bold mb-4 flex items-center justify-center gap-3">
            <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
            <FaLightbulb className="text-yellow-500 dark:text-yellow-400" />
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('subtitle') || 'Projetos que demonstram expertise técnica e soluções inovadoras'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          {/* Main Project Card - Fixed height */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 h-[600px] lg:h-[500px]">
            <div className="grid lg:grid-cols-5 gap-0 h-full">
              {/* Image Section - Takes 3 columns */}
              <div className="lg:col-span-3 relative h-64 lg:h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
                {currentProject.featured && (
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-catbytes-purple to-catbytes-pink text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Featured Project
                  </div>
                )}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProject.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={currentProject.image}
                      alt={t(`items.${currentProject.id}.title`)}
                      fill
                      className="object-contain"
                      priority={currentIndex === 0}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Content Section - Takes 2 columns */}
              <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProject.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 lg:space-y-4"
                  >
                    {/* Project Type Badge */}
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-catbytes-purple" />
                      <span className="text-sm font-semibold text-catbytes-purple dark:text-catbytes-pink uppercase tracking-wide">
                        {currentProject.type}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl lg:text-3xl font-comfortaa font-bold text-gray-900 dark:text-white leading-tight">
                      {t(`items.${currentProject.id}.title`)}
                    </h3>

                    {/* Description */}
                    <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {t(`items.${currentProject.id}.description`)}
                    </p>

                    {/* Tech Stack */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Code2 className="w-4 h-4" />
                        <span>Tech Stack:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.stack.map((tech, index) => (
                          <span
                            key={`${currentProject.id}-${tech}-${index}`}
                            className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-gray-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <a
                    href={currentProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-catbytes-purple to-catbytes-blue text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {t('viewProject') || 'View Live'}
                  </a>
                  <a
                    href={currentProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-catbytes-purple text-catbytes-purple dark:text-white rounded-xl hover:bg-catbytes-purple hover:text-white transition-all duration-300 font-semibold"
                  >
                    <Github className="w-5 h-5" />
                    {t('viewCode') || 'Code'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <button
              onClick={prevProject}
              className="group p-4 bg-white dark:bg-gray-800 text-catbytes-purple dark:text-white rounded-full hover:bg-catbytes-purple hover:text-white dark:hover:bg-catbytes-purple transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110"
              aria-label={t('prevButton') || 'Previous project'}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-3">
              {projectsData.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-12 h-4 bg-gradient-to-r from-catbytes-purple to-catbytes-blue shadow-lg'
                      : 'w-4 h-4 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to ${t(`items.${project.id}.title`)}`}
                />
              ))}
            </div>

            <button
              onClick={nextProject}
              className="group p-4 bg-white dark:bg-gray-800 text-catbytes-purple dark:text-white rounded-full hover:bg-catbytes-purple hover:text-white dark:hover:bg-catbytes-purple transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110"
              aria-label={t('nextButton') || 'Next project'}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Project Counter */}
          <div className="text-center mt-8">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Project <span className="text-catbytes-purple dark:text-catbytes-pink font-bold">{currentIndex + 1}</span> of{' '}
              <span className="font-bold">{projectsData.length}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
