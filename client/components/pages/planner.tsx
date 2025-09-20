"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar } from "@/components/calendar"
import { EventCard } from "@/components/event-card"
import { WeatherSuggestions } from "@/components/weather-suggestions"
import { AddEventDialog } from "@/components/add-event-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Morning Jog",
      date: new Date(),
      time: "7:00 AM",
      type: "outdoor",
      weather: "sunny",
      description: "30-minute run in the park",
    },
    {
      id: "2",
      title: "Team Meeting",
      date: new Date(),
      time: "10:00 AM",
      type: "indoor",
      weather: "any",
      description: "Weekly team sync",
    },
    {
      id: "3",
      title: "Picnic with Friends",
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: "2:00 PM",
      type: "outdoor",
      weather: "sunny",
      description: "Lunch at Golden Gate Park",
    },
  ])

  const selectedDateEvents = events.filter((event) => event.date.toDateString() === selectedDate.toDateString())

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
    }
    setEvents([...events, newEvent])
  }

  const deleteEvent = (eventId: string) => {
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
          <WeatherSuggestions selectedDate={selectedDate} />
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
