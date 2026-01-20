"use client"

import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Cart from "@/components/payment/Cart"

export default function CartPage() {
  return (
    <PageLayout>
      <AuthGuard>
        <Cart />
      </AuthGuard>
    </PageLayout>
  )
}
