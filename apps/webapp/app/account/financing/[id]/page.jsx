"use client"

import { useParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Account from "@/components/account"

export default function FinancingDetailPage() {
  const params = useParams()
  const financingPlanId =
    params?.id && typeof params.id === "string" ? params.id : null

  return (
    <PageLayout>
      <AuthGuard>
        <Account section="financing" financingPlanId={financingPlanId} />
      </AuthGuard>
    </PageLayout>
  )
}
