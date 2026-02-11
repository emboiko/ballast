import { loadEnv } from "../../../../packages/shared/src/config/env.js"

const getInternalApiBaseUrl = () => {
  loadEnv()

  const explicit = process.env.API_INTERNAL_URL
  if (typeof explicit === "string" && explicit.trim().length > 0) {
    return explicit.trim().replace(/\/+$/, "")
  }

  const apiUrl = process.env.API_URL
  if (typeof apiUrl === "string" && apiUrl.trim().length > 0) {
    return apiUrl.trim().replace(/\/+$/, "")
  }

  return "http://localhost:3000"
}

const getInternalApiToken = () => {
  loadEnv()
  const token = process.env.JOBS_INTERNAL_API_TOKEN
  if (typeof token !== "string") {
    return null
  }
  const trimmed = token.trim()
  if (!trimmed) {
    return null
  }
  return trimmed
}

/**
 * @param {object} params
 * @param {string} params.route
 * @param {any} params.body
 * @param {typeof fetch|undefined} [params.fetchFn]
 * @returns {Promise<{ success: boolean, status?: number, data?: any, error?: string }>}
 */
export const postInternalApi = async ({ route, body, fetchFn } = {}) => {
  const token = getInternalApiToken()
  if (!token) {
    return { success: false, error: "Missing JOBS_INTERNAL_API_TOKEN" }
  }

  const baseUrl = getInternalApiBaseUrl()
  if (typeof route !== "string" || route.trim().length === 0) {
    return { success: false, error: "route is required" }
  }

  const resolvedFetch = fetchFn || fetch
  const url = `${baseUrl}${route.startsWith("/") ? "" : "/"}${route}`

  let response = null
  try {
    response = await resolvedFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body || {}),
    })
  } catch (error) {
    return { success: false, error: error?.message || "Request failed" }
  }

  const status = response.status
  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${status})`
    if (data?.error && typeof data.error === "string") {
      errorMessage = data.error
    }
    return { success: false, status, data, error: errorMessage }
  }

  return { success: true, status, data }
}

