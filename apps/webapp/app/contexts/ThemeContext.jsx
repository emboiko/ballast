"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme")
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches
      return stored || (prefersDark ? "dark" : "light")
    }
    return "light"
  }

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.getAttribute("data-theme") || getInitialTheme()
      )
    }
    return "light"
  })

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    if (currentTheme && currentTheme !== theme) {
      setTheme(currentTheme)
    }
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
