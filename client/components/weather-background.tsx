"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { WeatherParticles } from "./weather-particles"
import { RainEffect } from "./rain-effect"
import { SunRays } from "./sun-rays"

interface WeatherBackgroundProps {
  condition: "sunny" | "cloudy" | "rainy" | "clear"
  className?: string
}

export function WeatherBackground({ condition, className = "" }: WeatherBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getBackgroundStyle = () => {
    switch (condition) {
      case "sunny":
        return "bg-gradient-to-b from-yellow-50 via-amber-50 to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
      case "cloudy":
        return "bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      case "rainy":
        return "bg-gradient-to-b from-sky-100 via-sky-200 to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
      default:
        return "bg-gradient-to-b from-indigo-100 via-blue-100 to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900"
    }
  }

  const getWeatherEffects = () => {
    switch (condition) {
      case "sunny":
        return (
          <>
            <WeatherParticles condition="sunny" intensity="medium" />
            <SunRays intensity="medium" />
          </>
        )
      case "cloudy":
        return <WeatherParticles condition="cloudy" intensity="low" />
      case "rainy":
        return (
          <>
            <WeatherParticles condition="rainy" intensity="high" />
            <RainEffect intensity="moderate" />
          </>
        )
      default:
        return <WeatherParticles condition="clear" intensity="low" />
    }
  }

  return (
    <div className={`fixed inset-0 -z-10 transition-all duration-1000 ${getBackgroundStyle()} ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        {getWeatherEffects()}
      </motion.div>
    </div>
  )
}
