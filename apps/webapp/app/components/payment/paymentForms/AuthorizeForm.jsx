"use client"

import {
  AUTHORIZE_API_LOGIN_ID,
  AUTHORIZE_CLIENT_KEY,
} from "@/constants.js"
import { Card, ErrorText, TextSecondary } from "@/components/ui/uiStyles"

// TODO: Implement Authorize.net Accept.js hosted fields integration
// This is a placeholder for future implementation

export default function AuthorizeForm() {
  if (!AUTHORIZE_API_LOGIN_ID || !AUTHORIZE_CLIENT_KEY) {
    return (
      <Card>
        <ErrorText>Authorize.net credentials are not configured</ErrorText>
      </Card>
    )
  }

  return (
    <Card>
      <h2>Authorize.net Payment</h2>
      <div id="authorize-payment-form">
        <TextSecondary>
          Authorize.net payment integration coming soon.
        </TextSecondary>
      </div>
    </Card>
  )
}
