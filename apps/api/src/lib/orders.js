import prisma from "../../../../packages/shared/src/db/client.js"
import { getPaymentMethodDetails } from "../gateways/stripeGateway.js"
import { sendRefundRequestReceivedEmail } from "../gateways/emailGateway.js"
import { recordSystemEvent } from "./systemEvents.js"

/**
 * @typedef {Object} FetchOrdersOptions
 * @property {number} [limit] - Maximum number of orders to return
 * @property {number} [offset] - Number of orders to skip
 */

/**
 * @typedef {Object} FetchOrdersResult
 * @property {Array} orders - The list of orders
 * @property {boolean} hasMore - Whether there are more orders to load
 * @property {number} total - Total number of orders for this user
 */

/**
 * Fetch orders for a user with optional pagination
 * @param {string} userId
 * @param {FetchOrdersOptions} [options={}]
 * @returns {Promise<FetchOrdersResult>}
 */
export const fetchOrders = async (userId, options = {}) => {
  const { limit, offset = 0 } = options

  const total = await prisma.order.count({
    where: { userId },
  })

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    ...(limit !== undefined && { take: limit }),
    ...(offset > 0 && { skip: offset }),
  })

  const hasMore = limit !== undefined ? offset + orders.length < total : false

  return { orders, hasMore, total }
}

/**
 * Fetch a specific order with details
 * @param {string} orderId
 * @param {string} userId
 * @returns {Promise<{ order: object | null, error?: string }>}
 */
export const fetchOrder = async (orderId, userId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      refunds: {
        orderBy: { createdAt: "desc" },
      },
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!order) {
    return { order: null, error: "Order not found" }
  }

  let paymentMethod = null
  if (order.processor === "STRIPE") {
    paymentMethod = await getPaymentMethodDetails(order.processorPaymentId)
  }

  return {
    order: {
      ...order,
      paymentMethod,
    },
  }
}

/**
 * Create a refund request for an order
 * @param {string} orderId
 * @param {string} userId
 * @param {string|null} reason
 * @returns {Promise<{ success: boolean, refund?: object, message?: string, error?: string }>}
 */
export const createRefundRequest = async (orderId, userId, reason = null) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      items: {
        select: {
          name: true,
          quantity: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!order) {
    return { success: false, error: "Order not found" }
  }

  if (order.status !== "succeeded") {
    return {
      success: false,
      error: "Only succeeded orders can be refunded",
    }
  }

  const existingPendingRefund = await prisma.refund.findFirst({
    where: {
      orderId: order.id,
      status: "pending",
    },
  })

  if (existingPendingRefund) {
    return {
      success: false,
      error: "A refund request is already pending for this order",
    }
  }

  if (order.refundedAmountCents >= order.amountCents) {
    return {
      success: false,
      error: "This order has already been fully refunded",
    }
  }

  const refund = await prisma.refund.create({
    data: {
      orderId: order.id,
      status: "pending",
      reason: reason || null,
      requestedBy: userId,
    },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { refundStatus: "pending" },
  })

  let orderItemName = null
  let orderItemCount = 0
  if (Array.isArray(order.items)) {
    if (order.items[0] && typeof order.items[0].name === "string") {
      orderItemName = order.items[0].name
    }

    for (const item of order.items) {
      let quantity = 1
      if (typeof item.quantity === "number" && item.quantity > 0) {
        quantity = item.quantity
      }
      orderItemCount += quantity
    }
  }

  await recordSystemEvent({
    eventType: "refund.requested",
    entityType: "refund",
    entityId: refund.id,
    payload: {
      refundId: refund.id,
      orderId: order.id,
      userId,
      orderItemName,
      orderItemCount,
    },
  })

  if (order.user?.email) {
    await sendRefundRequestReceivedEmail({
      to: order.user.email,
      orderId: order.id,
    })
  }

  return {
    success: true,
    refund: {
      id: refund.id,
      status: refund.status,
      reason: refund.reason,
      createdAt: refund.createdAt,
    },
    message: "Refund request submitted successfully",
  }
}
