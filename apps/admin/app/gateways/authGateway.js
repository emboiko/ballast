import { API_URL } from "@/constants.js"

/**
 * Fetch the current authenticated admin user
 * @returns {Promise<{ user: { id: string, email: string, emailVerified: boolean, isAdmin: boolean } }>}
 */
export const fetchUser = async () => {
  const response = await fetch(`${API_URL}/admin/auth/me`, {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user")
  }

  return response.json()
}

/**
 * Log in as admin
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Login failed")
  }

  return { success: true, user: data.user }
}

/**
 * Log out the current admin user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  await fetch(`${API_URL}/admin/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}
