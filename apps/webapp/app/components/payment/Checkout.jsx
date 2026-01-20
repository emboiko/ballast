"use client"

import { usePayment } from "@/contexts/PaymentContext"
import OrderSummary from "@/components/payment/OrderSummary"
import PaymentSection from "@/components/payment/PaymentSection"
import { Grid } from "@/components/ui/uiStyles"
import {
  CheckoutResult,
  CheckoutDismiss,
  CheckoutError,
} from "@/components/payment/paymentStyles"

function CheckoutErrorBanner() {
  const { checkoutResult, clearCheckoutResult } = usePayment()

  if (!checkoutResult?.error) {
    return null
  }

  return (
    <CheckoutResult $isSuccess={false}>
      <CheckoutError>{checkoutResult.error}</CheckoutError>
      <CheckoutDismiss onClick={clearCheckoutResult} aria-label="Dismiss">
        ×
      </CheckoutDismiss>
    </CheckoutResult>
  )
}

export default function Checkout() {
  return (
    <>
      <CheckoutErrorBanner />
      <Grid>
        <OrderSummary />
        <PaymentSection />
      </Grid>
    </>
  )
}
