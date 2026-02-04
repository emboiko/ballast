import prisma from "../../../../../packages/shared/src/db/client.js"
import {
  addUtcDays,
  addUtcMonths,
  toUtcDayStart,
  toUtcMonthStart,
} from "../utils/dateBuckets.js"

/**
 * List orders for admin UI with optional filtering.
 * @param {object} params
 * @param {number} [params.limit=25]
 * @param {number} [params.offset=0]
 * @param {string} [params.userId]
 * @returns {Promise<{ orders: Array<object>, total: number, hasMore: boolean }>}
 */
export const listOrders = async ({ limit = 25, offset = 0, userId } = {}) => {
  const whereClause = {}

  if (typeof userId === "string" && userId.trim().length > 0) {
    whereClause.userId = userId.trim()
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        amountCents: true,
        currency: true,
        status: true,
        processor: true,
        processorPaymentId: true,
        refundStatus: true,
        refundedAmountCents: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        financingPlan: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            refunds: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({
      where: whereClause,
    }),
  ])

  const mappedOrders = orders.map((order) => {
    return {
      ...order,
      refundCount: order._count?.refunds ?? 0,
      _count: undefined,
    }
  })

  return {
    orders: mappedOrders,
    total,
    hasMore: offset + mappedOrders.length < total,
  }
}

/**
 * Get a single order with related details.
 * @param {string} orderId
 * @returns {Promise<{ success: boolean, order?: object, error?: string }>}
 */
