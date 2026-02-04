"use client"

import AuthGuard from "@/components/auth/AuthGuard"
import FinancingPage from "@/components/financing/FinancingPage"

export default function FinancingPageRoute() {
  return (
    <AuthGuard>
      <FinancingPage />
    </AuthGuard>
  )
}
