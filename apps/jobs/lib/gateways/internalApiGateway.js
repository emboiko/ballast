import { z } from "zod"
import { INTERNAL_API_BASE_URL, JOBS_INTERNAL_API_TOKEN } from "../constants.js"

const postInternalApiParamsSchema = z.object({
  route: z.string().trim().min(1),
  body: z.unknown().optional(),
  fetchFn: z.unknown().optional(),
})

/**
 * @param {object} params
 * @param {string} params.route
 * @param {any} params.body
 * @param {typeof fetch|undefined} [params.fetchFn]
 * @returns {Promise<{ success: boolean, status?: number, data?: any, error?: string }>}
 */
export const postInternalApi = async ({ route, body, fetchFn } = {}) => {
  const parsedParams = postInternalApiParamsSchema.safeParse({
    route,
    body,
    fetchFn,
  })
  if (!parsedParams.success) {
    return { success: false, error: "Invalid request params" }
  }

  const token = JOBS_INTERNAL_API_TOKEN
  if (!token) {
    return { success: false, error: "Missing JOBS_INTERNAL_API_TOKEN" }
  }

  const resolvedFetch = fetchFn || fetch
  if (typeof resolvedFetch !== "function") {
    return { success: false, error: "Invalid fetch function" }
  }
  const url = `${INTERNAL_API_BASE_URL}${
    parsedParams.data.route.startsWith("/") ? "" : "/"
  }${parsedParams.data.route}`

  let response = null
  try {
    response = await resolvedFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsedParams.data.body || {}),
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
