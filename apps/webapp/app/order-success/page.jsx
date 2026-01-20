"use client"

import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import OrderSuccess from "@/components/payment/OrderSuccess"

export default function OrderSuccessPage() {
  return (
    <PageLayout>
      <AuthGuard>
        <OrderSuccess />
      </AuthGuard>
    </PageLayout>
  )
}
