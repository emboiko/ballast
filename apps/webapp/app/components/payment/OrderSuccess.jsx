"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePayment } from "@/contexts/PaymentContext"
import {
  OrderSuccessContainer,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  OrderIdDisplay,
  OrderIdLabel,
  OrderIdValue,
  SuccessActions,
  SuccessButton,
  SuccessButtonSecondary,
} from "@/components/payment/paymentStyles"

export default function OrderSuccess() {
  const router = useRouter()
  const { checkoutResult } = usePayment()

  // Redirect to cart if no success result (direct navigation or page refresh)
  useEffect(() => {
    if (!checkoutResult?.success) {
      router.replace("/cart")
    }
  }, [checkoutResult, router])

  // Don't render until we've confirmed there's a success result
  if (!checkoutResult?.success) {
    return null
  }

  return (
    <OrderSuccessContainer>
      <SuccessIcon>✓</SuccessIcon>
      <SuccessTitle>Payment Successful!</SuccessTitle>
      <SuccessMessage>
        Thank you for your order. Your payment has been processed successfully.
      </SuccessMessage>
      {checkoutResult.orderId && (
        <OrderIdDisplay>
          <OrderIdLabel>Order ID:</OrderIdLabel>
          <OrderIdValue
            as={Link}
            href={`/account/orders/${checkoutResult.orderId}`}
          >
            {checkoutResult.orderId}
          </OrderIdValue>
        </OrderIdDisplay>
      )}
      <SuccessActions>
        {checkoutResult.orderId && (
          <SuccessButton
            as={Link}
            href={`/account/orders/${checkoutResult.orderId}`}
          >
            View Order Details
          </SuccessButton>
        )}
        <SuccessButtonSecondary as={Link} href="/products">
          Continue Shopping
        </SuccessButtonSecondary>
      </SuccessActions>
    </OrderSuccessContainer>
  )
}
