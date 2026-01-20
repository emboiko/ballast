"use client"

import { BRAINTREE_CLIENT_TOKEN } from "@/constants.js"
import { Card, ErrorText, TextSecondary } from "@/components/ui/uiStyles"

// TODO: Implement Braintree drop-in integration
// This is a placeholder for future implementation

export default function BraintreeForm() {
  if (!BRAINTREE_CLIENT_TOKEN) {
    return (
      <Card>
        <ErrorText>Braintree client token is not configured</ErrorText>
      </Card>
    )
  }

  return (
    <Card>
      <h2>Braintree Payment</h2>
      <div id="braintree-dropin-container">
        <TextSecondary>Braintree drop-in integration coming soon.</TextSecondary>
      </div>
    </Card>
  )
}
