"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface RainDrop {
  id: number
  x: number
  y: number
  length: number
  speed: number
  opacity: number
}

interface RainEffectProps {
  intensity?: "light" | "moderate" | "heavy"
}

export function RainEffect({ intensity = "moderate" }: RainEffectProps) {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([])

  useEffect(() => {
    const generateRain = () => {
      const newRain: RainDrop[] = []
      const dropCount = intensity === "heavy" ? 50 : intensity === "moderate" ? 30 : 15
      
      for (let i = 0; i < dropCount; i++) {
        newRain.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          length: Math.random() * 20 + 10,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.6 + 0.2,
        })
      }
      setRainDrops(newRain)
    }

    generateRain()
  }, [intensity])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {rainDrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute bg-blue-400/60 dark:bg-blue-300/50"
          style={{
            width: 1,
            height: drop.length,
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            opacity: drop.opacity,
          }}
          animate={{
            y: [0, 100],
            opacity: [0, drop.opacity, 0],
          }}
          transition={{
            duration: drop.speed,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
