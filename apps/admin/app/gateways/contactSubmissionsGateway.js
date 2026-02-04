import { API_URL } from "@/constants.js"

/**
 * List contact submissions for admin UI.
 * @param {object} params
 * @param {number} [params.limit=25]
 * @param {number} [params.offset=0]
 * @param {boolean|undefined} [params.unreadOnly]
 * @param {string|undefined} [params.userId]
 * @returns {Promise<{ submissions: Array<object>, total: number, hasMore: boolean }>}
 */
export const listContactSubmissions = async ({
  limit = 25,
  offset = 0,
  unreadOnly,
  userId,
} = {}) => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  if (unreadOnly === true) {
    params.set("unread", "true")
  }
  if (typeof userId === "string" && userId.trim()) {
    params.set("userId", userId.trim())
  }

  const response = await fetch(
    `${API_URL}/admin/contact-submissions?${params}`,
    {
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch contact submissions")
  }

  return data
}

/**
 * Fetch a single contact submission by ID.
 * @param {string} submissionId
 * @returns {Promise<{ submission: object }>}
 */
export const getContactSubmissionById = async (submissionId) => {
  const response = await fetch(
    `${API_URL}/admin/contact-submissions/${submissionId}`,
    {
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch contact submission")
  }

  return data
}

/**
 * Mark a contact submission as read/unread.
 * @param {string} submissionId
 * @param {boolean} isRead
 * @returns {Promise<{ submission: object }>}
 */
export const setContactSubmissionReadStatus = async (submissionId, isRead) => {
  const response = await fetch(
    `${API_URL}/admin/contact-submissions/${submissionId}/read`,
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
 * Permanently delete a contact submission.
 * @param {string} submissionId
 * @returns {Promise<{ success: true }>}
 */
export const deleteContactSubmissionById = async (submissionId) => {
  const response = await fetch(
    `${API_URL}/admin/contact-submissions/${submissionId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete contact submission")
  }

  return data
}
