'use client'

import { motion } from 'framer-motion'
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
      className="relative min-h-screen flex items-end justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 pt-20 pb-0"
    >
      {/* Background Particles Effect */}
      <AnimatedParticles />

      {/* Desktop and Tablet Layout */}
      <div className="hidden md:grid container mx-auto px-4 z-10 md:grid-cols-2 gap-12 h-screen">
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

        {/* Cat Image with Hover Effect - Stays at Bottom */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
          className="relative flex items-end justify-center pb-8"
        >
          <div
            className="relative w-full max-w-md mx-auto cursor-pointer flex items-end"
            onMouseEnter={() => setShowCatMessage(true)}
            onMouseLeave={() => setShowCatMessage(false)}
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full flex justify-center"
            >
              <Image
                src="/images/gato-sentado.webp"
                alt="Axel - Gato mascote do CatBytes"
                width={250}
                height={250}
                className="w-48 sm:w-56 md:w-64 lg:w-56 h-auto drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Cat Speech Bubble */}
            {showCatMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xs border-2 border-gray-200 dark:border-gray-700"
              >
                <p className="text-sm font-medium">{t('catMessage')}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white dark:border-t-gray-800"></div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mobile Layout - Diagonal Overlay Design */}
      <div className="md:hidden relative w-full h-full z-10 px-4 py-8 flex items-center">
        {/* Cat Image - Large Background Element (bottom-right) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-full h-full"
          >
            <Image
              src="/images/gato-sentado.webp"
              alt="Axel - Mascote CatBytes"
              fill
              className="object-contain object-bottom-right drop-shadow-2xl opacity-90"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Content Card with Frosted Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 max-w-sm"
        >
          {/* Main Text Content Card */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-2xl sm:text-3xl font-comfortaa font-bold leading-tight text-gray-900 dark:text-white mb-3"
            >
              {t('title')}
              <br />
              <span className="bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent text-3xl sm:text-4xl">
                {t('brandName')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
            >
              {t('subtitle')}
            </motion.p>

            {/* Typing Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-base sm:text-lg font-bold mb-4"
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

            {/* Compact Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="grid grid-cols-2 gap-2"
            >
              <div className="bg-gradient-to-br from-catbytes-purple/10 to-catbytes-pink/10 dark:from-catbytes-purple/20 dark:to-catbytes-pink/20 rounded-xl p-3 border border-catbytes-purple/30 dark:border-catbytes-purple/50">
                <p className="text-lg font-bold text-catbytes-purple dark:text-catbytes-pink">250+</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Commits</p>
              </div>
              <div className="bg-gradient-to-br from-catbytes-blue/10 to-catbytes-purple/10 dark:from-catbytes-blue/20 dark:to-catbytes-purple/20 rounded-xl p-3 border border-catbytes-blue/30 dark:border-catbytes-blue/50">
                <p className="text-lg font-bold text-catbytes-blue">18</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Repos</p>
              </div>
            </motion.div>
          </div>

          {/* Cat Speech Bubble - Floating near cat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute -bottom-16 right-0 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-2xl shadow-xl text-xs border-2 border-gray-200 dark:border-gray-700 max-w-[180px]"
          >
            <p className="font-medium">{t('catMessage')}</p>
            <div className="absolute top-0 right-8 -translate-y-full w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white dark:border-b-gray-800"></div>
          </motion.div>
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
