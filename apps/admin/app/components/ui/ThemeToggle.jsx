"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import {
  NavIcon,
  ThemeToggleButton,
  NavLabel,
} from "@/components/ui/uiStyles"

export default function ThemeToggle({ isCollapsed }) {
  const { theme, toggleTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  let icon = "🌙"
  let ariaLabel = "Switch to dark mode"
  let label = "Dark"

  if (isMounted && theme === "dark") {
    icon = "☀️"
    ariaLabel = "Switch to light mode"
    label = "Light"
  }

  let title = ariaLabel
  if (!isMounted) {
    title = "Toggle theme"
  }

  return (
    <ThemeToggleButton
      onClick={toggleTheme}
      $isCollapsed={isCollapsed}
      aria-label={title}
      title={title}
    >
      {/* Naughty inline style usage here */}
      {/* This is a hack to ensure the icon is aligned with the label when the sidebar is collapsed */}
      {/* Todo: Remove this once we have proper UI elements (at least for the sidebar) */}
      <NavIcon style={{ marginRight: "4px" }}>{icon}</NavIcon>
      {!isCollapsed && (
        <NavLabel $isCollapsed={false}>&nbsp;{label || title}</NavLabel>
      )}
    </ThemeToggleButton>
  )
}
