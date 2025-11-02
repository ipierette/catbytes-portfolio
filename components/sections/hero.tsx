'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { TypeAnimation } from 'react-type-animation'
import Image from 'next/image'
import { useState } from 'react'
import { AnimatedParticles } from '@/components/ui/animated-particles'
import { GitHubStats } from '@/components/ui/github-stats'

export function Hero() {
  const t = useTranslations('hero')
  const [showCatMessage, setShowCatMessage] = useState(false)

  return (
    <section
      id="hero"
      className="relative min-h-screen max-h-screen flex items-end justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 pt-20 pb-0"
    >
      {/* Background Particles Effect */}
      <AnimatedParticles />

      {/* Desktop and Tablet Layout */}
      <div className="hidden md:grid container mx-auto px-4 z-10 md:grid-cols-2 gap-12 h-full max-h-full">
        {/* Text Content - Vertically Centered */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 flex flex-col justify-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-comfortaa font-bold leading-tight text-gray-900 dark:text-white"
          >
            {t('title')}
            <br />
            <span className="bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent animate-gradient text-5xl md:text-7xl lg:text-8xl">
              {t('brandName')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium"
          >
            {t('subtitle')}
          </motion.p>

          {/* Typing Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-2xl md:text-3xl font-bold"
          >
            <TypeAnimation
              sequence={[
                t('typing.creativity'),
                2000,
                t('typing.code'),
                2000,
                t('typing.ai'),
                2000,
                t('typing.passion'),
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent"
            />
          </motion.div>

          {/* GitHub Stats - Dynamic */}
          <GitHubStats />
        </motion.div>

        {/* Cat Image with Hover Effect - Sits at Bottom of Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
          className="relative flex items-end justify-center"
        >
          <div
            className="relative w-full max-w-md mx-auto cursor-pointer flex items-end group"
            onMouseEnter={() => setShowCatMessage(true)}
            onMouseLeave={() => setShowCatMessage(false)}
          >
            <div className="w-full flex justify-center transition-all duration-300 hover:scale-105 hover:brightness-110">
              <Image
                src="/images/gato-sentado.webp"
                alt="Axel - Gato mascote do CatBytes"
                width={250}
                height={250}
                className="w-48 sm:w-56 md:w-64 lg:w-56 h-auto drop-shadow-2xl"
                priority
              />
            </div>

            {/* Cat Speech Bubble - Hover */}
            <AnimatePresence>
              {showCatMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xs border-2 border-gray-200 dark:border-gray-700 z-50"
                >
                  <p className="text-sm font-medium">{t('catMessage')}</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white dark:border-t-gray-800"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Mobile Layout - Simples e Profissional */}
      <div className="md:hidden w-full min-h-screen flex items-center justify-between px-4 py-20 z-10">
        {/* Left: Text Content (55%) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-[55%] flex flex-col space-y-4 pr-2"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl font-comfortaa font-bold leading-tight text-gray-900 dark:text-white"
          >
            {t('title')}
            <br />
            <span className="bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent text-2xl">
              {t('brandName')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          {/* GitHub Stats - Mobile (2 items only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col gap-2 max-w-[120px]"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-md">
              <p className="text-sm font-bold text-catbytes-purple dark:text-catbytes-pink">250+</p>
              <p className="text-[9px] text-gray-600 dark:text-gray-400">Commits</p>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-md">
              <p className="text-sm font-bold text-catbytes-blue">18</p>
              <p className="text-[9px] text-gray-600 dark:text-gray-400">Repos</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Cat Image (45%) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-[45%] flex items-end justify-end"
          onTouchStart={() => setShowCatMessage(true)}
          onTouchEnd={() => setShowCatMessage(false)}
        >
          <div className="relative w-full max-w-[200px]">
            <Image
              src="/images/gato-sentado.webp"
              alt="Axel - Mascote CatBytes"
              width={200}
              height={300}
              className="w-full h-auto drop-shadow-2xl"
              priority
            />
          </div>

          {/* Cat Speech Bubble - Mobile */}
          <AnimatePresence>
            {showCatMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-b-2xl shadow-2xl text-xs border-b-2 border-gray-200 dark:border-gray-700 z-[1050] text-center mx-auto"
              >
                <p className="font-medium">{t('catMessage')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-gray-800 dark:border-white rounded-full flex justify-center backdrop-blur-sm">
          <motion.div
            className="w-1.5 h-3 bg-gray-800 dark:bg-white rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  )
}
