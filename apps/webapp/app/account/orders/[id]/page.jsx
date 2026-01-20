"use client"

import { use } from "react"
import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Account from "@/components/account"

export default function OrderDetailPage({ params }) {
  const { id } = use(params)

  return (
    <PageLayout>
      <AuthGuard>
        <Account section="orders" orderId={id} />
      </AuthGuard>
    </PageLayout>
  )
}
