import prisma from "@ballast/shared/src/db/client.js"
import { createRefund as createStripeRefund } from "@/gateways/stripeGateway.js"
import { recordSystemEvent } from "@/lib/systemEvents.js"

export const normalizeRefundStatus = (value) => {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  const allowed = new Set(["pending", "approved", "rejected", "failed"])

  if (!allowed.has(normalized)) {
    return null
  }

  return normalized
}

const normalizePositiveInteger = (value) => {
  if (typeof value !== "number") {
    return null
  }
  if (!Number.isFinite(value)) {
    return null
  }
  if (!Number.isInteger(value)) {
    return null
  }
  if (value <= 0) {
    return null
  }
  return value
}

const getOrderRemainingRefundableCents = (order) => {
  const remaining = order.amountCents - order.refundedAmountCents
  if (remaining < 0) {
    return 0
  }
  return remaining
}

/**
 * List refund requests for admin UI.
 * @param {object} params
 * @param {string|undefined} [params.status]
 * @param {number} [params.limit=25]
 * @param {number} [params.offset=0]
 * @param {string} [params.userId]
 * @returns {Promise<{ refunds: Array<object>, total: number, hasMore: boolean }>}
 */
export const listRefundRequests = async ({
  status,
  limit = 25,
  offset = 0,
  userId,
}) => {
  const whereClause = {}

  const normalizedStatus = normalizeRefundStatus(status)
  if (normalizedStatus) {
    whereClause.status = normalizedStatus
  }

  if (typeof userId === "string" && userId.trim()) {
    whereClause.requestedBy = userId.trim()
  }

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        reason: true,
        amountCents: true,
        currency: true,
        processorRefundId: true,
        createdAt: true,
        updatedAt: true,
        order: {
          select: {
            id: true,
            amountCents: true,
            currency: true,
            processor: true,
            refundedAmountCents: true,
            refundStatus: true,
            status: true,
            createdAt: true,
          },
        },
        requestedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.refund.count({
      where: whereClause,
    }),
  ])

  return {
    refunds,
    total,
    hasMore: offset + refunds.length < total,
  }
}

/**
 * Get a single refund request with related context for admin UI.
 * Includes: order details + items, other refunds for same order, and recent refunds for same user.
 * @param {string} refundId
 * @returns {Promise<{ success: boolean, refund?: object, error?: string }>}
 */
