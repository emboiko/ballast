"use client"

import { useParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Account from "@/components/account"

export default function SubscriptionDetailPage() {
  const params = useParams()
  const subscriptionId =
    params?.id && typeof params.id === "string" ? params.id : null

  return (
    <PageLayout>
      <AuthGuard>
        <Account section="subscriptions" subscriptionId={subscriptionId} />
      </AuthGuard>
    </PageLayout>
  )
}