export const getOrderById = async (orderId) => {
  if (!orderId) {
    return { success: false, error: "Order ID is required" }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          archivedAt: true,
          bannedAt: true,
        },
      },
      financingPlan: {
        select: {
          id: true,
          status: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
      },
      refunds: {
        orderBy: { createdAt: "desc" },
        include: {
          requestedByUser: {
            select: {
              id: true,
              email: true,
            },
          },
          processedByUser: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!order) {
    return { success: false, error: "Order not found" }
  }

  return { success: true, order }
}

/**
 * Get aggregate stats for orders.
 * @returns {Promise<{ success: boolean, stats?: object, error?: string }>}
 */
export const getOrderStats = async ({ userId } = {}) => {
  const whereClause = {}
  if (typeof userId === "string" && userId.trim().length > 0) {
    whereClause.userId = userId.trim()
  }

  const refundWhere = { status: "pending" }
  if (whereClause.userId) {
    refundWhere.requestedBy = whereClause.userId
  }

  const [
    totalOrders,
    succeededOrders,
    pendingOrders,
    failedOrders,
    totalAmount,
    totalRefundedAmount,
    pendingRefundRequests,
  ] = await Promise.all([
    prisma.order.count({ where: whereClause }),
    prisma.order.count({ where: { ...whereClause, status: "succeeded" } }),
    prisma.order.count({ where: { ...whereClause, status: "pending" } }),
    prisma.order.count({ where: { ...whereClause, status: "failed" } }),
    prisma.order.aggregate({
      where: whereClause,
      _sum: { amountCents: true },
    }),
    prisma.order.aggregate({
      where: whereClause,
      _sum: { refundedAmountCents: true },
    }),
    prisma.refund.count({ where: refundWhere }),
  ])

  return {
    success: true,
    stats: {
      totalOrders,
      succeededOrders,
      pendingOrders,
      failedOrders,
      totalAmountCents: totalAmount._sum.amountCents ?? 0,
      refundedAmountCents: totalRefundedAmount._sum.refundedAmountCents ?? 0,
      pendingRefundRequests,
    },
  }
}

/**
 * Get growth buckets for orders over different time ranges.
 * @param {object} options
 * @param {"week"|"month"|"year"|"all"} options.range
 * @returns {Promise<{ success: boolean, range?: string, buckets?: Array<{ label: string, start: string, end: string, newOrders: number, totalOrdersToDate: number }>, error?: string }>}
 */
export const getOrderGrowth = async ({ range, userId }) => {
  const allowedRanges = new Set(["week", "month", "year", "all"])
  if (!allowedRanges.has(range)) {
    return { success: false, error: "Invalid range" }
  }

  const now = new Date()
  let userFilter = null
  if (typeof userId === "string" && userId.trim().length > 0) {
    userFilter = userId.trim()
  }

  let bucketUnit = "day"
  let bucketCount = 7
  let rangeStart = toUtcDayStart(now)
  let rangeEndExclusive = addUtcDays(rangeStart, 1)

  if (range === "week") {
    bucketUnit = "day"
    bucketCount = 7
    rangeEndExclusive = addUtcDays(toUtcDayStart(now), 1)
    rangeStart = addUtcDays(rangeEndExclusive, -bucketCount)
  }

  if (range === "month") {
    bucketUnit = "day"
    bucketCount = 30
    rangeEndExclusive = addUtcDays(toUtcDayStart(now), 1)
    rangeStart = addUtcDays(rangeEndExclusive, -bucketCount)
  }

  if (range === "year") {
    bucketUnit = "month"
    bucketCount = 12
    rangeEndExclusive = addUtcMonths(toUtcMonthStart(now), 1)
    rangeStart = addUtcMonths(rangeEndExclusive, -bucketCount)
  }

  if (range === "all") {
    bucketUnit = "month"
    const earliestWhere = {}
    if (userFilter) {
      earliestWhere.userId = userFilter
    }

    const earliestOrder = await prisma.order.findFirst({
      where: earliestWhere,
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    })

    if (!earliestOrder) {
      return { success: true, range, buckets: [] }
    }

    rangeStart = toUtcMonthStart(earliestOrder.createdAt)
    rangeEndExclusive = addUtcMonths(toUtcMonthStart(now), 1)

    const monthsSpan =
      (rangeEndExclusive.getUTCFullYear() - rangeStart.getUTCFullYear()) * 12 +
      (rangeEndExclusive.getUTCMonth() - rangeStart.getUTCMonth())

    bucketCount = Math.max(monthsSpan, 1)
  }

  const countWhere = {
    createdAt: { lt: rangeStart },
  }
  if (userFilter) {
    countWhere.userId = userFilter
  }

  const rangeWhere = {
    createdAt: { gte: rangeStart, lt: rangeEndExclusive },
  }
  if (userFilter) {
    rangeWhere.userId = userFilter
  }

  const [initialTotalBeforeStart, ordersInRange] = await Promise.all([
    prisma.order.count({ where: countWhere }),
    prisma.order.findMany({
      where: rangeWhere,
      select: { createdAt: true },
      orderBy: [{ createdAt: "asc" }],
    }),
  ])

  const bucketStarts = []
  for (let index = 0; index < bucketCount; index += 1) {
    if (bucketUnit === "day") {
      bucketStarts.push(addUtcDays(rangeStart, index))
    } else {
      bucketStarts.push(addUtcMonths(rangeStart, index))
    }
  }

  const bucketNewOrders = new Array(bucketCount).fill(0)
  for (const order of ordersInRange) {
    let bucketIndex = 0
    if (bucketUnit === "day") {
      const orderDayStart = toUtcDayStart(order.createdAt)
      bucketIndex = Math.floor(
        (orderDayStart.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)
      )
    } else {
      bucketIndex =
        (order.createdAt.getUTCFullYear() - rangeStart.getUTCFullYear()) * 12 +
        (order.createdAt.getUTCMonth() - rangeStart.getUTCMonth())
    }

    if (bucketIndex >= 0 && bucketIndex < bucketNewOrders.length) {
      bucketNewOrders[bucketIndex] += 1
    }
  }

  let labelFormatter
  if (bucketUnit === "day") {
    labelFormatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    })
  } else {
    labelFormatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    })
  }

  const buckets = []
  let runningTotal = initialTotalBeforeStart

  for (let index = 0; index < bucketCount; index += 1) {
    const start = bucketStarts[index]
    let endExclusive
    if (bucketUnit === "day") {
      endExclusive = addUtcDays(start, 1)
    } else {
      endExclusive = addUtcMonths(start, 1)
    }

    const newOrders = bucketNewOrders[index]
    runningTotal += newOrders

    buckets.push({
      label: labelFormatter.format(start),
      start: start.toISOString(),
      end: endExclusive.toISOString(),
      newOrders,
      totalOrdersToDate: runningTotal,
    })
  }

  return { success: true, range, buckets }
}
