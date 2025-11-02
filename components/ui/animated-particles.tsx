'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  color: string
  initialX: number
  initialY: number
  targetY: number
  duration: number
  delay: number
}

export function AnimatedParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  const neonColors = [
    'rgba(74, 222, 128, 0.4)', // green-400
    'rgba(168, 85, 247, 0.4)', // purple-500
    'rgba(59, 130, 246, 0.4)', // blue-500
    'rgba(52, 211, 153, 0.4)', // emerald-400
  ]

  const neonColorsDark = [
    'rgba(74, 222, 128, 0.6)', // green-400 mais forte
    'rgba(168, 85, 247, 0.6)', // purple-500 mais forte
    'rgba(59, 130, 246, 0.6)', // blue-500 mais forte
    'rgba(52, 211, 153, 0.6)', // emerald-400 mais forte
  ]

  useEffect(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight

    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: neonColors[i % neonColors.length],
      initialX: Math.random() * width,
      initialY: Math.random() * height,
      targetY: Math.random() * height,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 2,
    }))

    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-200/30 dark:from-blue-900/30 via-transparent to-transparent"></div>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            filter: 'blur(2px)',
            boxShadow: `0 0 4px ${particle.color}`,
          }}
          initial={{
            x: particle.initialX,
            y: particle.initialY,
            opacity: Math.random() * 0.4 + 0.3,
          }}
          animate={{
            y: [particle.initialY, particle.targetY, particle.initialY],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
