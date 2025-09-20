"use client"

import { motion } from "framer-motion"
import { Cloud, Sun, CloudRain } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  message?: string
}

export function LoadingSpinner({ size = "md", message = "Loading..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const containerSizes = {
    sm: "p-4",
    md: "p-8",
    lg: "p-12",
  }

  const icons = [Sun, Cloud, CloudRain]

  return (
    <div className={`flex flex-col items-center justify-center ${containerSizes[size]}`}>
      <div className="relative">
        {icons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: 360,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.6,
              ease: "easeInOut",
            }}
          >
            <Icon className={`${sizeClasses[size]} text-primary`} />
          </motion.div>
        ))}
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}
