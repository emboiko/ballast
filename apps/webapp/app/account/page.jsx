"use client"

import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Account from "@/components/account"

export default function AccountPage() {
  return (
    <PageLayout>
      <AuthGuard>
        <Account />
      </AuthGuard>
    </PageLayout>
  )
}
