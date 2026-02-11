import { API_URL } from "@/constants.js"
import { z } from "zod"

const paymentIntentIdSchema = z.string().trim().min(1)
const planIdSchema = z.string().trim().min(1)
const amountCentsSchema = z.number().int().positive()

const cartItemSchema = z.looseObject({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  priceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive().optional(),
  type: z.string().trim().min(1).optional(),
})

const feeSchema = z.looseObject({
  amountCents: z.number().int().nonnegative(),
})

const createFinancingPlanParamsSchema = z.object({
  paymentIntentId: paymentIntentIdSchema,
  cartItems: z.array(cartItemSchema).min(1),
  fees: z.array(feeSchema).optional(),
  cadence: z.string().trim().min(1),
  termCount: z.number().int().positive(),
})

/**
 * Create a financing plan from checkout (down payment already succeeded).
 * @param {object} params
 * @param {string} params.paymentIntentId
 * @param {Array<{id: string, name: string, priceCents: number, quantity?: number, type?: string}>} params.cartItems
 * @param {Array<{amountCents: number}>|undefined} params.fees
 * @param {string} params.cadence
 * @param {number} params.termCount
 * @returns {Promise<{ success: boolean, planId?: string, orderId?: string, error?: string }>}
 */
export const createFinancingPlan = async ({
  paymentIntentId,
  cartItems,
  fees,
  cadence,
  termCount,
}) => {
  const parsedParams = createFinancingPlanParamsSchema.safeParse({
    paymentIntentId,
    cartItems,
    fees,
    cadence,
    termCount,
  })
  if (!parsedParams.success) {
    return { success: false, error: "Invalid request" }
  }

  const response = await fetch(`${API_URL}/financing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      paymentIntentId: parsedParams.data.paymentIntentId,
      cartItems: parsedParams.data.cartItems,
      fees: parsedParams.data.fees,
      cadence: parsedParams.data.cadence,
      termCount: parsedParams.data.termCount,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return { success: false, error: data.error || "Failed to create plan" }
  }

  return { success: true, planId: data.planId, orderId: data.orderId }
}

/**
 * Fetch all financing plans for the current user.
 * @returns {Promise<any>}
 */
export const fetchFinancingPlans = async () => {
  const response = await fetch(`${API_URL}/financing`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch financing plans")
  }

  return data
}

/**
 * Fetch a single financing plan by id.
 * @param {string} planId
 * @returns {Promise<any>}
 */
export const fetchFinancingPlan = async (planId) => {
  const parsedPlanId = planIdSchema.safeParse(planId)
  if (!parsedPlanId.success) {
    throw new Error("Invalid planId")
  }

  const response = await fetch(`${API_URL}/financing/${parsedPlanId.data}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch financing plan")
  }

  return data
}

/**
 * Create a principal payment intent for a financing plan.
 * @param {object} params
 * @param {string} params.planId
 * @param {number} params.amountCents
 * @returns {Promise<{ clientSecret: string, paymentIntentId: string }>}
 */
export const createPrincipalPaymentIntent = async ({ planId, amountCents }) => {
  const parsedPlanId = planIdSchema.safeParse(planId)
  if (!parsedPlanId.success) {
    throw new Error("Invalid planId")
  }
  const parsedAmount = amountCentsSchema.safeParse(amountCents)
  if (!parsedAmount.success) {
    throw new Error("Invalid amountCents")
  }

  const response = await fetch(
    `${API_URL}/financing/${parsedPlanId.data}/principal-intent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amountCents: parsedAmount.data }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to create payment intent")
  }

  return data
}

/**
 * Record a succeeded principal payment on a financing plan.
 * @param {object} params
 * @param {string} params.planId
 * @param {string} params.paymentIntentId
 * @returns {Promise<any>}
 */
export const recordPrincipalPayment = async ({ planId, paymentIntentId }) => {
  const parsedPlanId = planIdSchema.safeParse(planId)
  if (!parsedPlanId.success) {
    throw new Error("Invalid planId")
  }
  const parsedPaymentIntentId = paymentIntentIdSchema.safeParse(paymentIntentId)
  if (!parsedPaymentIntentId.success) {
    throw new Error("Invalid paymentIntentId")
  }

  const response = await fetch(
    `${API_URL}/financing/${parsedPlanId.data}/principal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ paymentIntentId: parsedPaymentIntentId.data }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to record principal payment")
  }

  return data
}
