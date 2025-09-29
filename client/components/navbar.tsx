"use client"

import { useEffect, useState } from "react"
import { Home, Calendar, AlertTriangle, Settings, Mic, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuthModal } from "@/components/auth-modal"

interface NavbarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Navbar({ currentPage, onPageChange }: NavbarProps) {
  const [isListening, setIsListening] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const check = () => {
      try { setIsAuthed(!!localStorage.getItem('atmosai_token')) } catch { setIsAuthed(false) }
    }
    check()
    const onStorage = (e: StorageEvent) => { if (e.key === 'atmosai_token') check() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    try { localStorage.removeItem('atmosai_token') } catch {}
    setIsAuthed(false)
    // Reload to clear any authed state and refetch data
    window.location.reload()
  }

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "planner", icon: Calendar, label: "Planner" },
    { id: "alerts", icon: AlertTriangle, label: "Alerts" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  const handleVoiceAssistant = () => {
    setIsListening(!isListening)
    // Voice assistant logic would go here
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(item.id)}
                  type="button"
                  aria-label={item.label}
                  title={item.label}
                  className={cn(
                    "relative p-3 rounded-xl transition-all duration-200",
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-white/20 text-foreground/70 hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              )
            })}
            {!isAuthed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAuthOpen(true)}
                type="button"
                aria-label="Login"
                title="Login"
                className={cn("relative p-3 rounded-xl transition-all duration-200 hover:bg-white/20 text-foreground/70 hover:text-foreground")}
              >
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange('settings')}
                  type="button"
                  aria-label="Account"
                  title="Account"
                  className={cn("relative p-3 rounded-xl transition-all duration-200 hover:bg-white/20 text-foreground/70 hover:text-foreground")}
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  type="button"
                  aria-label="Logout"
                  title="Logout"
                  className={cn("relative p-3 rounded-xl transition-all duration-200 hover:bg-white/20 text-foreground/70 hover:text-foreground")}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Voice Assistant Button */}
      <Button
        onClick={handleVoiceAssistant}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 mb-20",
          isListening ? "bg-secondary hover:bg-secondary/90 animate-pulse" : "bg-primary hover:bg-primary/90",
        )}
      >
        <Mic className={cn("h-6 w-6", isListening && "animate-pulse")} />
        <span className="sr-only">Voice Assistant</span>
      </Button>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} onAuthenticated={() => { window.location.reload() }} />
    </>
  )
}
