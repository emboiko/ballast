"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  AuthFormContainer,
  AuthForm,
  AuthSwitch,
  LinkButton,
  OAuthDivider,
  OAuthDividerLine,
  OAuthDividerText,
  OAuthButton,
} from "@/components/auth/authStyles"
import { ButtonPrimary, FormGroup, FormError } from "@/components/ui/uiStyles"
import { API_URL } from "@/constants.js"

export default function LoginForm({
  onSwitchToSignup,
  onNeedsVerification,
  onForgotPassword,
}) {
  const { login, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError("")
    setIsSubmitting(true)

    const result = await login(email, password)

    if (result.needsVerification) {
      onNeedsVerification?.(result.email || email)
    } else if (!result.success) {
      setLocalError(result.error)
    }

    setIsSubmitting(false)
  }

  const displayError = localError || error

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google/start`
  }

  return (
    <AuthFormContainer>
      <h2>Log In</h2>
      <OAuthButton
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
      >
        Continue with Google
      </OAuthButton>

      <OAuthDivider>
        <OAuthDividerLine />
        <OAuthDividerText>Or</OAuthDividerText>
        <OAuthDividerLine />
      </OAuthDivider>

      <AuthForm onSubmit={handleSubmit}>
        {displayError && <FormError>{displayError}</FormError>}
        <FormGroup>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="email"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </FormGroup>

        <ButtonPrimary as="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </ButtonPrimary>
      </AuthForm>

      <AuthSwitch>
        Don't have an account?{" "}
        <LinkButton type="button" onClick={onSwitchToSignup}>
          Sign up
        </LinkButton>
      </AuthSwitch>
      <AuthSwitch>
        <LinkButton type="button" onClick={onForgotPassword}>
          Forgot password?
        </LinkButton>
      </AuthSwitch>
    </AuthFormContainer>
  )
}
