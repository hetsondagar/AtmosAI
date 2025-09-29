"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, loadLocalSettings } from "@/lib/api"
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
    location: "Fetching location...",
    temperature: 72,
    condition: "sunny" as const,
    description: "",
    humidity: 0,
    windSpeed: 0,
    uvIndex: 0,
    aqi: 0,
    visibility: 0,
    pressure: 0,
  })

  const [streak, setStreak] = useState(3)
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial")
  const [tempUnit, setTempUnit] = useState<"°F" | "°C">("°F")
  const [windUnit, setWindUnit] = useState<"mph" | "km/h" | "m/s">("mph")
  const [pressureUnit, setPressureUnit] = useState<"inHg" | "hPa" | "mb">("inHg")

  useEffect(() => {
    onWeatherChange(currentWeather.condition)
  }, [currentWeather.condition, onWeatherChange])

  // Map OpenWeather main/description to our UI condition
  const mapCondition = (main?: string, description?: string): "sunny" | "cloudy" | "rainy" | "clear" => {
    const m = (main || "").toLowerCase()
    const d = (description || "").toLowerCase()
    if (m.includes("rain") || d.includes("rain") || m.includes("drizzle") || m.includes("thunder")) return "rainy"
    if (m.includes("cloud") || d.includes("cloud")) return "cloudy"
    if (m.includes("clear")) return "clear"
    return "sunny"
  }

  // Load user preferences (units)
  useEffect(() => {
    const init = async () => {
      try {
        const me = await getCurrentUser()
        const prefs = me?.data?.user?.preferences
        if (prefs?.temperatureUnit === "celsius") {
          setUnitSystem("metric"); setTempUnit("°C")
        }
        if (prefs?.windSpeedUnit === "kmh") setWindUnit("km/h")
        if (prefs?.windSpeedUnit === "ms") setWindUnit("m/s")
        if (prefs?.pressureUnit === "hPa") setPressureUnit("hPa")
        if (prefs?.pressureUnit === "mb") setPressureUnit("mb")
        return
      } catch {}
      const local = loadLocalSettings<any>("atmosai_settings", null)
      if (local) {
        if (local.temperatureUnit === "celsius") { setUnitSystem("metric"); setTempUnit("°C") }
        if (local.windSpeedUnit === "kmh") setWindUnit("km/h")
        if (local.windSpeedUnit === "ms") setWindUnit("m/s")
        if (local.pressureUnit === "hPa") setPressureUnit("hPa")
        if (local.pressureUnit === "mb") setPressureUnit("mb")
      }
    }
    init()
  }, [])

  // React to unitSystem changes (e.g., after saving Settings and refocusing tab)
  useEffect(() => {
    setTempUnit(unitSystem === "metric" ? "°C" : "°F")
    if (unitSystem === "metric") {
      // Default to km/h + hPa when metric unless overridden by saved prefs
      setWindUnit((prev) => (prev === "mph" ? "km/h" : prev))
      setPressureUnit((prev) => (prev === "inHg" ? "hPa" : prev))
    }
  }, [unitSystem])

  // Refresh units on window focus (to pick up changes saved in Settings)
  useEffect(() => {
    const onFocus = () => {
      try {
        const local = loadLocalSettings<any>("atmosai_settings", null)
        if (local) {
          setUnitSystem(local.temperatureUnit === "celsius" ? "metric" : "imperial")
          if (local.windSpeedUnit === "kmh") setWindUnit("km/h")
          else if (local.windSpeedUnit === "ms") setWindUnit("m/s")
          else setWindUnit("mph")
          if (local.pressureUnit === "hPa") setPressureUnit("hPa")
          else if (local.pressureUnit === "mb") setPressureUnit("mb")
          else setPressureUnit("inHg")
        }
      } catch {}
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  // Fetch weather using browser geolocation
  useEffect(() => {
    const fetchWeather = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`http://localhost:5000/api/weather/current?lat=${lat}&lng=${lng}&units=${unitSystem}`)
        const json = await res.json()
        if (json?.success && json?.data) {
          const data = json.data
          const cond = mapCondition(data?.condition?.main, data?.condition?.description)
          // Convert values for display per selected units
          const temp = Math.round(data?.temperature ?? 72)
          let wind = Math.round(data?.windSpeed ?? 0)
          // OpenWeather returns m/s for metric; convert to km/h if needed
          if (unitSystem === "metric" && windUnit === "km/h") {
            wind = Math.round((data?.windSpeed ?? 0) * 3.6)
          }
          const pressureHpa = data?.pressure ?? 0
          const pressureInHg = Math.round((pressureHpa * 0.02953) * 100) / 100

          setCurrentWeather({
            location: data?.locationName || `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
            temperature: unitSystem === "metric" ? temp : temp, // backend respects units
            condition: cond,
            description: data?.condition?.description ?? "",
            humidity: data?.humidity ?? 0,
            windSpeed: wind,
            uvIndex: Math.round(data?.uvIndex ?? 0),
            aqi: data?.airQuality?.aqi ?? 0,
            // backend visibility is in km; show km for metric, miles for imperial
            visibility: unitSystem === "metric" ? Math.round(data?.visibility ?? 0) : Math.round(((data?.visibility ?? 0) * 0.621371)),
            pressure: pressureUnit === "inHg" ? pressureInHg : pressureHpa,
          })
        }
      } catch (e) {
        // Silent fail; keep defaults
      }
    }

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          fetchWeather(latitude, longitude)
        },
        () => {
          // Fallback: San Francisco coords
          fetchWeather(37.7749, -122.4194)
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      )
    } else {
      // Geolocation not available, fallback
      fetchWeather(37.7749, -122.4194)
    }
  }, [unitSystem, pressureUnit])

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
      value: `${currentWeather.windSpeed} ${windUnit}`,
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
      value: `${currentWeather.visibility} ${unitSystem === "metric" ? "km" : "mi"}`,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Pressure",
      value: pressureUnit === "inHg" ? `${currentWeather.pressure}"` : `${currentWeather.pressure} ${pressureUnit}`,
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
          unit={tempUnit}
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
