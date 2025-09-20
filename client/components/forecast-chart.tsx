"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const hourlyData = [
  { time: "12 AM", temp: 68, humidity: 70 },
  { time: "3 AM", temp: 65, humidity: 75 },
  { time: "6 AM", temp: 63, humidity: 80 },
  { time: "9 AM", temp: 70, humidity: 65 },
  { time: "12 PM", temp: 75, humidity: 55 },
  { time: "3 PM", temp: 78, humidity: 50 },
  { time: "6 PM", temp: 76, humidity: 60 },
  { time: "9 PM", temp: 72, humidity: 65 },
]

const weeklyData = [
  { day: "Mon", temp: 72, humidity: 65 },
  { day: "Tue", temp: 75, humidity: 60 },
  { day: "Wed", temp: 73, humidity: 70 },
  { day: "Thu", temp: 78, humidity: 55 },
  { day: "Fri", temp: 80, humidity: 50 },
  { day: "Sat", temp: 77, humidity: 65 },
  { day: "Sun", temp: 74, humidity: 70 },
]

export function ForecastChart() {
  const [activeTab, setActiveTab] = useState<"hourly" | "weekly">("hourly")

  const data = activeTab === "hourly" ? hourlyData : weeklyData
  const xKey = activeTab === "hourly" ? "time" : "day"

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
      <Card className="glass-strong border-0 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Weather Forecast</h3>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "hourly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("hourly")}
              className="rounded-lg"
            >
              Hourly
            </Button>
            <Button
              variant={activeTab === "weekly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("weekly")}
              className="rounded-lg"
            >
              7-Day
            </Button>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor" }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
}
