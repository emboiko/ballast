"use client"

import AuthGuard from "@/components/auth/AuthGuard"
import SubscriptionsPage from "@/components/subscriptions/SubscriptionsPage"

export default function SubscriptionsPageRoute() {
  return (
    <AuthGuard>
      <SubscriptionsPage />
    </AuthGuard>
  )
}

