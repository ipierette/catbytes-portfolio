'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { TypeAnimation } from 'react-type-animation'
import Image from 'next/image'
import { useState } from 'react'

export function Hero() {
  const t = useTranslations('hero')
  const [showCatMessage, setShowCatMessage] = useState(false)

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 pt-20"
    >
      {/* Background Particles Effect - Using CSS instead of particles.js for better performance */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [null, Math.random() * 0.5 + 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white space-y-6"
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-comfortaa font-bold leading-tight"
          >
            {t('title')}
            <br />
            <span className="catbytes-gradient animate-gradient text-5xl md:text-7xl lg:text-8xl">
              {t('brandName')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 leading-relaxed"
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
                'Criatividade',
                2000,
                'Código',
                2000,
                'Inteligência Artificial',
                2000,
                'Paixão por Tecnologia',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="catbytes-gradient"
            />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(138, 43, 226, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-catbytes-purple to-catbytes-blue text-white rounded-full font-semibold text-lg shadow-2xl"
            >
              {t('cta')}
              <span className="text-2xl">🐾</span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Cat Image with Hover Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
          className="relative"
        >
          <div
            className="relative w-full max-w-md mx-auto cursor-pointer"
            onMouseEnter={() => setShowCatMessage(true)}
            onMouseLeave={() => setShowCatMessage(false)}
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/gato-sentado.webp"
                alt="Axel - Gato mascote do CatBytes"
                width={400}
                height={400}
                className="w-full max-w-sm h-auto mx-auto drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Cat Speech Bubble */}
            {showCatMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white text-gray-800 px-6 py-4 rounded-2xl shadow-2xl max-w-xs"
              >
                <p className="text-sm font-medium">{t('catMessage')}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            className="w-1.5 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  )
}
