import { API_URL } from "@/constants.js"

export const fetchOrders = async ({ limit, offset, userId } = {}) => {
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
  let url = `${API_URL}/admin/orders`
  if (queryString) {
    url = `${API_URL}/admin/orders?${queryString}`
  }

  const response = await fetch(url, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch orders")
  }

  return data
}

export const fetchOrderById = async (orderId) => {
  const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch order")
  }

  return data
}

export const fetchOrderStats = async ({ userId } = {}) => {
  const params = new URLSearchParams()
  if (typeof userId === "string" && userId.trim()) {
    params.append("userId", userId.trim())
  }

  const queryString = params.toString()
  let url = `${API_URL}/admin/orders/stats`
  if (queryString) {
    url = `${API_URL}/admin/orders/stats?${queryString}`
  }

  const response = await fetch(url, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch order stats")
  }

  return data
}

export const fetchOrderGrowth = async ({ range, userId } = {}) => {
  const params = new URLSearchParams()
  if (typeof range === "string" && range.trim()) {
    params.append("range", range.trim())
  }
  if (typeof userId === "string" && userId.trim()) {
    params.append("userId", userId.trim())
  }

  const queryString = params.toString()
  let url = `${API_URL}/admin/orders/growth`
  if (queryString) {
    url = `${API_URL}/admin/orders/growth?${queryString}`
  }

  const response = await fetch(url, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch order growth")
  }

  return data
}
