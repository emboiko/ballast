import { API_URL } from "@/constants.js"

/**
 * Fetch the current authenticated user
 * @returns {Promise<{ user: { id: string, email: string, emailVerified: boolean } }>}
 */
export const fetchUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user")
  }

  return response.json()
}

/**
 * Sign up a new user
 * @param {string} email
 * @param {string} password
 * @param {string} turnstileToken
 * @returns {Promise<{ success: boolean, message?: string, error?: string, user?: object }>}
 */
export const signup = async (email, password, turnstileToken) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, turnstileToken }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Signup failed")
  }

  return { success: true, message: data.message, user: data.user }
}

/**
 * Log in a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, needsVerification?: boolean, banned?: boolean, email?: string, error?: string }>}
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    if (data.emailVerified === false) {
      return {
        success: false,
        needsVerification: true,
        email: data.email,
        error: data.error,
      }
    }
    if (data.banned === true) {
      return {
        success: false,
        banned: true,
        error: data.error,
      }
    }
    throw new Error(data.error || "Login failed")
  }

  return { success: true, user: data.user }
}

/**
 * Log out the current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}

/**
 * Resend email verification
 * @param {string} email
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const resendVerification = async (email) => {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()
  return {
    success: response.ok,
    message: data.message,
    error: data.error,
  }
}

/**
 * Update user password
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const updatePassword = async (currentPassword, newPassword) => {
  const response = await fetch(`${API_URL}/auth/update-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to update password")
  }

  return { success: true, message: data.message }
}

/**
 * Request email change
 * @param {string} newEmail
 * @param {string} password
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const updateEmail = async (newEmail, password) => {
  const response = await fetch(`${API_URL}/auth/update-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ newEmail, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to update email")
  }

  return { success: true, message: data.message }
}

/**
 * Reset password with token
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean, message?: string, user?: object, error?: string }>}
 */
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, newPassword }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password")
  }

  return { success: true, message: data.message, user: data.user }
}

/**
 * Request password reset email
 * @param {string} email
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to send password reset email")
  }

  return { success: true, message: data.message }
}

/**
 * Delete (archive) user account
 * @param {string} password
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const deleteAccount = async (password) => {
  const response = await fetch(`${API_URL}/auth/delete-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete account")
  }

  return { success: true, message: data.message }
}
