import prisma from "../../../../../packages/shared/src/db/client.js"

export const listServiceSubscriptions = async ({
  limit = 25,
  offset = 0,
  userId,
  status,
} = {}) => {
  const whereClause = {}

  if (typeof userId === "string" && userId.trim().length > 0) {
    whereClause.userId = userId.trim()
  }

  if (
    typeof status === "string" &&
    status.trim().length > 0 &&
    status !== "ALL"
  ) {
    whereClause.status = status
  }

  const [subscriptions, total] = await Promise.all([
    prisma.serviceSubscription.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        userId: true,
        serviceId: true,
        interval: true,
        priceCents: true,
        currency: true,
        status: true,
        nextChargeDate: true,
        failedPaymentAttempts: true,
        lastFailedChargeAt: true,
        endedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.serviceSubscription.count({ where: whereClause }),
  ])

  return {
    subscriptions,
    total,
    hasMore: offset + subscriptions.length < total,
  }
}

export const getServiceSubscriptionById = async (subscriptionId) => {
  if (!subscriptionId) {
    return { success: false, error: "Subscription ID is required" }
  }

  const subscription = await prisma.serviceSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!subscription) {
    return { success: false, error: "Subscription not found" }
  }

  return { success: true, subscription }
}
