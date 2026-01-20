import {
  TURNSTILE_SECRET_KEY,
  TURNSTILE_VERIFY_URL,
} from "@/constants.js"

/**
 * Verify a Turnstile token with Cloudflare
 * @param {string} token - Turnstile token from client
 * @param {string} [ip] - Optional client IP for additional verification
 * @returns {Promise<boolean>}
 */
export const verifyTurnstile = async (token, ip) => {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn("TURNSTILE_SECRET_KEY not set, skipping verification")
    return false
  }

  try {
    const formData = new URLSearchParams()
    formData.append("secret", TURNSTILE_SECRET_KEY)
    formData.append("response", token)
    if (ip) {
      formData.append("remoteip", ip)
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
    })

    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error("Turnstile verification failed:", error)
    return false
  }
}
