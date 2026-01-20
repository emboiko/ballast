"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  AuthFormContainer,
  AuthForm,
  AuthSwitch,
  AuthMessage,
  Centered,
  LinkButton,
} from "@/components/auth/authStyles"
import { ButtonPrimary, FormGroup, FormError } from "@/components/ui/uiStyles"

export default function ForgotPasswordForm({ onSwitchToLogin }) {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const result = await forgotPassword(email)

      if (!result.success) {
        setError(result.error || "Failed to send reset email")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message || "Network error. Please try again.")
    }

    setIsSubmitting(false)
  }

  if (success) {
    return (
      <AuthFormContainer>
        <h2>Check Your Email</h2>
        <AuthMessage>
          If an account exists for <strong>{email}</strong>, you will receive a
          password reset link shortly.
        </AuthMessage>
        <AuthMessage>The link will expire in 1 hour.</AuthMessage>
        <Centered>
          <ButtonPrimary as="button" type="button" onClick={onSwitchToLogin}>
            Back to Login
          </ButtonPrimary>
        </Centered>
      </AuthFormContainer>
    )
  }

  return (
    <AuthFormContainer>
      <h2>Forgot Password</h2>
      <AuthMessage>
        Enter your email address and we'll send you a link to reset your
        password.
      </AuthMessage>
      <AuthForm onSubmit={handleSubmit}>
        {error && <FormError>{error}</FormError>}
        <FormGroup>
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="email"
            autoFocus
          />
        </FormGroup>

        <ButtonPrimary as="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </ButtonPrimary>
      </AuthForm>

      <AuthSwitch>
        Remember your password?{" "}
        <LinkButton type="button" onClick={onSwitchToLogin}>
          Log in
        </LinkButton>
      </AuthSwitch>
    </AuthFormContainer>
  )
}
