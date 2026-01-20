"use client"

import { useState, useEffect } from "react"
import { IS_DEVELOPMENT } from "@/constants.js"
import { useTheme } from "@/contexts/ThemeContext"
import { DevThemeToggleContainer } from "@/components/ui/uiStyles"

export default function DevThemeToggle() {
  if (!IS_DEVELOPMENT) {
    return null
  }

  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DevThemeToggleContainer
      onClick={toggleTheme}
      aria-label="Toggle theme (dev)"
      title="Toggle theme (dev)"
    >
      {mounted ? (theme === "dark" ? "☀️" : "🌙") : "🌙"}
    </DevThemeToggleContainer>
  )
}
