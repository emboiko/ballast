"use client"

import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Account from "@/components/account"

export default function SettingsPage() {
  return (
    <PageLayout>
      <AuthGuard>
        <Account section="settings" />
      </AuthGuard>
    </PageLayout>
  )
}
