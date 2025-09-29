"use client"

import { Cloud, CloudRain, Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"

interface WeatherCardProps {
  location: string
  temperature: number
  condition: "sunny" | "cloudy" | "rainy" | "clear"
  description: string
  unit?: "°F" | "°C"
}

export function WeatherCard({ location, temperature, condition, description, unit = "°F" }: WeatherCardProps) {
  const getWeatherIcon = () => {
    switch (condition) {
      case "sunny":
        return (
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
          >
            <Sun className="h-16 w-16 text-yellow-500" />
          </motion.div>
        )
      case "cloudy":
        return (
          <motion.div
            animate={{ 
              x: [0, 5, -5, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 3, 
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
          >
            <Cloud className="h-16 w-16 text-gray-500" />
          </motion.div>
        )
      case "rainy":
        return (
          <motion.div
            animate={{ 
              y: [0, 3, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
          >
            <CloudRain className="h-16 w-16 text-blue-500" />
          </motion.div>
        )
      default:
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 5, 
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
          >
            <Moon className="h-16 w-16 text-indigo-400" />
          </motion.div>
        )
    }
  }

  const getGradientClass = () => {
    switch (condition) {
      case "sunny":
        return "from-yellow-300/30 via-orange-200/20 to-transparent"
      case "cloudy":
        return "from-slate-300/30 via-slate-200/20 to-transparent"
      case "rainy":
        return "from-sky-400/30 via-cyan-300/20 to-transparent"
      default:
        return "from-indigo-400/30 via-purple-300/20 to-transparent"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`glass-strong rounded-3xl p-8 max-w-md w-full bg-gradient-to-br ${getGradientClass()} shadow-2xl`}
    >
      <div className="text-center">
        {/* Location */}
        <h2 className="text-lg font-medium text-muted-foreground mb-2">{location}</h2>

        {/* Weather Icon */}
        <motion.div
          initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 12 }}
          className="flex justify-center mb-4"
        >
          {getWeatherIcon()}
        </motion.div>

        {/* Temperature */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-2">
          <span className="text-6xl font-bold text-foreground">{temperature}</span>
          <span className="text-2xl text-muted-foreground">{unit}</span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-lg"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  )
}
