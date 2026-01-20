import { API_URL } from "@/constants.js"

/**
 * @typedef {Object} FetchOrdersOptions
 * @property {number} [limit] - Maximum number of orders to return
 * @property {number} [offset] - Number of orders to skip
 */

/**
 * @typedef {Object} FetchOrdersResponse
 * @property {Array} orders - The list of orders
 * @property {boolean} hasMore - Whether there are more orders to load
 * @property {number} total - Total number of orders
 */

/**
 * Fetch orders for the authenticated user with optional pagination
 * @param {FetchOrdersOptions} [options={}]
 * @returns {Promise<FetchOrdersResponse>}
 */
export const fetchOrders = async (options = {}) => {
  const { limit, offset } = options
  const params = new URLSearchParams()

  if (limit !== undefined) {
    params.append("limit", String(limit))
  }
  if (offset !== undefined) {
    params.append("offset", String(offset))
  }

  const queryString = params.toString()
  const url = queryString
    ? `${API_URL}/orders?${queryString}`
    : `${API_URL}/orders`

  const response = await fetch(url, {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch orders")
  }

  return response.json()
}

/**
 * Fetch a specific order by ID
 * @param {string} orderId
 * @returns {Promise<{ order: object }>}
 */
export const fetchOrder = async (orderId) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    credentials: "include",
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Order not found")
    }
    throw new Error("Failed to fetch order")
  }

  return response.json()
}

/**
 * Request a refund for an order
 * @param {string} orderId
 * @param {string|null} reason
 * @returns {Promise<{ success: boolean, refund?: object, message?: string, error?: string }>}
 */
export const requestRefund = async (orderId, reason = null) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reason: reason || null }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to submit refund request")
  }

  return {
    success: true,
    refund: data.refund,
    message: data.message,
  }
}
