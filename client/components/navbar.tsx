"use client"

import { useEffect, useState } from "react"
import { Home, Calendar, AlertTriangle, Settings, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuthModal } from "@/components/auth-modal"
// Voice assistant removed

interface NavbarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Navbar({ currentPage, onPageChange }: NavbarProps) {
  // voice assistant state removed
  const [authOpen, setAuthOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [userInfo, setUserInfo] = useState<{ firstName?: string; lastName?: string } | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    const check = async () => {
      try { 
        const hasToken = !!localStorage.getItem('atmosai_token')
        setIsAuthed(hasToken)
        
        if (hasToken) {
          // Try to fetch user info
          try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('atmosai_token')}`,
                'Content-Type': 'application/json'
              }
            })
            if (response.ok) {
              const data = await response.json()
              setUserInfo(data.data?.user ? { 
                firstName: data.data.user.firstName, 
                lastName: data.data.user.lastName 
              } : null)
            }
          } catch (e) {
            // Token might be invalid, clear it
            localStorage.removeItem('atmosai_token')
            setIsAuthed(false)
            setUserInfo(null)
          }
        } else {
          setUserInfo(null)
        }
      } catch { 
        setIsAuthed(false)
        setUserInfo(null)
      }
    }
    check()
    const onStorage = (e: StorageEvent) => { if (e.key === 'atmosai_token') check() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    try { localStorage.removeItem('atmosai_token') } catch {}
    setIsAuthed(false)
    setUserInfo(null)
    // Reload to clear any authed state and refetch data
    window.location.reload()
  }

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "planner", icon: Calendar, label: "Planner" },
    { id: "alerts", icon: AlertTriangle, label: "Alerts" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  // voice assistant removed

  return (
    <>
      {/* Main Navigation */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60]">
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
            {/* Account/Auth Button */}
            {!isAuthed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAuthOpen(true)}
                type="button"
                aria-label="Login"
                title="Login to AtmosAI"
                className={cn(
                  "relative p-3 rounded-xl transition-all duration-200 hover:bg-white/20 text-foreground/70 hover:text-foreground",
                  "hover:scale-105 active:scale-95"
                )}
              >
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAccountOpen((v) => !v)}
                  type="button"
                  aria-label="Account Settings"
                  title={userInfo ? `Welcome, ${userInfo.firstName || 'User'}!` : "Account Settings"}
                  className={cn(
                    "relative p-3 rounded-xl transition-all duration-200 hover:bg-white/20 text-foreground/70 hover:text-foreground",
                    "hover:scale-105 active:scale-95"
                  )}
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
                  className={cn(
                    "relative p-3 rounded-xl transition-all duration-200 hover:bg-red-500/20 text-red-400 hover:text-red-300",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* voice assistant removed */}

      {/* Simple Account Menu */}
      {accountOpen && isAuthed && (
        <div className="fixed bottom-24 right-28 z-[80]" onClick={(e) => e.stopPropagation()}>
          <div className="glass-strong rounded-xl border border-white/20 shadow-2xl p-2 w-44">
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10"
              onClick={() => { setAccountOpen(false); onPageChange('settings') }}
            >
              Settings
            </button>
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-red-400"
              onClick={() => { setAccountOpen(false); handleLogout() }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} onAuthenticated={() => { window.location.reload() }} />
    </>
  )
}
