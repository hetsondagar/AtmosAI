"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Calendar } from "@/components/calendar"
import { EventCard } from "@/components/event-card"
import { WeatherSuggestions } from "@/components/weather-suggestions"
import { AddEventDialog } from "@/components/add-event-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createEvent, deleteEventById, fetchEvents, aiEventRecommendations } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export interface Event {
  id: string
  title: string
  date: Date
  time: string
  type: "outdoor" | "indoor" | "flexible"
  weather: "sunny" | "cloudy" | "rainy" | "any"
  description?: string
}

export function Planner() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const { toast } = useToast()
  const [aiTips, setAiTips] = useState<string[]>([])
  const [resolvedLocationName, setResolvedLocationName] = useState<string>("")

  // Fetch events for selected date from backend
  useEffect(() => {
    const load = async () => {
      try {
        const y = selectedDate.getFullYear()
        const m = selectedDate.getMonth() + 1
        const d = selectedDate.getDate().toString().padStart(2, '0')
        const month = (m).toString().padStart(2, '0')
        const dateStr = `${y}-${month}-${d}`
        const res = await fetchEvents({ date: dateStr, limit: 100 })
        const list = (res?.data || []) as any[]
        setEvents(list.map((e) => ({
          id: e._id,
          title: e.title,
          date: new Date(e.date),
          time: e.time,
          type: e.type,
          weather: e.weather,
          description: e.description,
        })))
      } catch {
        setEvents([])
      }
    }
    
    const loadAI = async () => {
      try {
        const loc = await new Promise<{ lat: number; lng: number }>((resolve) => {
          if (navigator?.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              () => resolve({ lat: 37.7749, lng: -122.4194 }),
              { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
            )
          } else {
            resolve({ lat: 37.7749, lng: -122.4194 })
          }
        })
        const wdRes = await fetch(`http://localhost:5000/api/weather/current?lat=${loc.lat}&lng=${loc.lng}`)
        const wd = await wdRes.json().catch(() => null)
        if (wd?.success) {
          if (wd?.data?.locationName) setResolvedLocationName(wd.data.locationName)
          const rec = await aiEventRecommendations({ weatherData: { current: wd.data }, date: selectedDate.toISOString() })
          const tips = rec?.data?.suitable_activities || []
          setAiTips(tips)
        } else {
          setAiTips([])
        }
      } catch {
        setAiTips([])
      }
    }
    
    load()
    loadAI()
  }, [selectedDate])

  const selectedDateEvents = useMemo(() => events.filter((event) => event.date.toDateString() === selectedDate.toDateString()), [events, selectedDate])

  const addEvent = async (event: Omit<Event, "id">) => {
    try {
      const payload = {
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        time: event.time,
        type: event.type,
        weather: event.weather,
      }
      const res = await createEvent(payload as any)
      const created = res?.data
      if (created) {
        setEvents([
          ...events,
          {
            id: created._id,
            title: created.title,
            date: new Date(created.date),
            time: created.time,
            type: created.type,
            weather: created.weather,
            description: created.description,
          },
        ])
      }
    } catch {}
  }

  const deleteEvent = async (eventId: string) => {
    try { await deleteEventById(eventId) } catch {}
    setEvents(events.filter((event) => event.id !== eventId))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-foreground mb-2"
        >
          Smart Planner
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg"
        >
          Plan your activities with weather-aware suggestions
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Calendar</h2>
              <Button onClick={() => setShowAddEvent(true)} className="rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
            <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} events={events} className="w-full" />
          </div>
        </motion.div>

        {/* Events & Suggestions Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Today's Events */}
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {selectedDate.toDateString() === new Date().toDateString()
                ? "Today's Events"
                : `Events for ${selectedDate.toLocaleDateString()}`}
            </h3>
            <div className="space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => <EventCard key={event.id} event={event} onDelete={deleteEvent} />)
              ) : (
                <p className="text-muted-foreground text-sm">No events scheduled for this day</p>
              )}
            </div>
          </div>

          {/* Weather Suggestions */}
        <div className="space-y-3">
          <WeatherSuggestions selectedDate={selectedDate} />
          {aiTips.length > 0 && (
            <div className="glass-strong rounded-2xl p-4">
              <div className="text-sm font-semibold mb-2">AI Suggestions</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {aiTips.map((t, i) => (<li key={i}>{t}</li>))}
              </ul>
            </div>
          )}
        </div>
        </motion.div>
      </div>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={showAddEvent}
        onOpenChange={setShowAddEvent}
        onAddEvent={addEvent}
        selectedDate={selectedDate}
      />
    </div>
  )
}
