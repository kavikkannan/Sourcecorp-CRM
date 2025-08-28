'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, useAnimation } from 'framer-motion'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { cn } from '@/utils/cn'

const BirthdayConfettiCore = ({
  id = 'birthday-confetti',
  className,
  background = 'transparent',
  particleCount = 200,
  particleColors,
}) => {
  const [ready, setReady] = useState(false)
  const controls = useAnimation()

  // Initialize the tsparticles engine once
  useEffect(() => {
    initParticlesEngine(loadSlim).then(() => setReady(true))
  }, [])

  // Animate fade-in once particles are loaded
  const particlesLoaded = useCallback(
    async (container) => {
      if (container) {
        controls.start({
          opacity: 1,
          transition: { duration: 1, ease: 'easeOut' },
        })
      }
    },
    [controls]
  )

  // Default confetti colors (can be overridden via props)
  const defaultColors = [
    '#E67E22',
    '#2ECC71',
    '#3498DB',
    '#9B59B6',
    '#F1C40F',
    '#E74C3C',
  ]

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0 }}
      className={cn('relative h-full w-full', className)}
    >
      {ready && (
        <Particles
          id={id}
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: background } },
            fullScreen: { enable: false, zIndex: 0 },
            fpsLimit: 60,

            emitters: {
              direction: 'bottom',
              rate: { quantity: 5, delay: 0.15 },
              position: { x: 50, y: 0 },
              size: { width: 100, height: 0 },
            },

            particles: {
              color: { value: particleColors || defaultColors },
              shape: { type: ['circle', 'square', 'triangle'] },

              opacity: {
                value: { min: 0.5, max: 1 },
                animation: { enable: true, speed: 1, startValue: 'random' },
              },

              size: { value: { min: 3, max: 7 } },

              number: {
                value: particleCount,
                density: { enable: true },
              },

              move: {
                enable: true,
                speed: { min: 1, max: 4 },
                direction: 'bottom',
                gravity: { enable: true, acceleration: 2 },
                outModes: { default: 'destroy', top: 'none' },
              },

              rotate: {
                value: { min: 0, max: 360 },
                direction: 'random',
                animation: { enable: true, speed: 30 },
              },

              wobble: {
                enable: true,
                distance: 15,
                speed: { min: -7, max: 7 },
              },
            },

            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  )
}

export default BirthdayConfettiCore
