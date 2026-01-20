import prisma from "@ballast/shared/src/db/client.js"

/**
 * Search users by email (partial match, case-insensitive)
 * @param {string} query
 * @param {object} options
 * @param {number} [options.limit=5]
 * @param {number} [options.offset=0]
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>}
 */
export const searchUsers = async (query, { limit = 5, offset = 0 } = {}) => {
  if (!query || query.trim().length === 0) {
    return { users: [], total: 0, hasMore: false }
  }

  const searchTerm = query.toLowerCase().trim()

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        email: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({
      where: {
        email: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    }),
  ])

  return {
    users: users.map((user) => ({
      ...user,
      orderCount: user._count.orders,
      _count: undefined,
    })),
    total,
    hasMore: offset + users.length < total,
  }
}

/**
 * Search orders by ID or user email (partial match)
 * @param {string} query
 * @param {object} options
 * @param {number} [options.limit=5]
 * @param {number} [options.offset=0]
 * @returns {Promise<{ orders: Array<object>, total: number, hasMore: boolean }>}
 */
export const searchOrders = async (query, { limit = 5, offset = 0 } = {}) => {
  if (!query || query.trim().length === 0) {
    return { orders: [], total: 0, hasMore: false }
  }

  const searchTerm = query.trim()

  const whereClause = {
    OR: [
      {
        id: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        user: {
          email: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
    ],
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        amountCents: true,
        currency: true,
        status: true,
        refundStatus: true,
        processor: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: { items: true },
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

  return {
    orders: orders.map((order) => ({
      ...order,
      itemCount: order._count.items,
      _count: undefined,
    })),
    total,
    hasMore: offset + orders.length < total,
  }
}

/**
 * Search refunds by requesting user email (partial match)
 * @param {string} query
 * @param {object} options
 * @param {number} [options.limit=5]
 * @param {number} [options.offset=0]
 * @returns {Promise<{ refunds: Array<object>, total: number, hasMore: boolean }>}
 */
export const searchRefunds = async (query, { limit = 5, offset = 0 } = {}) => {
  if (!query || query.trim().length === 0) {
    return { refunds: [], total: 0, hasMore: false }
  }

  const searchTerm = query.trim()

  const whereClause = {
    requestedByUser: {
      email: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
  }

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where: whereClause,
      select: {
        id: true,
        orderId: true,
        status: true,
        amountCents: true,
        currency: true,
        createdAt: true,
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
