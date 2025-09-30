"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, ComposedChart, AreaChart, Area } from "recharts"
import { Cloud, CloudRain, Sun, CloudSnow, Zap } from "lucide-react"
import { API_BASE_URL, getCurrentUser, loadLocalSettings } from "@/lib/api"
import { getCurrentLocation, type LocationData } from "@/lib/location"

// dynamic data loaded from backend
type HourPoint = { time: string, temp: number, humidity: number, precipitation: number, windSpeed: number, condition: string }
type DayPoint = { day: string, temp: number, humidity: number, precipitation: number, windSpeed: number, condition: string, high: number, low: number }

const getWeatherIcon = (condition: string) => {
	switch (condition) {
		case "sunny":
			return <Sun className="h-4 w-4 text-yellow-500" />
		case "cloudy":
			return <Cloud className="h-4 w-4 text-gray-500" />
		case "rainy":
			return <CloudRain className="h-4 w-4 text-blue-500" />
		case "snow":
			return <CloudSnow className="h-4 w-4 text-blue-200" />
		case "storm":
			return <Zap className="h-4 w-4 text-purple-500" />
		default:
			return <Sun className="h-4 w-4 text-yellow-500" />
	}
}

const CustomTooltip = ({ active, payload, label, unitLabels }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload
		return (
			<div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
				<div className="flex items-center gap-2 mb-2">
					{getWeatherIcon(data.condition)}
					<span className="font-medium">{label}</span>
				</div>
				{payload.map((entry: any, index: number) => (
					<div key={index} className="flex items-center gap-2 text-sm">
						<div
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-muted-foreground">{entry.name}:</span>
						<span className="font-medium">
							{entry.name === "Temperature" ? `${entry.value}${unitLabels.temp}` :
								entry.name === "Humidity" ? `${entry.value}%` :
									entry.name === "Precipitation" ? `${entry.value}%` :
										entry.name === "Wind Speed" ? `${entry.value} ${unitLabels.wind}` :
											entry.value}
						</span>
					</div>
				))}
			</div>
		)
	}
	return null
}

