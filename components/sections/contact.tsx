'use client'
import { FaEnvelope, FaBox } from 'react-icons/fa'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Linkedin, Github, Send, CheckCircle } from 'lucide-react'

export function Contact() {
  const t = useTranslations('contact')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setTimeout(() => setSubmitted(true), 1000)
  }

  const socialLinks = [
    { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/izadora-cury-pierette-7a7754253/' },
    { icon: Github, label: 'GitHub', href: 'https://github.com/ipierette' },
    { icon: Mail, label: 'Email', href: 'mailto:izadoracury@gmail.com' },
  ]

  return (
    <section id="contact" ref={ref} className="py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-comfortaa font-bold text-center mb-4 flex items-center justify-center gap-3"
        >
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
          <FaBox className="text-amber-700 dark:text-amber-600" />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-600 dark:text-gray-300 mb-12"
        >
          {t('subtitle')}
        </motion.p>

        {!submitted ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl"
          >
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                {t('form.name')}
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder={t('form.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                {t('form.email')}
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder={t('form.emailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                {t('form.message')}
              </label>
              <textarea
                required
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-catbytes-purple focus:outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder={t('form.messagePlaceholder')}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-catbytes-purple to-catbytes-blue text-white rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-shadow"
            >
              <Send className="w-5 h-5" />
              {t('form.submit')}
            </button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-2xl text-center"
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              {t('form.success.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{t('form.success.description')}</p>
          </motion.div>
        )}

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
            {t('social.title')}
          </h3>
          <div className="flex justify-center gap-6">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                  aria-label={link.label}
                >
                  <Icon className="w-6 h-6 text-catbytes-purple" />
                </a>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
