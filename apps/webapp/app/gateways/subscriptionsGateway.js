import { API_URL } from "@/constants.js"

export const fetchSubscriptions = async () => {
  const response = await fetch(`${API_URL}/subscriptions`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch subscriptions")
  }

  return data
}

export const fetchSubscription = async (subscriptionId) => {
  const response = await fetch(`${API_URL}/subscriptions/${subscriptionId}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch subscription")
  }

  return data
}
