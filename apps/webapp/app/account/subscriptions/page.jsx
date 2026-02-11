"use client"

import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Account from "@/components/account"

export default function SubscriptionsPage() {
  return (
    <PageLayout>
      <AuthGuard>
        <Account section="subscriptions" />
      </AuthGuard>
    </PageLayout>
  )
}
