"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Event } from "@/components/pages/planner"

interface CalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  events: Event[]
  className?: string
}

export function Calendar({ selectedDate, onDateSelect, events, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const today = new Date()
  const maxPredictionDate = new Date()
  maxPredictionDate.setDate(today.getDate() + 14)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    if (newMonth.getMonth() >= today.getMonth() && newMonth.getFullYear() >= today.getFullYear()) {
      setCurrentMonth(newMonth)
    }
  }

  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    if (newMonth <= new Date(maxPredictionDate.getFullYear(), maxPredictionDate.getMonth() + 1, 0)) {
      setCurrentMonth(newMonth)
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => event.date.toDateString() === date.toDateString())
  }

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = date.toDateString() === selectedDate.toDateString()
      const isPast = date < today && !isToday
      const isBeyondPrediction = date > maxPredictionDate
      const isDisabled = isPast || isBeyondPrediction
      const dayEvents = getEventsForDate(date)

      days.push(
        <motion.button
          key={day}
          whileHover={!isDisabled ? { scale: 1.05 } : {}}
          whileTap={!isDisabled ? { scale: 0.95 } : {}}
          onClick={() => !isDisabled && onDateSelect(date)}
          disabled={isDisabled}
          className={cn(
            "h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 relative",
            isSelected && !isDisabled
              ? "bg-primary text-primary-foreground shadow-md"
              : isToday && !isDisabled
                ? "bg-secondary text-secondary-foreground"
                : isDisabled
                  ? "text-muted-foreground cursor-not-allowed opacity-40"
                  : "hover:bg-muted text-foreground",
          )}
        >
          {day}
          {dayEvents.length > 0 && !isDisabled && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {dayEvents.slice(0, 3).map((_, index) => (
                <div key={index} className="w-1 h-1 bg-current rounded-full opacity-60" />
              ))}
            </div>
          )}
        </motion.button>,
      )
    }

    return days
  }

  const canGoPrevious = currentMonth.getMonth() > today.getMonth() || currentMonth.getFullYear() > today.getFullYear()
  const canGoNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) <= new Date(maxPredictionDate.getFullYear(), maxPredictionDate.getMonth() + 1, 0)

  return (
    <div className={className}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={previousMonth} 
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={nextMonth} 
            disabled={!canGoNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
      
      {/* Weather prediction notice */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Weather predictions available for the next 14 days
      </div>
    </div>
  )
}
