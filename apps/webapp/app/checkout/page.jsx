"use client"

import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Checkout from "@/components/payment/Checkout"

export default function CheckoutPage() {
  return (
    <PageLayout>
      <AuthGuard>
        <Checkout />
      </AuthGuard>
    </PageLayout>
  )
}
