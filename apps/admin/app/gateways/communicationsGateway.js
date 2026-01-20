import { API_URL } from "@/constants.js"

/**
 * List communication emails
 * @param {object} params
 * @param {number} [params.limit=25]
 * @param {number} [params.offset=0]
 * @param {string|undefined} [params.threadKey]
 * @param {"INBOUND"|"OUTBOUND"|undefined} [params.direction]
 * @param {boolean|undefined} [params.unreadOnly]
 * @returns {Promise<{ emails: Array<object>, total: number, hasMore: boolean }>}
 */
export const listEmails = async ({
  limit = 25,
  offset = 0,
  threadKey,
  direction,
  unreadOnly,
} = {}) => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  if (threadKey) {
    params.set("threadKey", threadKey)
  }

  if (direction) {
    params.set("direction", direction)
  }

  if (unreadOnly === true) {
    params.set("unread", "true")
  }

  const response = await fetch(
    `${API_URL}/admin/communications/emails?${params}`,
    {
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch emails")
  }

  return data
}

/**
 * Fetch a single communication email by ID
 * @param {string} emailId
 * @returns {Promise<{ email: object }>}
 */
export const getEmailById = async (emailId) => {
  const response = await fetch(
    `${API_URL}/admin/communications/emails/${emailId}`,
    {
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch email")
  }

  return data
}

/**
 * Mark a communication email as read/unread
 * @param {string} emailId
 * @param {boolean} isRead
 * @returns {Promise<{ email: object }>}
 */
export const setEmailReadStatus = async (emailId, isRead) => {
  const response = await fetch(
    `${API_URL}/admin/communications/emails/${emailId}/read`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isRead }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to update read status")
  }

  return data
}

/**
 * Permanently delete a communication email
 * @param {string} emailId
 * @returns {Promise<{ success: true }>}
 */
export const deleteEmailById = async (emailId) => {
  const response = await fetch(
    `${API_URL}/admin/communications/emails/${emailId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete email")
  }

  return data
}

/**
 * Reply to a communication email
 * @param {string} emailId
 * @param {string} replyText
 * @returns {Promise<{ email: object }>}
 */
export const replyToEmail = async (emailId, replyText) => {
  const response = await fetch(
    `${API_URL}/admin/communications/emails/${emailId}/reply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ replyText }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to send reply")
  }

  return data
}
