import prisma from "../../../../../packages/shared/src/db/client.js"

/**
 * List financing plans for admin UI with optional filtering.
 * @param {object} params
 * @param {number} [params.limit=25]
 * @param {number} [params.offset=0]
 * @param {string} [params.userId]
 * @returns {Promise<{ plans: Array<object>, total: number, hasMore: boolean }>}
 */
export const listFinancingPlans = async ({ limit = 25, offset = 0, userId } = {}) => {
  const whereClause = {}

  if (typeof userId === "string" && userId.trim().length > 0) {
    whereClause.userId = userId.trim()
  }

  const [plans, total] = await Promise.all([
    prisma.financingPlan.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        userId: true,
        status: true,
        totalAmountCents: true,
        remainingBalanceCents: true,
        cadence: true,
        termCount: true,
        nextPaymentDate: true,
        processor: true,
        processorPaymentMethod: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    }),
    prisma.financingPlan.count({ where: whereClause }),
  ])

  return {
    plans,
    total,
    hasMore: offset + plans.length < total,
  }
}

/**
 * Get financing plan with related data for admin UI.
 * @param {string} planId
 * @returns {Promise<{ success: boolean, plan?: object, error?: string }>}
 */
export const getFinancingPlanById = async (planId) => {
  if (!planId) {
    return { success: false, error: "Plan ID is required" }
  }

  const plan = await prisma.financingPlan.findUnique({
    where: { id: planId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
      order: {
        include: {
          items: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  })

  if (!plan) {
    return { success: false, error: "Financing plan not found" }
  }

  return { success: true, plan }
}
