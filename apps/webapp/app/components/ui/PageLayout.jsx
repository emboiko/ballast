"use client"

import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"
import AuthModal from "@/components/auth/AuthModal"
import DevThemeToggle from "@/components/ui/DevThemeToggle"
import { AppLayout, Main } from "@/components/ui/uiStyles"

export default function PageLayout({ children, isFullWidth = false }) {
  return (
    <AppLayout>
      <Header />
      <Main $isFullWidth={isFullWidth}>{children}</Main>
      <Footer />
      <AuthModal />
      <DevThemeToggle />
    </AppLayout>
  )
}
