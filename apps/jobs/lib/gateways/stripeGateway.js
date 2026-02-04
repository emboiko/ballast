import Stripe from "stripe"
import { loadEnv } from "../../../../packages/shared/src/config/env.js"

let stripeClient = null

const getStripeClient = () => {
  if (!stripeClient) {
    loadEnv()
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    stripeClient = new Stripe(secretKey)
  }

  return stripeClient
}

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
