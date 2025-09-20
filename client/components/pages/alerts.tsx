"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCard } from "@/components/alert-card"
import { AlertFilters } from "@/components/alert-filters"
import { EmptyAlerts } from "@/components/empty-alerts"

export interface Alert {
  id: string
  type: "severe" | "moderate" | "info"
  category: "weather" | "air-quality" | "uv" | "temperature"
  title: string
  description: string
  location: string
  startTime: Date
  endTime?: Date
  precautions: string[]
  isActive: boolean
}

export function Alerts() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | Alert["type"]>("all")
  const [alerts] = useState<Alert[]>([
    {
      id: "1",
      type: "severe",
      category: "weather",
      title: "Severe Thunderstorm Warning",
      description: "Severe thunderstorms with damaging winds up to 70 mph and large hail expected.",
      location: "San Francisco Bay Area",
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      precautions: [
        "Stay indoors and away from windows",
        "Avoid using electrical appliances",
        "Do not drive through flooded roads",
        "Keep emergency supplies ready",
      ],
      isActive: true,
    },
    {
      id: "2",
      type: "moderate",
      category: "air-quality",
      title: "Air Quality Alert",
      description: "Unhealthy air quality for sensitive groups due to wildfire smoke.",
      location: "San Francisco, CA",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      precautions: [
        "Limit outdoor activities",
        "Keep windows and doors closed",
        "Use air purifiers if available",
        "Wear N95 masks when outdoors",
      ],
      isActive: true,
    },
    {
      id: "3",
      type: "info",
      category: "uv",
      title: "High UV Index",
      description: "UV index will reach 9 (very high) between 11 AM and 3 PM today.",
      location: "San Francisco, CA",
      startTime: new Date(),
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      precautions: [
        "Apply SPF 30+ sunscreen every 2 hours",
        "Wear protective clothing and sunglasses",
        "Seek shade during peak hours",
        "Stay hydrated",
      ],
      isActive: true,
    },
    {
      id: "4",
      type: "moderate",
      category: "temperature",
      title: "Heat Advisory",
      description: "Temperatures expected to reach 95°F with high humidity making it feel like 105°F.",
      location: "San Francisco, CA",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      precautions: [
        "Drink plenty of water",
        "Avoid strenuous outdoor activities",
        "Check on elderly neighbors",
        "Never leave children or pets in vehicles",
      ],
      isActive: false,
    },
  ])

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedFilter === "all") return true
    return alert.type === selectedFilter
  })

  const activeAlerts = filteredAlerts.filter((alert) => alert.isActive)
  const upcomingAlerts = filteredAlerts.filter((alert) => !alert.isActive)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-foreground mb-2"
        >
          Weather Alerts
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg"
        >
          Stay informed about severe weather conditions and safety precautions
        </motion.p>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <AlertFilters selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} alerts={alerts} />
      </motion.div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Active Alerts</h2>
          <div className="space-y-4">
            {activeAlerts.map((alert, index) => (
              <AlertCard key={alert.id} alert={alert} delay={index * 0.1} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Upcoming Alerts */}
      {upcomingAlerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Upcoming Alerts</h2>
          <div className="space-y-4">
            {upcomingAlerts.map((alert, index) => (
              <AlertCard key={alert.id} alert={alert} delay={index * 0.1} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <EmptyAlerts />
        </motion.div>
      )}
    </div>
  )
}
