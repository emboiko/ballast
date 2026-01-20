"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  CollapsibleForm,
  SettingsForm,
} from "@/components/account/accountStyles"
import { ButtonPrimary, FormGroup, FormError } from "@/components/ui/uiStyles"

export default function PasswordChangeForm({ onSuccess }) {
  const { updatePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updatePassword(currentPassword, newPassword)

      if (!result.success) {
        throw new Error(result.error || "Failed to update password")
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      onSuccess("Password updated successfully! ✓")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CollapsibleForm>
      <SettingsForm onSubmit={handleSubmit}>
        {error && <FormError>{error}</FormError>}
        <FormGroup>
          <label htmlFor="current-password">Current Password</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isSubmitting}
            minLength={8}
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </FormGroup>
        <ButtonPrimary as="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </ButtonPrimary>
      </SettingsForm>
    </CollapsibleForm>
  )
}
