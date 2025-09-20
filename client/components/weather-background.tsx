"use client"

import { useEffect, useState } from "react"

interface WeatherBackgroundProps {
  condition: "sunny" | "cloudy" | "rainy" | "clear"
  className?: string
}

export function WeatherBackground({ condition, className = "" }: WeatherBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getBackgroundStyle = () => {
    switch (condition) {
      case "sunny":
        return "bg-[#EDFCFC] dark:bg-[#0f172a]"
      case "cloudy":
        return "bg-[#EDFCFC] dark:bg-[#0f172a]"
      case "rainy":
        return "bg-[#EDFCFC] dark:bg-[#0f172a]"
      default:
        return "bg-[#EDFCFC] dark:bg-[#0f172a]"
    }
  }


  return (
    <div className={`fixed inset-0 -z-10 transition-all duration-1000 ${getBackgroundStyle()} ${className}`}>
    </div>
  )
}
