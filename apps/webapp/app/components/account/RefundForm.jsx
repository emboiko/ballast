"use client"

import { useState } from "react"
import { useOrders } from "@/contexts/OrdersContext"
import {
  CollapsibleForm,
  SettingsForm,
  SettingsFormDescription,
} from "@/components/account/accountStyles"
import { ButtonPrimary, FormGroup, FormError } from "@/components/ui/uiStyles"

export default function RefundForm({ orderId, onSuccess }) {
  const { requestRefund } = useOrders()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await requestRefund(orderId, reason || null)

      if (!result.success) {
        throw new Error(result.error || "Failed to submit refund request")
      }

      setReason("")
      onSuccess("Refund request submitted. Our team will review it shortly.")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CollapsibleForm>
      <SettingsFormDescription>
        Please provide a reason for your refund request (optional). Our customer
        service team will review your request and process it accordingly.
      </SettingsFormDescription>
      <SettingsForm onSubmit={handleSubmit}>
        {error && <FormError>{error}</FormError>}
        <FormGroup>
          <label htmlFor="refund-reason">Reason (Optional)</label>
          <textarea
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            placeholder="Please explain why you're requesting a refund..."
            rows={4}
          />
        </FormGroup>
        <ButtonPrimary as="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Request Refund"}
        </ButtonPrimary>
      </SettingsForm>
    </CollapsibleForm>
  )
}
