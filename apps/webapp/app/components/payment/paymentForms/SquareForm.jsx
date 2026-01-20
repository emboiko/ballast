"use client"

import { SQUARE_APPLICATION_ID } from "@/constants.js"
import { Card, ErrorText, TextSecondary } from "@/components/ui/uiStyles"

// TODO: Implement Square Web Payments SDK integration
// This is a placeholder for future implementation

export default function SquareForm() {
  if (!SQUARE_APPLICATION_ID) {
    return (
      <Card>
        <ErrorText>Square application ID is not configured</ErrorText>
      </Card>
    )
  }

  return (
    <Card>
      <h2>Square Payment</h2>
      <div id="square-payment-form">
        <TextSecondary>Square payment integration coming soon.</TextSecondary>
      </div>
    </Card>
  )
}
