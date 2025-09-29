"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface SunRay {
  id: number
  x: number
  y: number
  length: number
  angle: number
  opacity: number
}

interface SunRaysProps {
  intensity?: "low" | "medium" | "high"
}

export function SunRays({ intensity = "medium" }: SunRaysProps) {
  const [rays, setRays] = useState<SunRay[]>([])

  useEffect(() => {
    const generateRays = () => {
      const newRays: SunRay[] = []
      const rayCount = intensity === "high" ? 12 : intensity === "medium" ? 8 : 6
      
      for (let i = 0; i < rayCount; i++) {
        const angle = (360 / rayCount) * i
        newRays.push({
          id: i,
          x: 50 + Math.cos(angle * Math.PI / 180) * 20,
          y: 50 + Math.sin(angle * Math.PI / 180) * 20,
          length: Math.random() * 30 + 20,
          angle: angle,
          opacity: Math.random() * 0.3 + 0.1,
        })
      }
      setRays(newRays)
    }

    generateRays()
  }, [intensity])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {rays.map((ray) => (
        <motion.div
          key={ray.id}
          className="absolute bg-gradient-to-r from-yellow-300/40 to-transparent dark:from-yellow-400/30"
          style={{
            width: ray.length,
            height: 2,
            left: `${ray.x}%`,
            top: `${ray.y}%`,
            opacity: ray.opacity,
            transformOrigin: "left center",
            transform: `rotate(${ray.angle}deg)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [ray.opacity * 0.5, ray.opacity, ray.opacity * 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: ray.id * 0.2,
          }}
        />
      ))}
    </div>
  )
}
