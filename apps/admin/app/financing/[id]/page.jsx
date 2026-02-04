"use client"

import AuthGuard from "@/components/auth/AuthGuard"
import FinancingDetailPage from "@/components/financing/FinancingDetailPage"

export default function FinancingDetailPageRoute() {
  return (
    <AuthGuard>
      <FinancingDetailPage />
    </AuthGuard>
  )
}
