"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import {
  LoginCard,
  LoginHeader,
  LoginTitle,
  LoginSubtitle,
  LoginForm as StyledLoginForm,
  FormGroup,
  FormLabel,
  FormInput,
  SubmitButton,
  OAuthDivider,
  OAuthDividerLine,
  OAuthDividerText,
  OAuthButton,
} from "@/components/auth/authStyles"
import { API_URL } from "@/constants.js"

export default function LoginForm() {
  const { login, getAuthErrorMessage } = useAuth()
  const { showErrorToast } = useToast()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const authError = searchParams.get("auth_error")
    if (authError) {
      showErrorToast(getAuthErrorMessage(authError))
      const url = new URL(window.location.href)
      url.searchParams.delete("auth_error")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams, showErrorToast])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await login(email, password)
      if (!result.success) {
        showErrorToast(result.error)
      }
    } catch (err) {
      showErrorToast(err.message || "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/admin/auth/google/start`
  }

  return (
    <LoginCard>
      <LoginHeader>
        <LoginTitle>Admin Login</LoginTitle>
        <LoginSubtitle>Sign in to access the admin dashboard</LoginSubtitle>
      </LoginHeader>

      <StyledLoginForm onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
            autoComplete="email"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="password">Password</FormLabel>
          <FormInput
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </SubmitButton>
      </StyledLoginForm>

      <OAuthDivider>
        <OAuthDividerLine />
        <OAuthDividerText>Or</OAuthDividerText>
        <OAuthDividerLine />
      </OAuthDivider>

      <OAuthButton
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
      >
        Continue with Google
      </OAuthButton>
    </LoginCard>
  )
}
