"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AlertCard } from "@/components/alert-card"
import { AlertFilters } from "@/components/alert-filters"
import { EmptyAlerts } from "@/components/empty-alerts"
import { API_BASE_URL, loadLocalSettings } from "@/lib/api"
import { getCurrentLocation, type LocationData } from "@/lib/location"

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
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<LocationData | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const settings = loadLocalSettings<any>("atmosai_settings", null)
        const loc = await getCurrentLocation({
          autoLocation: settings?.autoLocation ?? true,
          defaultLocation: settings?.defaultLocation ?? "San Francisco, CA",
          coordinates: settings?.coordinates
        })
        setLocationData(loc)
      } catch {}
    }
    init()
  }, [])

  useEffect(() => {
    const fetchAlerts = async (lat: number, lng: number) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/api/weather/alerts?lat=${lat}&lng=${lng}`)
        const json = await res.json().catch(() => null)
        if (res.ok && json?.success && Array.isArray(json.data)) {
          const mapped: Alert[] = json.data.map((a: any, idx: number) => ({
            id: a.id || String(idx),
            type: ((a.severity?.level || a.type) >= 4 || a.type === 'severe') ? 'severe' : (a.type === 'info' ? 'info' : 'moderate'),
            category: (a.category || 'weather'),
            title: a.title || a.event || 'Weather Alert',
            description: a.description || a.details || '',
            location: a.location?.name || a.area || `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
            startTime: a.startTime ? new Date(a.startTime) : (a.start ? new Date(a.start) : new Date()),
            endTime: a.endTime ? new Date(a.endTime) : (a.end ? new Date(a.end) : undefined),
            precautions: Array.isArray(a.precautions) ? a.precautions : (a.instructions ? [a.instructions] : []),
            isActive: a.isActive !== undefined ? !!a.isActive : true,
          }))
          setAlerts(mapped)
        } else {
          setAlerts([])
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load alerts')
        setAlerts([])
      } finally {
        setLoading(false)
      }
    }

    if (locationData) {
      fetchAlerts(locationData.lat, locationData.lng)
    }
  }, [locationData])

  const filteredAlerts = useMemo(() => alerts.filter((alert) => {
    if (selectedFilter === "all") return true
    return alert.type === selectedFilter
  }), [alerts, selectedFilter])

  const activeAlerts = useMemo(() => filteredAlerts.filter((alert) => alert.isActive), [filteredAlerts])
  const upcomingAlerts = useMemo(() => filteredAlerts.filter((alert) => !alert.isActive), [filteredAlerts])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-md p-3">
          {error}
        </div>
      )}
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
