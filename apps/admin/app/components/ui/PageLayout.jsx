"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/ui/Sidebar"
import Header from "@/components/ui/Header"
import { SIDEBAR_STATE_KEY } from "@/constants"
import { LayoutContainer, Main, Content } from "@/components/ui/uiStyles"

export default function PageLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STATE_KEY)
    if (stored !== null) {
      setIsCollapsed(stored === "true")
    }
    setIsHydrated(true)
  }, [])

  const handleToggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem(SIDEBAR_STATE_KEY, String(newState))
  }

  if (!isHydrated) {
    return null
  }

  return (
    <LayoutContainer>
      <Sidebar isCollapsed={isCollapsed} />
      <Main>
        <Header onToggleSidebar={handleToggleSidebar} isCollapsed={isCollapsed} />
        <Content>{children}</Content>
      </Main>
    </LayoutContainer>
  )
}
