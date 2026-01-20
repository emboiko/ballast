import { API_URL } from "@/constants.js"

/**
 * Fetch cart fees from the API
 * @param {Array<{id: string, name: string, priceCents: number, quantity: number, type?: string}>} cartItems
 * @param {string|undefined} userAgent
 * @returns {Promise<{ fees: Array<{ id: string, label: string, amountCents: number }> }>}
 */
export const fetchCartFees = async (cartItems, userAgent) => {
  const response = await fetch(`${API_URL}/fees/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      cartItems: cartItems.map((item) => {
        return {
          id: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity || 1,
          type: item.type,
        }
      }),
      userAgent,
    }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch cart fees")
  }

  return response.json()
}
