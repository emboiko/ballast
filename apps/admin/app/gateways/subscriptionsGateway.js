import { API_URL } from "@/constants.js"

export const fetchSubscriptions = async ({
  limit,
  offset,
  userId,
  status,
} = {}) => {
  const params = new URLSearchParams()

  if (typeof userId === "string" && userId.trim()) {
    params.append("userId", userId.trim())
  }
  if (typeof status === "string" && status.trim()) {
    params.append("status", status.trim())
  }
  if (typeof limit === "number") {
    params.append("limit", String(limit))
  }
  if (typeof offset === "number") {
    params.append("offset", String(offset))
  }

  const queryString = params.toString()
  let url = `${API_URL}/admin/subscriptions`
  if (queryString) {
    url = `${API_URL}/admin/subscriptions?${queryString}`
  }

  const response = await fetch(url, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch subscriptions")
  }

  return data
}

export const fetchSubscriptionById = async (subscriptionId) => {
  const response = await fetch(
    `${API_URL}/admin/subscriptions/${subscriptionId}`,
    {
      credentials: "include",
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch subscription")
  }

  return data
}
