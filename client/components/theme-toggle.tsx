"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from "lucide-react"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "system", icon: Monitor, label: "System" },
  ]

  return (
    <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon
        const isActive = theme === themeOption.key

        return (
          <motion.div key={themeOption.key} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme(themeOption.key)}
              className="relative h-8 px-3"
            >
              <Icon className="h-4 w-4 mr-2" />
              {themeOption.label}
              {isActive && (
                <motion.div
                  layoutId="activeTheme"
                  className="absolute inset-0 bg-primary rounded-md -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}
