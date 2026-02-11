import Stripe from "stripe"
import { STRIPE_SECRET_KEY } from "../constants.js"

let stripeClient = null

const getStripeClient = () => {
  if (!stripeClient) {
    const secretKey = STRIPE_SECRET_KEY
    if (typeof secretKey !== "string" || secretKey.trim().length === 0) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    stripeClient = new Stripe(secretKey.trim())
  }

  return stripeClient
}

/**
 * Charge a Stripe customer off-session.
 * @param {object} params
 * @param {string} params.customerId
 * @param {string} params.paymentMethodId
 * @param {number} params.amountCents - Amount in cents (integer)
 * @param {string} [params.currency]
 * @param {string} [params.idempotencyKey]
 * @param {Record<string, string>|undefined} [params.metadata]
 * @returns {Promise<{ success: boolean, paymentIntentId?: string, error?: string }>}
 */
export const chargeStripePayment = async ({
  customerId,
  paymentMethodId,
  amountCents,
  currency = "usd",
  idempotencyKey,
  metadata,
}) => {
  if (!customerId) {
    return { success: false, error: "Missing Stripe customer ID" }
  }
  if (!paymentMethodId) {
    return { success: false, error: "Missing Stripe payment method ID" }
  }
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return { success: false, error: "Invalid charge amount" }
  }

  let paymentIntent = null
  try {
    paymentIntent = await getStripeClient().paymentIntents.create(
      {
        amount: amountCents,
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        metadata: metadata || undefined,
      },
      idempotencyKey ? { idempotencyKey } : undefined
    )
  } catch (error) {
    const message = error?.message || "Stripe charge failed"
    return { success: false, error: message }
  }

  if (!paymentIntent || paymentIntent.status !== "succeeded") {
    const status = paymentIntent?.status || "unknown"
    return { success: false, error: `Charge status: ${status}` }
  }

  return {
    success: true,
    paymentIntentId: paymentIntent.id,
  }
}
