import { API_URL } from "@/constants.js"

/**
 * Submit a contact form
 * @param {string} name
 * @param {string} email
 * @param {string|null} subject
 * @param {string} message
 * @param {string|null} turnstileToken
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const submitContact = async (
  name,
  email,
  subject,
  message,
  turnstileToken
) => {
  const response = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name,
      email,
      subject: subject || null,
      message,
      turnstileToken: turnstileToken || null,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to submit contact form")
  }

  return { success: true, message: data.message }
}
