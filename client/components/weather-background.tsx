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
        return "bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-300"
      case "cloudy":
        return "bg-gradient-to-br from-gray-300 via-slate-200 to-gray-400"
      case "rainy":
        return "bg-gradient-to-br from-blue-300 via-cyan-200 to-blue-400"
      default:
        return "bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100"
    }
  }

  const getAnimationElements = () => {
    switch (condition) {
      case "sunny":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300/30 rounded-full animate-pulse" />
            <div
              className="absolute top-20 right-20 w-24 h-24 bg-orange-300/20 rounded-full animate-bounce"
              style={{ animationDelay: "1s" }}
            />
          </div>
        )
      case "cloudy":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-16 left-10 w-40 h-20 bg-white/40 rounded-full animate-float" />
            <div
              className="absolute top-32 right-16 w-32 h-16 bg-white/30 rounded-full animate-float"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute top-48 left-32 w-28 h-14 bg-white/35 rounded-full animate-float"
              style={{ animationDelay: "4s" }}
            />
          </div>
        )
      case "rainy":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-8 bg-blue-400/60 animate-rain"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`fixed inset-0 -z-10 transition-all duration-1000 ${getBackgroundStyle()} ${className}`}>
      {getAnimationElements()}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          33% { transform: translateX(10px) translateY(-10px); }
          66% { transform: translateX(-5px) translateY(5px); }
        }
        @keyframes rain {
          0% { transform: translateY(-100vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-rain {
          animation: rain 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
