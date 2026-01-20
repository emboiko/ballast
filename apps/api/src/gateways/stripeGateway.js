import Stripe from "stripe"
import prisma from "@ballast/shared/src/db/client.js"
import { STRIPE_SECRET_KEY } from "@/constants.js"

let stripe = null

const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(STRIPE_SECRET_KEY)
  }
  return stripe
}

/**
 * Get or create a Stripe customer for a user.
 * @param {string} userId
 * @param {string} email
 * @returns {Promise<string>} Stripe customer ID
 */
export const getOrCreateCustomer = async (userId, email) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  let customer
  try {
    customer = await getStripe().customers.create({
      email,
      metadata: { userId },
    })
  } catch (error) {
    console.error("Stripe customer creation failed:", error)
    throw new Error("Failed to create payment profile")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

/**
 * Create a payment intent for collecting payment.
 * @param {string} customerId - Stripe customer ID
 * @param {number} amountCents - Amount in cents
 * @param {string} [currency="usd"]
 * @returns {Promise<{ clientSecret: string, paymentIntentId: string }>}
 */
export const createPaymentIntent = async (
  customerId,
  amountCents,
  currency = "usd"
) => {
  if (amountCents <= 0) {
    throw new Error("Amount must be greater than zero")
  }

  let paymentIntent
  try {
    paymentIntent = await getStripe().paymentIntents.create({
      customer: customerId,
      amount: amountCents,
      currency,
      payment_method_types: ["card"],
    })
  } catch (error) {
    console.error("Stripe payment intent creation failed:", error)
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      throw new Error(`Invalid payment request: ${error.message}`)
    }
    throw new Error("Failed to initialize payment")
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  }
}

/**
 * Confirm a payment intent and create an order record.
 * Called after client-side confirmation succeeds.
 * @param {string} userId
 * @param {string} paymentIntentId
 * @param {Array<{id: string, name: string, priceCents: number, quantity: number, type?: string}>} cartItems
 * @returns {Promise<{ id: string, status: string, isNew: boolean }>}
 */
export const confirmPaymentIntent = async (
  userId,
  paymentIntentId,
  cartItems = []
) => {
  // Retrieve the payment intent to verify its status
  let paymentIntent
  try {
    paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error("Failed to retrieve payment intent:", error)
    throw new Error("Payment not found")
  }

  // Defense-in-depth: verify the payment actually succeeded
  // (Client should have already verified this, but we double-check)
  if (paymentIntent.status !== "succeeded") {
    throw new Error(
      `Cannot record order: payment status is "${paymentIntent.status}", expected "succeeded"`
    )
  }

  // Check if order already exists (idempotency)
  const existingOrder = await prisma.order.findUnique({
    where: { processorPaymentId: paymentIntentId },
  })

  if (existingOrder) {
    return { id: existingOrder.id, status: existingOrder.status, isNew: false }
  }

  // Create the order record with items
  const order = await prisma.order.create({
    data: {
      userId,
      processor: "STRIPE",
      processorPaymentId: paymentIntentId,
      amountCents: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "succeeded",
      items: {
        create: cartItems.map((item) => ({
          itemId: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity || 1,
          type: item.type || (item.id === "demo-service" ? "service" : "item"),
        })),
      },
    },
  })

  return { id: order.id, status: order.status, isNew: true }
}

/**
 * Get payment method details from a payment intent.
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<{ brand: string, last4: string, expMonth: number, expYear: number } | null>}
 */
export const getPaymentMethodDetails = async (paymentIntentId) => {
  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["payment_method"],
      }
    )

    if (!paymentIntent.payment_method) {
      return null
    }

    // If payment_method is expanded, it's an object, otherwise we need to retrieve it
    let paymentMethod
    if (typeof paymentIntent.payment_method === "string") {
      paymentMethod = await getStripe().paymentMethods.retrieve(
        paymentIntent.payment_method
      )
    } else {
      paymentMethod = paymentIntent.payment_method
    }

    if (paymentMethod.type !== "card" || !paymentMethod.card) {
      return null
    }

    return {
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
    }
  } catch (error) {
    console.error("Failed to retrieve payment method details:", error)
    return null
  }
}

/**
 * Create a refund via Stripe API.
 * For admin panel use - processes the actual refund.
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {number} amountCents - Amount to refund in cents (optional, defaults to full refund)
 * @returns {Promise<{ id: string, amount: number, status: string }>}
 */
export const createRefund = async (paymentIntentId, amountCents = null) => {
  try {
    // Retrieve the payment intent to get the charge ID
    const paymentIntent =
      await getStripe().paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      throw new Error(
        `Cannot refund payment intent with status "${paymentIntent.status}"`
      )
    }

    // Get the charge ID from the payment intent
    const chargeId =
      typeof paymentIntent.latest_charge === "string"
        ? paymentIntent.latest_charge
        : paymentIntent.latest_charge?.id

    if (!chargeId) {
      throw new Error("No charge found for this payment intent")
    }

    // Create the refund
    const refundParams = {
      charge: chargeId,
    }

    if (amountCents !== null && amountCents > 0) {
      refundParams.amount = amountCents
    }

    const refund = await getStripe().refunds.create(refundParams)

    return {
      id: refund.id,
      amount: refund.amount,
      status: refund.status,
    }
  } catch (error) {
    console.error("Stripe refund creation failed:", error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Refund failed: ${error.message}`)
    }
    throw new Error("Failed to process refund")
  }
}

export { getStripe }
