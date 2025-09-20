"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, ComposedChart, AreaChart, Area } from "recharts"
import { Cloud, CloudRain, Sun, CloudSnow, Zap } from "lucide-react"

const hourlyData = [
	{ time: "1 AM", temp: 67, humidity: 72, precipitation: 0, windSpeed: 7, condition: "clear" },
	{ time: "2 AM", temp: 66, humidity: 74, precipitation: 0, windSpeed: 6, condition: "clear" },
	{ time: "3 AM", temp: 65, humidity: 75, precipitation: 5, windSpeed: 8, condition: "cloudy" },
	{ time: "4 AM", temp: 64, humidity: 77, precipitation: 0, windSpeed: 9, condition: "cloudy" },
	{ time: "5 AM", temp: 63, humidity: 79, precipitation: 0, windSpeed: 7, condition: "cloudy" },
	{ time: "6 AM", temp: 63, humidity: 80, precipitation: 10, windSpeed: 8, condition: "rainy" },
	{ time: "7 AM", temp: 65, humidity: 78, precipitation: 15, windSpeed: 10, condition: "rainy" },
	{ time: "8 AM", temp: 67, humidity: 75, precipitation: 8, windSpeed: 9, condition: "cloudy" },
	{ time: "9 AM", temp: 70, humidity: 65, precipitation: 0, windSpeed: 8, condition: "sunny" },
	{ time: "10 AM", temp: 73, humidity: 60, precipitation: 0, windSpeed: 7, condition: "sunny" },
	{ time: "11 AM", temp: 75, humidity: 58, precipitation: 0, windSpeed: 6, condition: "sunny" },
	{ time: "12 PM", temp: 77, humidity: 55, precipitation: 0, windSpeed: 8, condition: "sunny" },
	{ time: "1 PM", temp: 78, humidity: 53, precipitation: 0, windSpeed: 9, condition: "sunny" },
	{ time: "2 PM", temp: 79, humidity: 52, precipitation: 0, windSpeed: 10, condition: "sunny" },
	{ time: "3 PM", temp: 78, humidity: 50, precipitation: 0, windSpeed: 11, condition: "sunny" },
	{ time: "4 PM", temp: 77, humidity: 52, precipitation: 0, windSpeed: 10, condition: "sunny" },
	{ time: "5 PM", temp: 76, humidity: 55, precipitation: 0, windSpeed: 9, condition: "cloudy" },
	{ time: "6 PM", temp: 74, humidity: 60, precipitation: 0, windSpeed: 8, condition: "cloudy" },
	{ time: "7 PM", temp: 73, humidity: 62, precipitation: 0, windSpeed: 7, condition: "cloudy" },
	{ time: "8 PM", temp: 72, humidity: 65, precipitation: 0, windSpeed: 6, condition: "clear" },
	{ time: "9 PM", temp: 71, humidity: 67, precipitation: 0, windSpeed: 5, condition: "clear" },
	{ time: "10 PM", temp: 70, humidity: 68, precipitation: 0, windSpeed: 6, condition: "clear" },
	{ time: "11 PM", temp: 69, humidity: 70, precipitation: 0, windSpeed: 7, condition: "clear" },
]

const weeklyData = [
	{ day: "Mon", temp: 72, humidity: 65, precipitation: 20, windSpeed: 12, condition: "rainy", high: 75, low: 68 },
	{ day: "Tue", temp: 75, humidity: 60, precipitation: 5, windSpeed: 8, condition: "cloudy", high: 78, low: 70 },
	{ day: "Wed", temp: 73, humidity: 70, precipitation: 0, windSpeed: 6, condition: "sunny", high: 76, low: 69 },
	{ day: "Thu", temp: 78, humidity: 55, precipitation: 0, windSpeed: 9, condition: "sunny", high: 82, low: 73 },
	{ day: "Fri", temp: 80, humidity: 50, precipitation: 0, windSpeed: 7, condition: "sunny", high: 84, low: 75 },
	{ day: "Sat", temp: 77, humidity: 65, precipitation: 15, windSpeed: 11, condition: "cloudy", high: 80, low: 72 },
	{ day: "Sun", temp: 74, humidity: 70, precipitation: 30, windSpeed: 13, condition: "rainy", high: 77, low: 70 },
]

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

const CustomTooltip = ({ active, payload, label }: any) => {
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
							{entry.name === "Temperature" ? `${entry.value}°F` :
								entry.name === "Humidity" ? `${entry.value}%` :
									entry.name === "Precipitation" ? `${entry.value}%` :
										entry.name === "Wind Speed" ? `${entry.value} mph` :
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

	const data = activeTab === "hourly" ? hourlyData : weeklyData
	const xKey = activeTab === "hourly" ? "time" : "day"

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
					<Tooltip content={<CustomTooltip />} />
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
				<Tooltip content={<CustomTooltip />} />
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
			<Card className="glass-strong border-0 p-6">
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
								{activeMetric === "temperature" ? "°F" :
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
								{activeMetric === "temperature" ? "°F" :
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
								{activeMetric === "temperature" ? "°F" :
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
