"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ResetPasswordContainer,
  AuthFormContainer,
  AuthMessage,
} from "@/components/auth/authStyles"
import { ButtonPrimary, FormError } from "@/components/ui/uiStyles"

const ERROR_MESSAGES = {
  missing_token: "Reactivation link is missing. Please contact support.",
  invalid_token: "Reactivation link is invalid or has already been used.",
  expired_token: "Reactivation link has expired. Please contact support.",
  reactivation_failed: "Something went wrong. Please contact support.",
}

function ReactivateContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success") === "true"
  const errorParam = searchParams.get("error")

  if (success) {
    return (
      <ResetPasswordContainer>
        <AuthFormContainer>
          <h2>Account Reactivated!</h2>
          <AuthMessage>
            Your account has been successfully reactivated. You can now log in
            with your existing password.
          </AuthMessage>
          <ButtonPrimary as={Link} href="/">
            Go to Home
          </ButtonPrimary>
        </AuthFormContainer>
      </ResetPasswordContainer>
    )
  }

  const errorMessage = errorParam
    ? ERROR_MESSAGES[errorParam] || "An unexpected error occurred."
    : "Invalid reactivation link."

  return (
    <ResetPasswordContainer>
      <AuthFormContainer>
        <h2>Account Reactivation</h2>
        <FormError>{errorMessage}</FormError>
        <AuthMessage>
          If you need assistance, please contact us through our contact form.
        </AuthMessage>
        <ButtonPrimary as={Link} href="/contact">
          Contact Support
        </ButtonPrimary>
      </AuthFormContainer>
    </ResetPasswordContainer>
  )
}

export default function Reactivate() {
  return (
    <Suspense
      fallback={<ResetPasswordContainer>Loading...</ResetPasswordContainer>}
    >
      <ReactivateContent />
    </Suspense>
  )
}
