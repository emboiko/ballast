import { API_URL } from "@/constants.js"
import { z } from "zod"

const cartItemSchema = z.looseObject({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  priceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive().optional(),
  type: z.string().trim().min(1).optional(),
})

/**
 * Fetch cart fees from the API
 * @param {Array<{id: string, name: string, priceCents: number, quantity: number, type?: string}>} cartItems
 * @param {string|undefined} userAgent
 * @returns {Promise<{ fees: Array<{ id: string, label: string, amountCents: number }> }>}
 */
export const fetchCartFees = async (cartItems, userAgent) => {
  const parsedCartItems = z.array(cartItemSchema).min(1).safeParse(cartItems)
  if (!parsedCartItems.success) {
    throw new Error("Invalid cartItems")
  }

  const parsedUserAgent = z
    .string()
    .trim()
    .min(1)
    .optional()
    .safeParse(userAgent)
  if (!parsedUserAgent.success) {
    throw new Error("Invalid userAgent")
  }

  const response = await fetch(`${API_URL}/fees/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      cartItems: parsedCartItems.data.map((item) => {
        return {
          id: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity || 1,
          type: item.type,
        }
      }),
      userAgent: parsedUserAgent.data,
    }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || "Failed to fetch cart fees")
  }

  return response.json()
}
