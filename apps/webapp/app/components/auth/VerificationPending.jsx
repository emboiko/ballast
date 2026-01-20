"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  AuthFormContainer,
  VerificationMessage,
  EmailHighlight,
  VerificationActions,
  InfoText,
  LinkButton,
} from "@/components/auth/authStyles"
import { ButtonPrimary } from "@/components/ui/uiStyles"

export default function VerificationPending({ email, onBackToLogin }) {
  const { resendVerification } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState("")

  const handleResend = async () => {
    setIsResending(true)
    setMessage("")

    const result = await resendVerification(email)
    setMessage(result.message || result.error)

    setIsResending(false)
  }

  return (
    <AuthFormContainer>
      <h2>Check Your Email</h2>
      <VerificationMessage>
        <p>We've sent a verification link to:</p>
        <EmailHighlight>{email}</EmailHighlight>
        <p>
          Click the link in the email to verify your account and start using
          Ballast.
        </p>
      </VerificationMessage>

      {message && <InfoText>{message}</InfoText>}

      <VerificationActions>
        <ButtonPrimary
          as="button"
          type="button"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? "Sending..." : "Resend Verification Email"}
        </ButtonPrimary>

        <LinkButton type="button" onClick={onBackToLogin}>
          Back to login
        </LinkButton>
      </VerificationActions>
    </AuthFormContainer>
  )
}
