"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  ResetPasswordContainer,
  AuthFormContainer,
  AuthForm,
  AuthMessage,
} from "@/components/auth/authStyles"
import { ButtonPrimary, FormGroup, FormError } from "@/components/ui/uiStyles"

const ERROR_MESSAGES = {
  missing_token: "Reset link is invalid. Please request a new one.",
  invalid_token: "Reset link is invalid or has already been used.",
  expired_token: "Reset link has expired. Please request a new one.",
  validation_failed: "Something went wrong. Please try again.",
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    refreshUser,
    setSuccessMessagePersist,
    openAuthModal,
    resetPassword,
  } = useAuth()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const token = searchParams.get("token")
  const errorParam = searchParams.get("error")

  useEffect(() => {
    if (errorParam && ERROR_MESSAGES[errorParam]) {
      setError(ERROR_MESSAGES[errorParam])
    }
  }, [errorParam])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await resetPassword(token, password)

      if (!result.success) {
        setError(result.error || "Failed to reset password")
        setIsSubmitting(false)
        return
      }

      // Refresh user data (we're now logged in)
      await refreshUser()

      // Set success message and redirect home
      setSuccessMessagePersist("Your password has been reset successfully! 🎉")
      router.push("/")
    } catch (err) {
      setError(err.message || "Network error. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleRequestNewLink = () => {
    openAuthModal()
  }

  if (!token || errorParam) {
    return (
      <ResetPasswordContainer>
        <AuthFormContainer>
          <h2>Reset Password</h2>
          <FormError>{error || "Invalid reset link"}</FormError>
          <AuthMessage>Need a new password reset link?</AuthMessage>
          <ButtonPrimary
            as="button"
            type="button"
            onClick={handleRequestNewLink}
          >
            Request New Link
          </ButtonPrimary>
        </AuthFormContainer>
      </ResetPasswordContainer>
    )
  }

  return (
    <ResetPasswordContainer>
      <AuthFormContainer>
        <h2>Set New Password</h2>
        <AuthMessage>Enter your new password below.</AuthMessage>
        <AuthForm onSubmit={handleSubmit}>
          {error && <FormError>{error}</FormError>}
          <FormGroup>
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="new-password"
              minLength={8}
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="new-password"
              minLength={8}
            />
          </FormGroup>

          <ButtonPrimary as="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </ButtonPrimary>
        </AuthForm>
      </AuthFormContainer>
    </ResetPasswordContainer>
  )
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={<ResetPasswordContainer>Loading...</ResetPasswordContainer>}
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
