import { API_URL } from "@/constants.js"
import { z } from "zod"

const amountCentsSchema = z.number().int().positive()
const paymentIntentIdSchema = z.string().trim().min(1)

const cartItemSchema = z.looseObject({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  priceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive().optional(),
  type: z.string().trim().min(1).optional(),
  subscriptionInterval: z.string().trim().min(1).nullable().optional(),
})

/**
 * Create a Stripe payment intent
 * @param {number} amountCents - Amount in cents (integer)
 * @returns {Promise<{ clientSecret: string, paymentIntentId: string }>}
 */
export const createStripeIntent = async (amountCents) => {
  const parsedAmount = amountCentsSchema.safeParse(amountCents)
  if (!parsedAmount.success) {
    throw new Error("Invalid amountCents")
  }

  const response = await fetch(`${API_URL}/payments/stripe/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ amountCents: parsedAmount.data }),
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
  const parsedPaymentIntentId = paymentIntentIdSchema.safeParse(paymentIntentId)
  if (!parsedPaymentIntentId.success) {
    throw new Error("Invalid paymentIntentId")
  }

  const parsedCartItems = z.array(cartItemSchema).min(1).safeParse(cartItems)
  if (!parsedCartItems.success) {
    throw new Error("Invalid cartItems")
  }

  const response = await fetch(`${API_URL}/payments/stripe/confirm-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      paymentIntentId: parsedPaymentIntentId.data,
      cartItems: parsedCartItems.data.map((item) => ({
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity || 1,
        type: item.type || "item",
        subscriptionInterval: item.subscriptionInterval || null,
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

/**
 * Cancel a Stripe payment intent
 * @param {string} paymentIntentId
 * @returns {Promise<{ status: string }>}
 */
export const cancelStripeIntent = async (paymentIntentId) => {
  const parsedPaymentIntentId = paymentIntentIdSchema.safeParse(paymentIntentId)
  if (!parsedPaymentIntentId.success) {
    throw new Error("Invalid paymentIntentId")
  }

  const response = await fetch(`${API_URL}/payments/stripe/cancel-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ paymentIntentId: parsedPaymentIntentId.data }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || "Failed to cancel payment intent")
  }

  return data
}
