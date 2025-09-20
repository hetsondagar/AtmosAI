"use client"

import { useState, Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { WeatherBackground } from "@/components/weather-background"
import { PageTransition } from "@/components/page-transition"
import { FloatingParticles } from "@/components/floating-particles"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Dashboard } from "@/components/pages/dashboard"
import { Planner } from "@/components/pages/planner"
import { Alerts } from "@/components/pages/alerts"
import { Settings } from "@/components/pages/settings"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [weatherCondition, setWeatherCondition] = useState<"sunny" | "cloudy" | "rainy" | "clear">("sunny")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onWeatherChange={setWeatherCondition} />
      case "planner":
        return <Planner />
      case "alerts":
        return <Alerts />
      case "settings":
        return <Settings />
      default:
        return <Dashboard onWeatherChange={setWeatherCondition} />
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WeatherBackground condition={weatherCondition} />
      <FloatingParticles />
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="pt-24 pb-24 px-4 relative z-10">
        <Suspense fallback={<LoadingSpinner size="lg" message="Loading AtmosAI..." />}>
          <PageTransition pageKey={currentPage}>{renderPage()}</PageTransition>
        </Suspense>
      </div>
    </main>
  )
}