export function ForecastChart() {
	const [activeTab, setActiveTab] = useState<"hourly" | "weekly">("hourly")
	const [activeMetric, setActiveMetric] = useState<"temperature" | "humidity" | "precipitation" | "wind">("temperature")
	const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial")
	const unitLabels = useMemo(() => ({ temp: unitSystem === "metric" ? "°C" : "°F", wind: unitSystem === "metric" ? "km/h" : "mph" }), [unitSystem])
	const [hourlyData, setHourlyData] = useState<HourPoint[]>([])
	const [weeklyData, setWeeklyData] = useState<DayPoint[]>([])
	const [locationData, setLocationData] = useState<LocationData | null>(null)

	const data = activeTab === "hourly" ? hourlyData : weeklyData
	const xKey = activeTab === "hourly" ? "time" : "day"

	// Load units from preferences/local storage
	useEffect(() => {
		const initUnits = async () => {
			try {
				const me = await getCurrentUser()
				const prefs = me?.data?.user?.preferences
				if (prefs?.temperatureUnit === "celsius") setUnitSystem("metric")
			} catch {}
			const local = loadLocalSettings<any>("atmosai_settings", null)
			if (local && local.temperatureUnit === "celsius") setUnitSystem("metric")
		}
		initUnits()
	}, [])

  // React to settings changes immediately
  useEffect(() => {
    const onSettingsUpdated = () => {
      const local = loadLocalSettings<any>("atmosai_settings", null)
      if (local) setUnitSystem(local.temperatureUnit === "celsius" ? "metric" : "imperial")
    }
    window.addEventListener('settings-updated', onSettingsUpdated as any)
    return () => window.removeEventListener('settings-updated', onSettingsUpdated as any)
  }, [])

	// Initialize location
	useEffect(() => {
		const initializeLocation = async () => {
			try {
				const settings = loadLocalSettings<any>("atmosai_settings", null)
				const locationSettings = {
					autoLocation: settings?.autoLocation ?? true,
					defaultLocation: settings?.defaultLocation ?? "San Francisco, CA",
					coordinates: settings?.coordinates
				}
				const location = await getCurrentLocation(locationSettings)
				setLocationData(location)
			} catch (error) {
				console.warn('Location initialization failed:', error)
			}
		}
		initializeLocation()
	}, [])

	// Fetch hourly and daily forecast
	useEffect(() => {
		const fetchAll = async (lat: number, lng: number) => {
			try {
				const [hourRes, dayRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/weather/hourly?lat=${lat}&lng=${lng}&hours=24&units=${unitSystem}`),
                    fetch(`${API_BASE_URL}/api/weather/forecast?lat=${lat}&lng=${lng}&days=7&units=${unitSystem}`),
				])

				let hourJson: any = null
				if (hourRes.ok) {
					try { hourJson = await hourRes.json() } catch { hourJson = null }
				}
				if (hourJson?.success && Array.isArray(hourJson.data)) {
        const h: HourPoint[] = hourJson.data.map((p: any) => {
            // Temperature with unit safety correction
            let t = Math.round(p.temperature ?? 0)
            if (unitSystem === "metric" && t > 60) t = Math.round((t - 32) * 5 / 9)
            if (unitSystem === "imperial" && t < 45) t = Math.round((t * 9) / 5 + 32)

            // Wind speed as-is; labels will reflect units. If your backend returns m/s for metric
            // and you want km/h, convert here instead.
            let w = Math.round(p.windSpeed ?? 0)
            if (unitSystem === "metric") {
                // Convert m/s -> km/h if values look like m/s (heuristic: small numbers)
                if (w <= 30) w = Math.round(w * 3.6)
            }

            return {
                time: new Date(p.time).toLocaleTimeString([], { hour: 'numeric' }),
                temp: t,
                humidity: p.humidity ?? 0,
                precipitation: Math.round(p.precipitation?.probability ?? 0),
                windSpeed: w,
                condition: (p.condition?.main || '').toLowerCase(),
            }
        })
					setHourlyData(h)
				} else {
					setHourlyData([])
				}

				let dayJson: any = null
				if (dayRes.ok) {
					try { dayJson = await dayRes.json() } catch { dayJson = null }
				}
				if (dayJson?.success && Array.isArray(dayJson.data)) {
        const d: DayPoint[] = dayJson.data.map((p: any) => {
            let td = Math.round(p.temperature?.day ?? p.temperature?.max ?? 0)
            let th = Math.round(p.temperature?.max ?? 0)
            let tl = Math.round(p.temperature?.min ?? 0)
            if (unitSystem === "metric") {
                if (td > 60) td = Math.round((td - 32) * 5 / 9)
                if (th > 60) th = Math.round((th - 32) * 5 / 9)
                if (tl > 60) tl = Math.round((tl - 32) * 5 / 9)
            } else {
                if (td < 45) td = Math.round((td * 9) / 5 + 32)
                if (th < 45) th = Math.round((th * 9) / 5 + 32)
                if (tl < 45) tl = Math.round((tl * 9) / 5 + 32)
            }

            let w = Math.round(p.windSpeed ?? 0)
            if (unitSystem === "metric") {
                if (w <= 30) w = Math.round(w * 3.6)
            }

            return {
                day: new Date(p.date).toLocaleDateString([], { weekday: 'short' }),
                temp: td,
                high: th,
                low: tl,
                humidity: p.humidity ?? 0,
                precipitation: Math.round(p.precipitation?.probability ?? 0),
                windSpeed: w,
                condition: (p.condition?.main || '').toLowerCase(),
            }
        })
					setWeeklyData(d)
				} else {
					setWeeklyData([])
				}
			} catch {
				setHourlyData([])
				setWeeklyData([])
			}
		}

		if (locationData) {
			fetchAll(locationData.lat, locationData.lng)
		}
	}, [locationData, unitSystem])

	const getChartContent = () => {
		if (activeMetric === "temperature") {
			return (
				<ComposedChart data={data}>
					<XAxis
						dataKey={xKey}
						axisLine={false}
						tickLine={false}
						tick={{ fontSize: 12, fill: "currentColor" }}
						interval={activeTab === "hourly" ? 2 : 0}
					/>
					<YAxis hide />
					<Tooltip content={<CustomTooltip unitLabels={unitLabels} />} />
					<Legend />
					{activeTab === "weekly" ? (
						<>
							<Bar dataKey="high" fill="#06b6d4" name="High" radius={[2, 2, 0, 0]} />
							<Bar dataKey="low" fill="#22d3ee" name="Low" radius={[0, 0, 2, 2]} />
						</>
					) : (
						<Area
							type="monotone"
							dataKey="temp"
							stroke="#06b6d4"
							fill="#06b6d4"
							fillOpacity={0.3}
							strokeWidth={3}
							dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2 }}
							name="Temperature"
						/>
					)}
				</ComposedChart>
			)
		}

		return (
			<AreaChart data={data}>
				<XAxis
					dataKey={xKey}
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: "currentColor" }}
					interval={activeTab === "hourly" ? 2 : 0}
				/>
				<YAxis hide />
				<Tooltip content={<CustomTooltip unitLabels={unitLabels} />} />
				<Legend />
				{activeMetric === "humidity" && (
					<Area
						type="monotone"
						dataKey="humidity"
						stroke="#06b6d4"
						fill="#06b6d4"
						fillOpacity={0.3}
						strokeWidth={3}
						dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
						name="Humidity"
					/>
				)}
				{activeMetric === "precipitation" && (
					<Area
						type="monotone"
						dataKey="precipitation"
						stroke="#06b6d4"
						fill="#06b6d4"
						fillOpacity={0.3}
						strokeWidth={3}
						dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
						name="Precipitation"
					/>
				)}
				{activeMetric === "wind" && (
					<Area
						type="monotone"
						dataKey="windSpeed"
						stroke="#06b6d4"
						fill="#06b6d4"
						fillOpacity={0.3}
						strokeWidth={3}
						dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
						name="Wind Speed"
					/>
				)}
			</AreaChart>
		)
	}

	return (
		<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
			<Card className="glass-strong p-6 border-1">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
					<h3 className="text-xl font-semibold text-foreground">Weather Forecast</h3>
					<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
						<div className="flex gap-2">
							<Button
								variant={activeTab === "hourly" ? "default" : "ghost"}
								size="sm"
								onClick={() => setActiveTab("hourly")}
								className="rounded-lg flex-1 sm:flex-none"
							>
								Hourly
							</Button>
							<Button
								variant={activeTab === "weekly" ? "default" : "ghost"}
								size="sm"
								onClick={() => setActiveTab("weekly")}
								className="rounded-lg flex-1 sm:flex-none"
							>
								7 Days
							</Button>
						</div>
					</div>
				</div>

				{/* Metric Selection */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
					<Button
						variant={activeMetric === "temperature" ? "default" : "outline"}
						size="sm"
						onClick={() => setActiveMetric("temperature")}
						className="text-xs hover:text-cyan-500"
					>
						Temperature
					</Button>
					<Button
						variant={activeMetric === "humidity" ? "default" : "outline"}
						size="sm"
						onClick={() => setActiveMetric("humidity")}
						className="text-xs hover:text-cyan-500"
					>
						Humidity
					</Button>
					<Button
						variant={activeMetric === "precipitation" ? "default" : "outline"}
						size="sm"
						onClick={() => setActiveMetric("precipitation")}
						className="text-xs hover:text-cyan-500"
					>
						Precipitation
					</Button>
					<Button
						variant={activeMetric === "wind" ? "default" : "outline"}
						size="sm"
						onClick={() => setActiveMetric("wind")}
						className="text-xs hover:text-cyan-500"
					>
						Wind
					</Button>
				</div>

				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						{getChartContent()}
					</ResponsiveContainer>
				</div>

				{/* Summary Stats */}
				<div className="flex justify-center mt-6 pt-6 border-t border-border">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl w-full">
						<div className="text-center">
							<div className="text-2xl font-bold text-cyan-500">
								{Math.max(...data.map(d => activeMetric === "temperature" ? 
									('high' in d ? d.high : d.temp) :
									activeMetric === "humidity" ? d.humidity :
										activeMetric === "precipitation" ? d.precipitation :
											d.windSpeed))}
						{activeMetric === "temperature" ? unitLabels.temp :
									activeMetric === "humidity" ? "%" :
										activeMetric === "precipitation" ? "%" : " mph"}
							</div>
							<div className="text-xs text-muted-foreground uppercase tracking-wider">Max {activeMetric}</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-cyan-500">
								{Math.min(...data.map(d => activeMetric === "temperature" ? 
									('low' in d ? d.low : d.temp) :
									activeMetric === "humidity" ? d.humidity :
										activeMetric === "precipitation" ? d.precipitation :
											d.windSpeed))}
						{activeMetric === "temperature" ? unitLabels.temp :
									activeMetric === "humidity" ? "%" :
										activeMetric === "precipitation" ? "%" : " mph"}
							</div>
							<div className="text-xs text-muted-foreground uppercase tracking-wider">Min {activeMetric}</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-cyan-500">
								{Math.round(data.reduce((acc, d) => acc + (activeMetric === "temperature" ? d.temp :
									activeMetric === "humidity" ? d.humidity :
										activeMetric === "precipitation" ? d.precipitation :
											d.windSpeed), 0) / data.length)}
						{activeMetric === "temperature" ? unitLabels.temp :
									activeMetric === "humidity" ? "%" :
										activeMetric === "precipitation" ? "%" : " mph"}
							</div>
							<div className="text-xs text-muted-foreground uppercase tracking-wider">Avg {activeMetric}</div>
						</div>
					</div>
				</div>
			</Card>
		</motion.div>
	)
}
