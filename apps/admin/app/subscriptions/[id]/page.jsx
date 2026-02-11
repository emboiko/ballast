"use client"

import AuthGuard from "@/components/auth/AuthGuard"
import SubscriptionDetailPage from "@/components/subscriptions/SubscriptionDetailPage"

export default function SubscriptionDetailPageRoute() {
  return (
    <AuthGuard>
      <SubscriptionDetailPage />
    </AuthGuard>
  )
}
