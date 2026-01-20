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
      if (stored) {
        return stored
      }
      if (prefersDark) {
        return "dark"
      }
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
    let newTheme = "light"
    if (theme === "light") {
      newTheme = "dark"
    }

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
