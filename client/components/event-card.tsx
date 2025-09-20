"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, MapPin, Trash2, Cloud, Sun, CloudRain } from "lucide-react"
import type { Event } from "@/components/pages/planner"

interface EventCardProps {
  event: Event
  onDelete: (eventId: string) => void
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const getWeatherIcon = () => {
    switch (event.weather) {
      case "sunny":
        return <Sun className="h-4 w-4 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-4 w-4 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getTypeColor = () => {
    switch (event.type) {
      case "outdoor":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "indoor":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      default:
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="glass border-0 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-foreground truncate">{event.title}</h4>
              {getWeatherIcon()}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {event.time}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor()}`}>{event.type}</span>
              </div>
            </div>

            {event.description && <p className="text-xs text-muted-foreground text-pretty">{event.description}</p>}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(event.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
