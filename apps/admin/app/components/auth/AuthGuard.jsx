"use client"

import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/auth/LoginForm"
import { LoginContainer, LoadingState } from "@/components/auth/authStyles"

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingState>Loading...</LoadingState>
  }

  if (!isAuthenticated) {
    return (
      <LoginContainer>
        <LoginForm />
      </LoginContainer>
    )
  }

  return children
}
