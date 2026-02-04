"use client"

import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Account from "@/components/account"

export default function FinancingPage() {
  return (
    <PageLayout>
      <AuthGuard>
        <Account section="financing" />
      </AuthGuard>
    </PageLayout>
  )
}
