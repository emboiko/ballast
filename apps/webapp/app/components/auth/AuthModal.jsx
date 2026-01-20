"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/auth/LoginForm"
import SignupForm from "@/components/auth/SignupForm"
import VerificationPending from "@/components/auth/VerificationPending"
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"
import { ModalBackdrop, ModalContent, ModalClose } from "@/components/auth/authStyles"

export default function AuthModal() {
  const { showAuthModal, closeAuthModal } = useAuth()
  const [view, setView] = useState("login")
  const [pendingEmail, setPendingEmail] = useState("")

  // Reset view when modal opens
  useEffect(() => {
    if (showAuthModal) {
      setView("login")
      setPendingEmail("")
    }
  }, [showAuthModal])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showAuthModal) {
        closeAuthModal()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [showAuthModal, closeAuthModal])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [showAuthModal])

  if (!showAuthModal) {
    return null
  }

  const handleSignupSuccess = (email) => {
    setPendingEmail(email)
    setView("verification")
  }

  const handleNeedsVerification = (email) => {
    setPendingEmail(email)
    setView("verification")
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeAuthModal()
    }
  }

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalClose onClick={closeAuthModal} aria-label="Close">
          ×
        </ModalClose>

        {view === "verification" ? (
          <VerificationPending
            email={pendingEmail}
            onBackToLogin={() => setView("login")}
          />
        ) : view === "forgot" ? (
          <ForgotPasswordForm onSwitchToLogin={() => setView("login")} />
        ) : view === "signup" ? (
          <SignupForm
            onSwitchToLogin={() => setView("login")}
            onSignupSuccess={handleSignupSuccess}
          />
        ) : (
          <LoginForm
            onSwitchToSignup={() => setView("signup")}
            onNeedsVerification={handleNeedsVerification}
            onForgotPassword={() => setView("forgot")}
          />
        )}
      </ModalContent>
    </ModalBackdrop>
  )
}
