"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAuthErrorMessage } from "@shared/utils/auth.js"
import {
  fetchUser as fetchUserGateway,
  signup as signupGateway,
  login as loginGateway,
  logout as logoutGateway,
  resendVerification as resendVerificationGateway,
  updatePassword as updatePasswordGateway,
  updateEmail as updateEmailGateway,
  resetPassword as resetPasswordGateway,
  forgotPassword as forgotPasswordGateway,
  deleteAccount as deleteAccountGateway,
} from "@/gateways/authGateway"
import { updateUserInfo as updateUserInfoGateway } from "@/gateways/usersGateway"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingRedirect, setPendingRedirect] = useState(null)

  // Success notification state
  const [successMessage, setSuccessMessage] = useState(null)
  const previousPathnameRef = useRef(pathname)
  const skipNextClearRef = useRef(false)

  const fetchUser = useCallback(async () => {
    try {
      const data = await fetchUserGateway()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAuthErrorMessageText = useCallback((authError) => {
    return getAuthErrorMessage(authError)
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Check for verification success in URL params
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get("verified") === "true") {
      setSuccessMessage("Your email has been verified! 🎉")
      window.history.replaceState({}, "", window.location.pathname)
      fetchUser()
    }
  }, [fetchUser])

  // Check for auth error in URL params
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const authError = params.get("auth_error")
    if (authError) {
      setError(getAuthErrorMessageText(authError))
      setShowAuthModal(true)
      params.delete("auth_error")
      const queryString = params.toString()
      let nextUrl = window.location.pathname
      if (queryString) {
        nextUrl = `${nextUrl}?${queryString}`
      }
      window.history.replaceState({}, "", nextUrl)
    }
  }, [getAuthErrorMessageText])

  // Clear success message on navigation (but not on initial mount or when skip flag is set)
  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      if (skipNextClearRef.current) {
        skipNextClearRef.current = false
      } else {
        setSuccessMessage(null)
      }
      previousPathnameRef.current = pathname
    }
  }, [pathname])

  // Set success message with option to persist through next navigation
  const setSuccessMessagePersist = useCallback((message) => {
    skipNextClearRef.current = true
    setSuccessMessage(message)
  }, [])

  const dismissSuccessMessage = useCallback(() => {
    setSuccessMessage(null)
  }, [])

  // Handle successful login - redirect if there was a pending redirect
  const handleLoginSuccess = useCallback(
    (userData) => {
      setUser(userData)
      setShowAuthModal(false)

      if (pendingRedirect) {
        router.push(pendingRedirect)
        setPendingRedirect(null)
      }
    },
    [pendingRedirect, router]
  )

  // Open auth modal with optional redirect intent
  const openAuthModal = useCallback((redirectTo = null) => {
    setPendingRedirect(redirectTo)
    setShowAuthModal(true)
  }, [])

  // Close auth modal and clear pending redirect
  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
    setPendingRedirect(null)
  }, [])

  // Require auth - if not authenticated, show modal with redirect intent
  const requireAuth = useCallback(
    (redirectTo = null) => {
      if (!user && !isLoading) {
        openAuthModal(redirectTo || pathname)
        return false
      }
      return true
    },
    [user, isLoading, openAuthModal, pathname]
  )

  const signup = useCallback(async (email, password, turnstileToken) => {
    setError(null)
    try {
      const result = await signupGateway(email, password, turnstileToken)
      return { success: true, message: result.message }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const login = useCallback(
    async (email, password) => {
      setError(null)
      try {
        const result = await loginGateway(email, password)

        if (!result.success) {
          if (result.needsVerification) {
            return {
              success: false,
              needsVerification: true,
              email: result.email,
              error: result.error,
            }
          }
          if (result.banned) {
            setError(result.error)
            return { success: false, error: result.error }
          }
          throw new Error(result.error || "Login failed")
        }

        handleLoginSuccess(result.user)
        return { success: true }
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      }
    },
    [handleLoginSuccess]
  )

  const logout = useCallback(async () => {
    try {
      await logoutGateway()
    } finally {
      setUser(null)
      router.push("/")
    }
  }, [router])

  const resendVerification = useCallback(async (email) => {
    try {
      return await resendVerificationGateway(email)
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    setError(null)
    try {
      const result = await updatePasswordGateway(currentPassword, newPassword)
      return { success: true, message: result.message }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const updateEmail = useCallback(async (newEmail, password) => {
    setError(null)
    try {
      const result = await updateEmailGateway(newEmail, password)
      return { success: true, message: result.message }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const resetPassword = useCallback(async (token, newPassword) => {
    setError(null)
    try {
      const result = await resetPasswordGateway(token, newPassword)
      return { success: true, message: result.message, user: result.user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    setError(null)
    try {
      const result = await forgotPasswordGateway(email)
      return { success: true, message: result.message }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const deleteAccount = useCallback(
    async (password) => {
      setError(null)
      try {
        const result = await deleteAccountGateway(password)
        setUser(null)
        router.push("/")
        return { success: true, message: result.message }
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      }
    },
    [router]
  )

  const updateUserInfo = useCallback(async (updates) => {
    setError(null)
    try {
      const result = await updateUserInfoGateway(updates)
      setUser(result.user)
      return { success: true, user: result.user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isVerified: user?.emailVerified ?? false,
    signup,
    login,
    logout,
    resendVerification,
    updatePassword,
    updateEmail,
    resetPassword,
    forgotPassword,
    deleteAccount,
    updateUserInfo,
    refreshUser: fetchUser,
    // Auth modal
    showAuthModal,
    openAuthModal,
    closeAuthModal,
    requireAuth,
    pendingRedirect,
    // Success notification
    successMessage,
    setSuccessMessage,
    setSuccessMessagePersist,
    dismissSuccessMessage,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