export const getRefundRequestById = async (refundId) => {
  if (!refundId) {
    return { success: false, error: "Refund ID is required" }
  }

  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: {
      order: {
        include: {
          items: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      requestedByUser: {
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          archivedAt: true,
          bannedAt: true,
          stripeCustomerId: true,
          braintreeCustomerId: true,
          squareCustomerId: true,
          authorizeCustomerId: true,
        },
      },
      processedByUser: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  })

  if (!refund) {
    return { success: false, error: "Refund request not found" }
  }

  const [orderRefunds, userRefundsTotal, userRefundsOther, userOrdersTotal] =
    await Promise.all([
      prisma.refund.findMany({
        where: { orderId: refund.orderId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.refund.count({
        where: { requestedBy: refund.requestedBy },
      }),
      prisma.refund.findMany({
        where: {
          requestedBy: refund.requestedBy,
          id: { not: refund.id },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          order: {
            select: {
              id: true,
              amountCents: true,
              currency: true,
              processor: true,
              status: true,
              refundedAmountCents: true,
              refundStatus: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.order.count({
        where: { userId: refund.requestedBy },
      }),
    ])

  const orderRemainingRefundableCents = getOrderRemainingRefundableCents(
    refund.order
  )

  return {
    success: true,
    refund: {
      ...refund,
      context: {
        orderRemainingRefundableCents,
        orderRefunds,
        userRefundsTotal,
        userRefundsOther,
        userOrdersTotal,
      },
    },
  }
}

/**
 * Approve and process a pending refund request.
 * IMPORTANT: This triggers the actual payment processor refund.
 * @param {object} params
 * @param {string} params.refundId
 * @param {string} params.adminUserId
 * @param {number} params.amountCents
 * @returns {Promise<{ success: boolean, refund?: object, order?: object, processorResult?: object, error?: string }>}
 */
export const approveRefundRequest = async ({
  refundId,
  adminUserId,
  amountCents,
}) => {
  if (!refundId) {
    return { success: false, error: "Refund ID is required" }
  }
  if (!adminUserId) {
    return { success: false, error: "Admin user ID is required" }
  }

  const normalizedAmountCents = normalizePositiveInteger(amountCents)
  if (normalizedAmountCents === null) {
    return { success: false, error: "amountCents must be a positive integer" }
  }

  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: {
      order: {
        include: {
          items: {
            select: { name: true, quantity: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      requestedByUser: { select: { id: true, email: true } },
    },
  })

  if (!refund) {
    return { success: false, error: "Refund request not found" }
  }

  if (refund.status !== "pending") {
    return {
      success: false,
      error: "Only pending refund requests can be approved",
    }
  }

  if (refund.order.status !== "succeeded") {
    return { success: false, error: "Only succeeded orders can be refunded" }
  }

  const remainingRefundableCents = getOrderRemainingRefundableCents(
    refund.order
  )
  if (remainingRefundableCents <= 0) {
    return {
      success: false,
      error: "This order has already been fully refunded",
    }
  }

  if (normalizedAmountCents > remainingRefundableCents) {
    return {
      success: false,
      error: "Refund amount exceeds remaining refundable amount",
    }
  }

  const approvedUpdateResult = await prisma.refund.updateMany({
    where: { id: refundId, status: "pending" },
    data: {
      status: "approved",
      amountCents: normalizedAmountCents,
      currency: refund.order.currency,
      processedBy: adminUserId,
    },
  })

  if (approvedUpdateResult.count !== 1) {
    return {
      success: false,
      error: "Refund request is no longer pending",
    }
  }

  await prisma.order.update({
    where: { id: refund.orderId },
    data: { refundStatus: null },
  })

  try {
    if (refund.order.processor === "STRIPE") {
      const stripeRefund = await createStripeRefund(
        refund.order.processorPaymentId,
        normalizedAmountCents
      )

      const processedRefund = await prisma.$transaction(async (transaction) => {
        const updatedRefund = await transaction.refund.update({
          where: { id: refundId },
          data: {
            status: "approved",
            processorRefundId: stripeRefund.id,
            amountCents: stripeRefund.amount,
          },
          include: {
            requestedByUser: {
              select: {
                email: true,
              },
            },
          },
        })

        const updatedOrder = await transaction.order.update({
          where: { id: refund.orderId },
          data: {
            refundedAmountCents: {
              increment: stripeRefund.amount,
            },
          },
        })

        return { updatedRefund, updatedOrder }
      })

      return {
        success: true,
        refund: processedRefund.updatedRefund,
        order: processedRefund.updatedOrder,
        processorResult: {
          processor: "STRIPE",
          processorRefundId: stripeRefund.id,
          amountCents: stripeRefund.amount,
          status: stripeRefund.status,
        },
      }
    }

    await prisma.refund.update({
      where: { id: refundId },
      data: { status: "failed" },
    })

    let orderItemName = null
    let orderItemCount = 0
    if (refund.order && Array.isArray(refund.order.items)) {
      if (
        refund.order.items[0] &&
        typeof refund.order.items[0].name === "string"
      ) {
        orderItemName = refund.order.items[0].name
      }
      for (const item of refund.order.items) {
        let quantity = 1
        if (typeof item.quantity === "number" && item.quantity > 0) {
          quantity = item.quantity
        }
        orderItemCount += quantity
      }
    }

    await recordSystemEvent({
      eventType: "refund.failed",
      entityType: "refund",
      entityId: refund.id,
      payload: {
        refundId: refund.id,
        orderId: refund.orderId,
        adminUserId,
        reason: "unsupported_processor",
        orderItemName,
        orderItemCount,
      },
    })

    return {
      success: false,
      error: "Unsupported payment processor for refunds",
    }
  } catch (error) {
    console.error("Approve refund request error:", error)

    await prisma.refund.update({
      where: { id: refundId },
      data: { status: "failed" },
    })

    let orderId = null
    if (refund && refund.orderId) {
      orderId = refund.orderId
    }

    let errorMessage = null
    if (error && error.message) {
      errorMessage = error.message
    }

    let orderItemName = null
    let orderItemCount = 0
    if (refund && refund.order && Array.isArray(refund.order.items)) {
      if (
        refund.order.items[0] &&
        typeof refund.order.items[0].name === "string"
      ) {
        orderItemName = refund.order.items[0].name
      }
      for (const item of refund.order.items) {
        let quantity = 1
        if (typeof item.quantity === "number" && item.quantity > 0) {
          quantity = item.quantity
        }
        orderItemCount += quantity
      }
    }

    await recordSystemEvent({
      eventType: "refund.failed",
      entityType: "refund",
      entityId: refundId,
      payload: {
        refundId,
        orderId,
        adminUserId,
        reason: "processor_error",
        message: errorMessage,
        orderItemName,
        orderItemCount,
      },
    })

    return {
      success: false,
      error: error?.message || "Failed to process refund",
    }
  }
}

/**
 * Deny a pending refund request.
 * @param {object} params
 * @param {string} params.refundId
 * @param {string} params.adminUserId
 * @returns {Promise<{ success: boolean, refund?: object, error?: string }>}
 */
export const denyRefundRequest = async ({ refundId, adminUserId }) => {
  if (!refundId) {
    return { success: false, error: "Refund ID is required" }
  }
  if (!adminUserId) {
    return { success: false, error: "Admin user ID is required" }
  }

  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    select: {
      id: true,
      status: true,
      orderId: true,
      requestedByUser: { select: { id: true, email: true } },
    },
  })

  if (!refund) {
    return { success: false, error: "Refund request not found" }
  }

  if (refund.status !== "pending") {
    return {
      success: false,
      error: "Only pending refund requests can be denied",
    }
  }

  const result = await prisma.$transaction(async (transaction) => {
    const updatedRefund = await transaction.refund.update({
      where: { id: refundId },
      data: {
        status: "rejected",
        processedBy: adminUserId,
      },
      include: {
        requestedByUser: {
          select: {
            email: true,
          },
        },
      },
    })

    await transaction.order.update({
      where: { id: refund.orderId },
      data: { refundStatus: null },
    })

    return updatedRefund
  })

  return { success: true, refund: result }
}
