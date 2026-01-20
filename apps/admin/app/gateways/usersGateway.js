import { API_URL } from "@/constants.js"

/**
 * Fetch a single user by ID
 * @param {string} userId
 * @returns {Promise<{ user: object }>}
 */
export const fetchUserById = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user")
  }

  return data
}

/**
 * Update a user's editable fields
 * @param {string} userId
 * @param {object} updates
 * @param {string} [updates.email]
 * @param {boolean} [updates.isAdmin]
 * @returns {Promise<{ user: object }>}
 */
export const updateUser = async (userId, updates) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to update user")
  }

  return data
}

/**
 * Archive (soft delete) a user
 * @param {string} userId
 * @returns {Promise<{ message: string, user: object }>}
 */
export const archiveUser = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/archive`, {
    method: "POST",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to archive user")
  }

  return data
}

/**
 * Unarchive a user
 * @param {string} userId
 * @param {boolean} requireVerification
 * @returns {Promise<{ message: string, user: object, verificationSent: boolean }>}
 */
export const unarchiveUser = async (userId, requireVerification = false) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/unarchive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ requireVerification }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to unarchive user")
  }

  return data
}

/**
 * Permanently delete a user (GDPR)
 * @param {string} userId
 * @param {string} confirmEmail - Must match user's email to confirm
 * @returns {Promise<{ message: string }>}
 */
export const permanentlyDeleteUser = async (userId, confirmEmail) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ confirmEmail }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to permanently delete user")
  }

  return data
}

/**
 * Ban a user
 * @param {string} userId
 * @param {string} reasonInternal
 * @returns {Promise<{ message: string, user: object }>}
 */
export const banUser = async (userId, reasonInternal) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reasonInternal }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to ban user")
  }

  return data
}

/**
 * Unban a user
 * @param {string} userId
 * @returns {Promise<{ message: string, user: object }>}
 */
export const unbanUser = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/unban`, {
    method: "POST",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to unban user")
  }

  return data
}

/**
 * Fetch aggregate user stats for the /users overview.
 * @returns {Promise<{ stats: object }>}
 */
export const fetchUsersStats = async () => {
  const response = await fetch(`${API_URL}/admin/users/stats`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user stats")
  }

  return data
}

/**
 * List users for overview panels with cursor pagination.
 * @param {object} options
 * @param {"newest" | "banned" | "archived"} options.filter
 * @param {number} options.limit
 * @param {object | null | undefined} [options.cursor]
 * @param {string} [options.cursor.cursorCreatedAt]
 * @param {string} [options.cursor.cursorId]
 * @returns {Promise<{ users: object[], totalCount: number, nextCursor: object | null }>}
 */
export const listUsers = async ({ filter, limit, cursor }) => {
  const params = new URLSearchParams()
  params.set("filter", filter)
  params.set("limit", String(limit))

  if (cursor?.cursorCreatedAt && cursor?.cursorId) {
    params.set("cursorCreatedAt", cursor.cursorCreatedAt)
    params.set("cursorId", cursor.cursorId)
  }

  const response = await fetch(
    `${API_URL}/admin/users/list?${params.toString()}`,
    {
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to list users")
  }

  return data
}

/**
 * Fetch user growth buckets for charting.
 * @param {object} options
 * @param {"week" | "month" | "year" | "all"} options.range
 * @returns {Promise<{ range: string, buckets: Array<object> }>}
 */
export const fetchUsersGrowth = async ({ range }) => {
  const params = new URLSearchParams()
  params.set("range", range)

  const response = await fetch(
    `${API_URL}/admin/users/growth?${params.toString()}`,
    {
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user growth")
  }

  return data
}
