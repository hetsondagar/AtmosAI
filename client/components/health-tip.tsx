"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Heart, Shield, Sun } from "lucide-react"

interface HealthTipProps {
  condition: "sunny" | "cloudy" | "rainy" | "clear"
  uvIndex: number
  aqi: number
}

export function HealthTip({ condition, uvIndex, aqi }: HealthTipProps) {
  const getHealthTip = () => {
    if (uvIndex > 7) {
      return {
        icon: Sun,
        title: "High UV Alert",
        tip: "Wear sunscreen and protective clothing. Limit outdoor exposure during peak hours.",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
      }
    }

    if (aqi > 100) {
      return {
        icon: Shield,
        title: "Air Quality Warning",
        tip: "Consider wearing a mask outdoors and limit strenuous activities.",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
      }
    }

    if (condition === "rainy") {
      return {
        icon: Shield,
        title: "Rainy Day Tips",
        tip: "Great day for indoor activities! Stay dry and consider vitamin D supplements.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      }
    }

    return {
      icon: Heart,
      title: "Perfect Weather",
      tip: "Ideal conditions for outdoor activities! Consider a walk or exercise outside.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    }
  }

  const healthTip = getHealthTip()
  const Icon = healthTip.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="glass-strong border-0 p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${healthTip.bgColor}`}>
            <Icon className={`h-6 w-6 ${healthTip.color}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">{healthTip.title}</h4>
            <p className="text-sm text-muted-foreground text-pretty">{healthTip.tip}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
