"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, Thermometer, Wind, Eye, Sun, ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Alert } from "@/components/pages/alerts"

interface AlertCardProps {
  alert: Alert
  delay?: number
}

export function AlertCard({ alert, delay = 0 }: AlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getAlertConfig = () => {
    switch (alert.type) {
      case "severe":
        return {
          icon: AlertTriangle,
          bgColor: "bg-red-500/10 border-red-500/20",
          iconColor: "text-red-500",
          badgeVariant: "destructive" as const,
          pulseColor: "bg-red-500",
        }
      case "moderate":
        return {
          icon: AlertTriangle,
          bgColor: "bg-orange-500/10 border-orange-500/20",
          iconColor: "text-orange-500",
          badgeVariant: "secondary" as const,
          pulseColor: "bg-orange-500",
        }
      default:
        return {
          icon: Info,
          bgColor: "bg-blue-500/10 border-blue-500/20",
          iconColor: "text-blue-500",
          badgeVariant: "outline" as const,
          pulseColor: "bg-blue-500",
        }
    }
  }

  const getCategoryIcon = () => {
    switch (alert.category) {
      case "weather":
        return Wind
      case "air-quality":
        return Eye
      case "uv":
        return Sun
      case "temperature":
        return Thermometer
      default:
        return Info
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const config = getAlertConfig()
  const Icon = config.icon
  const CategoryIcon = getCategoryIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn("glass-strong border-2 overflow-hidden", config.bgColor)}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className={cn("p-3 rounded-xl", config.bgColor)}>
                <Icon className={cn("h-6 w-6", config.iconColor)} />
              </div>
              {alert.isActive && (
                <div className="absolute -top-1 -right-1">
                  <div className={cn("w-3 h-3 rounded-full animate-pulse", config.pulseColor)} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant={config.badgeVariant} 
                  className={cn(
                    "text-xs",
                    alert.type === "moderate" && "bg-orange-500 text-white hover:bg-orange-600",
                    alert.type === "info" && "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                >
                  {alert.type.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CategoryIcon className="h-3 w-3" />
                  {alert.category.replace("-", " ").toUpperCase()}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2 text-balance">{alert.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{alert.description}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {alert.location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(alert.startTime)} at {formatTime(alert.startTime)}
              {alert.endTime && ` - ${formatDate(alert.endTime)} at ${formatTime(alert.endTime)}`}
            </div>
          </div>

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between text-sm hover:text-black cursor-pointer"
          >
            <span>Safety Precautions ({alert.precautions.length})</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Expandable Precautions */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border/50"
            >
              <div className="p-6 pt-4">
                <div className="space-y-3">
                  {alert.precautions.map((precaution, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", config.pulseColor)} />
                      <p className="text-sm text-foreground text-pretty">{precaution}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
