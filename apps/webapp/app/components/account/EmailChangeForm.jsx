"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  CollapsibleForm,
  SettingsForm,
  SettingsFormDescription,
} from "@/components/account/accountStyles"
import { ButtonPrimary, FormGroup, FormError } from "@/components/ui/uiStyles"

export default function EmailChangeForm({ onSuccess }) {
  const { user, updateEmail } = useAuth()
  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await updateEmail(newEmail, password)

      if (!result.success) {
        throw new Error(result.error || "Failed to update email")
      }

      setNewEmail("")
      setPassword("")
      onSuccess(
        "Verification email sent! Check your inbox to confirm the change."
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CollapsibleForm>
      <SettingsFormDescription>
        Current email: <strong>{user.email}</strong>
      </SettingsFormDescription>
      <SettingsForm onSubmit={handleSubmit}>
        {error && <FormError>{error}</FormError>}
        <FormGroup>
          <label htmlFor="new-email">New Email</label>
          <input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Enter new email address"
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="email-password">Current Password</label>
          <input
            id="email-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Confirm with your password"
          />
        </FormGroup>
        <ButtonPrimary as="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Verification Email"}
        </ButtonPrimary>
      </SettingsForm>
    </CollapsibleForm>
  )
}
