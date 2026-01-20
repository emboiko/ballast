import { API_URL } from "@/constants.js"

/**
 * Update current user's info
 * @param {object} updates
 * @returns {Promise<{ user: object }>}
 */
export const updateUserInfo = async (updates) => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to update user info")
  }

  return data
}
