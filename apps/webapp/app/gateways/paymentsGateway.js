import { API_URL } from "@/constants.js"

/**
 * Create a Stripe payment intent
 * @param {number} amountCents - Amount in cents (integer)
 * @returns {Promise<{ clientSecret: string, paymentIntentId: string }>}
 */
export const createStripeIntent = async (amountCents) => {
  const response = await fetch(`${API_URL}/payments/stripe/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ amountCents }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || "Failed to initialize payment")
  }

  return response.json()
}

/**
 * Confirm a Stripe payment and create order record
 * @param {string} paymentIntentId
 * @param {Array<{id: string, name: string, priceCents: number, quantity: number, type?: string}>} cartItems
 * @returns {Promise<{ success: boolean, orderId?: string, status?: string, warning?: string }>}
 */
export const confirmStripePayment = async (paymentIntentId, cartItems) => {
  const response = await fetch(`${API_URL}/payments/stripe/confirm-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      paymentIntentId,
      cartItems: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity || 1,
        type: item.type || (item.id === "demo-service" ? "service" : "item"),
      })),
    }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    console.error("Order recording failed:", data.error)
    return {
      success: true,
      orderId: null,
      warning:
        "Payment was successful, but we had trouble recording your order. " +
        "Please contact support with your payment confirmation.",
    }
  }

  const { orderId, status } = await response.json()
  return { success: true, orderId, status }
}
