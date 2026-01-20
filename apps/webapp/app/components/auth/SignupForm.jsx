"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  AuthFormContainer,
  AuthForm,
  AuthSwitch,
  TurnstileContainer,
  LinkButton,
  OAuthDivider,
  OAuthDividerLine,
  OAuthDividerText,
  OAuthButton,
} from "@/components/auth/authStyles"
import { ButtonPrimary, FormGroup, FormError } from "@/components/ui/uiStyles"
import {
  API_URL,
  TURNSTILE_SITE_KEY,
  TURNSTILE_SCRIPT_URL,
} from "@/constants.js"

export default function SignupForm({ onSwitchToLogin, onSignupSuccess }) {
  const { signup, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || typeof window === "undefined") {
      return
    }

    const renderWidget = () => {
      if (
        window.turnstile &&
        turnstileRef.current &&
        widgetIdRef.current === null
      ) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => setTurnstileToken(token),
        })
      }
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      const existingScript = document.querySelector(
        `script[src="${TURNSTILE_SCRIPT_URL}"]`
      )

      if (existingScript) {
        existingScript.addEventListener("load", renderWidget)
      } else {
        const script = document.createElement("script")
        script.src = TURNSTILE_SCRIPT_URL
        script.async = true
        script.defer = true
        script.onload = renderWidget
        document.head.appendChild(script)
      }
    }

    return () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError("")

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters")
      return
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setLocalError("Please complete the captcha verification")
      return
    }

    setIsSubmitting(true)

    const result = await signup(email, password, turnstileToken)

    if (result.success) {
      onSignupSuccess?.(email)
    } else {
      setLocalError(result.error)
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current)
      }
    }

    setIsSubmitting(false)
  }

  const displayError = localError || error

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google/start`
  }

  return (
    <AuthFormContainer>
      <h2>Create Account</h2>
      <OAuthButton
        type="button"
        onClick={handleGoogleSignup}
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
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="email"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="new-password"
            minLength={8}
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="signup-confirmPassword">Confirm Password</label>
          <input
            id="signup-confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </FormGroup>

        {TURNSTILE_SITE_KEY && (
          <FormGroup as={TurnstileContainer}>
            <div ref={turnstileRef} tabIndex={-1}></div>
          </FormGroup>
        )}

        <ButtonPrimary as="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </ButtonPrimary>
      </AuthForm>

      <AuthSwitch>
        Already have an account?{" "}
        <LinkButton type="button" onClick={onSwitchToLogin}>
          Log in
        </LinkButton>
      </AuthSwitch>
    </AuthFormContainer>
  )
}
