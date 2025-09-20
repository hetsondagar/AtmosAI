"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  color: string
  bgColor: string
  delay?: number
}

export function MetricCard({ label, value, icon: Icon, color, bgColor, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      className="glass rounded-xl p-4 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}
