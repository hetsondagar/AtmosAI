"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Alert } from "@/components/pages/alerts"

interface AlertFiltersProps {
  selectedFilter: "all" | Alert["type"]
  onFilterChange: (filter: "all" | Alert["type"]) => void
  alerts: Alert[]
}

export function AlertFilters({ selectedFilter, onFilterChange, alerts }: AlertFiltersProps) {
  const getFilterCount = (type: "all" | Alert["type"]) => {
    if (type === "all") return alerts.length
    return alerts.filter((alert) => alert.type === type).length
  }

  const getActiveCount = (type: "all" | Alert["type"]) => {
    if (type === "all") return alerts.filter((alert) => alert.isActive).length
    return alerts.filter((alert) => alert.type === type && alert.isActive).length
  }

  const filters: { key: "all" | Alert["type"]; label: string; color: string }[] = [
    { key: "all", label: "All Alerts", color: "bg-primary" },
    { key: "severe", label: "Severe", color: "bg-red-500" },
    { key: "moderate", label: "Moderate", color: "bg-orange-500" },
    { key: "info", label: "Info", color: "bg-blue-500" },
  ]

  return (
    <div className="glass-strong rounded-2xl p-6 border-2 border-cyan-100">
      <h3 className="text-lg font-semibold text-foreground mb-4">Filter Alerts</h3>
      <div className="flex flex-wrap gap-3">
        {filters.map((filter, index) => {
          const count = getFilterCount(filter.key)
          const activeCount = getActiveCount(filter.key)
          const isSelected = selectedFilter === filter.key

          return (
            <motion.div
              key={filter.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={isSelected ? "default" : "ghost"}
                onClick={() => onFilterChange(filter.key)}
                className={cn(
                  "relative h-auto p-4 flex-col items-start gap-2 min-w-[120px] hover:text-black cursor-pointer",
                  isSelected && "shadow-lg",
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={cn("w-3 h-3 rounded-full", filter.color)} />
                  <span className="font-medium">{filter.label}</span>
                </div>
                <div className="flex items-center gap-2 w-full text-xs">
                  <span className={cn(
                    "text-muted-foreground",
                    isSelected && "text-white dark:text-black"
                  )}>
                    Total: {count}
                  </span>
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 text-black">
                      {activeCount} active
                    </Badge>
                  )}
                </div>
              </Button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
