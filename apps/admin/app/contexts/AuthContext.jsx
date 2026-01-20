"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { getAuthErrorMessage } from "@shared/utils/auth.js"
import {
  fetchUser as fetchUserGateway,
  login as loginGateway,
  logout as logoutGateway,
} from "@/gateways/authGateway"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const result = await loginGateway(email, password)
      setUser(result.user)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const getAuthErrorMessageText = useCallback((authError) => {
    return getAuthErrorMessage(authError)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutGateway()
    } finally {
      setUser(null)
    }
  }, [])

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
    login,
    getAuthErrorMessage: getAuthErrorMessageText,
    logout,
    refreshUser: fetchUser,
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
