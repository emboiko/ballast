import {
  getOrCreateCustomer,
  createPaymentIntent,
  confirmPaymentIntent,
  cancelPaymentIntent,
} from "../gateways/stripeGateway.js"
import prisma from "../../../../packages/shared/src/db/client.js"
import { formatMoney } from "../../../../packages/shared/src/money.js"
import { sendOrderConfirmationEmail } from "../gateways/emailGateway.js"
import { recordSystemEvent } from "./systemEvents.js"
import { createServiceSubscriptionsFromOrder } from "./subscriptions.js"

/**
 * Create a Stripe payment intent
 * @param {string} userId
 * @param {string} email
 * @param {number} amountCents - Amount in cents (integer)
 * @returns {Promise<{ success: boolean, clientSecret?: string, paymentIntentId?: string, error?: string }>}
 */
export const createStripeIntent = async (userId, email, amountCents) => {
  if (
    !amountCents ||
    typeof amountCents !== "number" ||
    !Number.isInteger(amountCents) ||
    amountCents <= 0
  ) {
    return {
      success: false,
      error: "Valid amount in cents is required",
    }
  }

  try {
    const customerId = await getOrCreateCustomer(userId, email)
    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      customerId,
      amountCents
    )

    return {
      success: true,
      clientSecret,
      paymentIntentId,
    }
  } catch (error) {
    console.error("Create payment intent error:", error)
    return {
      success: false,
      error: "Failed to create payment intent",
    }
  }
}

/**
 * Confirm a Stripe payment and create order record
 * @param {string} userId
 * @param {string} paymentIntentId
 * @param {Array} cartItems
 * @returns {Promise<{ success: boolean, order?: { id: string, status: string }, error?: string }>}
 */
export const confirmStripePayment = async (
  userId,
  paymentIntentId,
  cartItems
) => {
  if (!paymentIntentId || typeof paymentIntentId !== "string") {
    return {
      success: false,
      error: "Payment intent ID is required",
    }
  }

  try {
    const order = await confirmPaymentIntent(userId, paymentIntentId, cartItems)

    if (order.status === "succeeded") {
      const subscriptionResult = await createServiceSubscriptionsFromOrder({
        userId,
        orderId: order.id,
        paymentIntentId,
      })

      if (!subscriptionResult.success) {
        return {
          success: false,
          error: subscriptionResult.error || "Failed to create subscription",
        }
      }
    }

    if (order.isNew && order.status === "succeeded") {
      const orderWithDetails = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          user: { select: { email: true } },
          items: { orderBy: { createdAt: "asc" } },
        },
      })

      if (orderWithDetails) {
        let orderItemName = null
        let orderItemCount = 0
        if (Array.isArray(orderWithDetails.items)) {
          const firstItem = orderWithDetails.items[0]
          if (firstItem && typeof firstItem.name === "string") {
            orderItemName = firstItem.name
          }

          for (const item of orderWithDetails.items) {
            let quantity = 1
            if (typeof item.quantity === "number" && item.quantity > 0) {
              quantity = item.quantity
            }
            orderItemCount += quantity
          }
        }

        await recordSystemEvent({
          eventType: "order.succeeded",
          entityType: "order",
          entityId: orderWithDetails.id,
          payload: {
            orderId: orderWithDetails.id,
            amountCents: orderWithDetails.amountCents,
            currency: orderWithDetails.currency,
            processor: orderWithDetails.processor,
            userId: orderWithDetails.userId,
            orderItemName,
            orderItemCount,
          },
        })
      }

      if (orderWithDetails?.user?.email) {
        const itemsForEmail = (orderWithDetails.items || []).map((item) => {
          const quantity =
            typeof item.quantity === "number" && item.quantity > 0
              ? item.quantity
              : 1
          const lineTotalCents = item.priceCents * quantity

          return {
            name: item.name,
            quantity,
            formattedUnitPrice: formatMoney(item.priceCents),
            formattedLineTotal: formatMoney(lineTotalCents),
          }
        })

        await sendOrderConfirmationEmail({
          to: orderWithDetails.user.email,
          orderId: orderWithDetails.id,
          formattedTotal: formatMoney(orderWithDetails.amountCents),
          items: itemsForEmail,
        })
      }
    }

    return {
      success: true,
      order: { id: order.id, status: order.status },
    }
  } catch (error) {
    console.error("Confirm payment error:", error)
    return {
      success: false,
      error: error.message || "Failed to confirm payment",
    }
  }
}

/**
 * Cancel a Stripe payment intent
 * @param {string} paymentIntentId
 * @returns {Promise<{ success: boolean, status?: string, error?: string }>}
 */
export const cancelStripeIntent = async (paymentIntentId) => {
  if (!paymentIntentId || typeof paymentIntentId !== "string") {
    return {
      success: false,
      error: "Payment intent ID is required",
    }
  }

  try {
    const result = await cancelPaymentIntent(paymentIntentId)
    return { success: true, status: result.status }
  } catch (error) {
    console.error("Cancel payment intent error:", error)
    return {
      success: false,
      error: error.message || "Failed to cancel payment intent",
    }
  }
}
