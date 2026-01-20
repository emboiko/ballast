"use client"

import { PAYMENT_PROCESSOR } from "@/constants.js"
import StripeForm from "@/components/payment/paymentForms/StripeForm"
import BraintreeForm from "@/components/payment/paymentForms/BraintreeForm"
import SquareForm from "@/components/payment/paymentForms/SquareForm"
import AuthorizeForm from "@/components/payment/paymentForms/AuthorizeForm"
import { Card, ErrorText } from "@/components/ui/uiStyles"

const getPaymentProcessor = () => {
  return PAYMENT_PROCESSOR || ""
}

export default function PaymentForm() {
  const processor = getPaymentProcessor()

  if (processor === "stripe") {
    return <StripeForm />
  }

  if (processor === "braintree") {
    return <BraintreeForm />
  }

  if (processor === "square") {
    return <SquareForm />
  }

  if (processor === "authorize") {
    return <AuthorizeForm />
  }

  return (
    <Card>
      <ErrorText>
        Invalid payment processor: {processor || "not set"}. Please set
        NEXT_PUBLIC_PAYMENT_PROCESSOR to "stripe", "braintree", "square", or
        "authorize"
      </ErrorText>
    </Card>
  )
}
