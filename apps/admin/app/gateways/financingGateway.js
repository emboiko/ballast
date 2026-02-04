import { API_URL } from "@/constants.js"

export const fetchFinancingPlans = async ({ limit, offset, userId } = {}) => {
  const params = new URLSearchParams()

  if (typeof userId === "string" && userId.trim()) {
    params.append("userId", userId.trim())
  }
  if (typeof limit === "number") {
    params.append("limit", String(limit))
  }
  if (typeof offset === "number") {
    params.append("offset", String(offset))
  }

  const queryString = params.toString()
  let url = `${API_URL}/admin/financing`
  if (queryString) {
    url = `${API_URL}/admin/financing?${queryString}`
  }

  const response = await fetch(url, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch financing plans")
  }

  return data
}

export const fetchFinancingPlanById = async (planId) => {
  const response = await fetch(`${API_URL}/admin/financing/${planId}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch financing plan")
  }

  return data
}
