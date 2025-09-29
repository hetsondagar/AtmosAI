"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

interface WeatherParticlesProps {
  condition: "sunny" | "cloudy" | "rainy" | "clear"
  intensity?: "low" | "medium" | "high"
}

export function WeatherParticles({ condition, intensity = "medium" }: WeatherParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      const particleCount = intensity === "high" ? 30 : intensity === "medium" ? 20 : 10
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 6 + 2,
          opacity: Math.random() * 0.4 + 0.1,
          duration: Math.random() * 15 + 8,
          delay: Math.random() * 5,
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [condition, intensity])

  const getParticleStyle = () => {
    switch (condition) {
      case "sunny":
        return "bg-yellow-300/40 dark:bg-yellow-400/30"
      case "cloudy":
        return "bg-gray-400/30 dark:bg-gray-300/20"
      case "rainy":
        return "bg-blue-400/50 dark:bg-blue-300/40"
      default:
        return "bg-indigo-300/40 dark:bg-indigo-400/30"
    }
  }

  const getAnimation = () => {
    switch (condition) {
      case "sunny":
        return {
          y: [0, -30, 0],
          x: [0, 15, -15, 0],
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }
      case "cloudy":
        return {
          y: [0, -10, 0],
          x: [0, 5, -5, 0],
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }
      case "rainy":
        return {
          y: [0, 50, 0],
          x: [0, 2, -2, 0],
          scale: [1, 0.8, 1],
        }
      default:
        return {
          y: [0, -20, 0],
          x: [0, 10, -10, 0],
          scale: [1, 1.2, 1],
        }
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${getParticleStyle()}`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={getAnimation()}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
