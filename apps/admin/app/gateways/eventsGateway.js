import { API_URL } from "@/constants.js"

export const fetchEvents = async ({ limit, before, after } = {}) => {
  const params = new URLSearchParams()

  if (typeof limit === "number") {
    params.append("limit", String(limit))
  }

  if (typeof before === "string" && before.trim().length > 0) {
    params.append("before", before.trim())
  }

  if (typeof after === "string" && after.trim().length > 0) {
    params.append("after", after.trim())
  }

  const queryString = params.toString()
  let url = `${API_URL}/admin/events`
  if (queryString) {
    url = `${API_URL}/admin/events?${queryString}`
  }

  const response = await fetch(url, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch events")
  }

  return data
}
