"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState, AuthRequired } from "@/components/auth/authStyles"
import { TextSecondary } from "@/components/ui/uiStyles"

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthModal()
    }
  }, [isLoading, isAuthenticated, openAuthModal])

  if (isLoading) {
    return <LoadingState>Loading...</LoadingState>
  }

  if (!isAuthenticated) {
    return (
      <AuthRequired>
        <TextSecondary>Please sign in to continue.</TextSecondary>
      </AuthRequired>
    )
  }

  return children
}
