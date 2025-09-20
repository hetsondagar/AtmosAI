"use client"

import { useEffect, useState } from "react"
import { WeatherCard } from "@/components/weather-card"
import { MetricCard } from "@/components/metric-card"
import { ForecastChart } from "@/components/forecast-chart"
import { HealthTip } from "@/components/health-tip"
import { Droplets, Wind, Sun, Eye, Gauge } from "lucide-react"

interface DashboardProps {
  onWeatherChange: (condition: "sunny" | "cloudy" | "rainy" | "clear") => void
}

export function Dashboard({ onWeatherChange }: DashboardProps) {
  const [currentWeather, setCurrentWeather] = useState({
    location: "San Francisco, CA",
    temperature: 72,
    condition: "sunny" as const,
    description: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    uvIndex: 6,
    aqi: 42,
    visibility: 10,
    pressure: 30.15,
  })

  const [streak, setStreak] = useState(3)

  useEffect(() => {
    onWeatherChange(currentWeather.condition)
  }, [currentWeather.condition, onWeatherChange])

  const metrics = [
    {
      label: "Humidity",
      value: `${currentWeather.humidity}%`,
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Wind Speed",
      value: `${currentWeather.windSpeed} mph`,
      icon: Wind,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "UV Index",
      value: currentWeather.uvIndex.toString(),
      icon: Sun,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Air Quality",
      value: currentWeather.aqi.toString(),
      icon: Eye,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Visibility",
      value: `${currentWeather.visibility} mi`,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Pressure",
      value: `${currentWeather.pressure}"`,
      icon: Gauge,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Weather Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2 text-balance">Welcome to AtmosAI</h1>
        <p className="text-lg text-muted-foreground text-pretty">Your intelligent weather companion and planner</p>
      </div>

      {/* Main Weather Card */}
      <div className="flex justify-center mb-8">
        <WeatherCard
          location={currentWeather.location}
          temperature={currentWeather.temperature}
          condition={currentWeather.condition}
          description={currentWeather.description}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            bgColor={metric.bgColor}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Forecast Chart */}
        <div className="lg:col-span-2">
          <ForecastChart />
        </div>

        {/* Health Tip & Gamification */}
        <div className="space-y-6">
          <HealthTip condition={currentWeather.condition} uvIndex={currentWeather.uvIndex} aqi={currentWeather.aqi} />

          {/* Streak Tracker */}
          <div className="glass-strong rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{streak}</div>
            <div className="text-sm text-muted-foreground">Days of outdoor activity streak!</div>
            <div className="mt-4 flex justify-center">
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < streak ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
