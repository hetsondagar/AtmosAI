"use client"

import { Cloud, CloudRain, Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"

interface WeatherCardProps {
  location: string
  temperature: number
  condition: "sunny" | "cloudy" | "rainy" | "clear"
  description: string
}

export function WeatherCard({ location, temperature, condition, description }: WeatherCardProps) {
  const getWeatherIcon = () => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-16 w-16 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-16 w-16 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-16 w-16 text-blue-500" />
      default:
        return <Moon className="h-16 w-16 text-indigo-400" />
    }
  }

  const getGradientClass = () => {
    switch (condition) {
      case "sunny":
        return "from-yellow-400/20 to-orange-400/20"
      case "cloudy":
        return "from-gray-400/20 to-slate-400/20"
      case "rainy":
        return "from-blue-400/20 to-cyan-400/20"
      default:
        return "from-indigo-400/20 to-purple-400/20"
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
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          {getWeatherIcon()}
        </motion.div>

        {/* Temperature */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-2">
          <span className="text-6xl font-bold text-foreground">{temperature}</span>
          <span className="text-2xl text-muted-foreground">°F</span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-lg"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  )
}
