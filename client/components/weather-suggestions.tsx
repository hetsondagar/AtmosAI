"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Sun, Cloud, CloudRain, Plus } from "lucide-react"

interface WeatherSuggestionsProps {
  selectedDate: Date
}

export function WeatherSuggestions({ selectedDate }: WeatherSuggestionsProps) {
  // Mock weather data - in a real app, this would come from an API
  const getWeatherForDate = (date: Date) => {
    const day = date.getDay()
    if (day === 0 || day === 6) return "sunny" // Weekend
    if (day === 2) return "rainy" // Tuesday
    return "cloudy"
  }

  const weather = getWeatherForDate(selectedDate)

  const getSuggestions = () => {
    const isToday = selectedDate.toDateString() === new Date().toDateString()
    const dayPrefix = isToday ? "Today" : selectedDate.toLocaleDateString("en-US", { weekday: "long" })

    switch (weather) {
      case "sunny":
        return {
          icon: Sun,
          title: `${dayPrefix} looks sunny!`,
          suggestions: [
            "Perfect for outdoor picnic",
            "Great day for hiking",
            "Ideal for photography walk",
            "Beach day activities",
          ],
        }
      case "rainy":
        return {
          icon: CloudRain,
          title: `${dayPrefix} might be rainy`,
          suggestions: ["Indoor museum visit", "Cozy coffee shop work", "Home movie marathon", "Indoor rock climbing"],
        }
      default:
        return {
          icon: Cloud,
          title: `${dayPrefix} looks cloudy`,
          suggestions: [
            "Perfect for outdoor walks",
            "Good for cycling",
            "Ideal for farmers market",
            "Great for outdoor dining",
          ],
        }
    }
  }

  const { icon: Icon, title, suggestions } = getSuggestions()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="glass-strong border-1 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-muted/30">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">Weather-aware suggestions</p>
          </div>
        </div>

        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-foreground">{suggestion}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
