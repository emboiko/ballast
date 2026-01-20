import crypto from "crypto"
import prisma from "@ballast/shared/src/db/client.js"
import {
  sendAccountReactivationEmail,
  sendAdminAccessGrantedEmail,
} from "@/gateways/emailGateway.js"
import { userInfoSelectFields } from "@/lib/userInfo.js"
import {
  addUtcDays,
  addUtcMonths,
  toUtcDayStart,
  toUtcMonthStart,
} from "@/lib/utils/dateBuckets.js"

/**
 * Get a single user by ID with full details
 * @param {string} userId
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export const getUserById = async (userId) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      authProvider: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      bannedAt: true,
      banReasonInternal: true,
      stripeCustomerId: true,
      braintreeCustomerId: true,
      squareCustomerId: true,
      authorizeCustomerId: true,
      ...userInfoSelectFields,
      _count: {
        select: {
          orders: true,
          contactSubmissions: true,
        },
      },
    },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  return {
    success: true,
    user: {
      ...user,
      orderCount: user._count.orders,
      contactSubmissionCount: user._count.contactSubmissions,
      _count: undefined,
    },
  }
}

/**
 * Update editable user fields
 * @param {string} userId
 * @param {object} updates
 * @param {boolean} [updates.isAdmin]
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export const updateUser = async (userId, updates) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  const updateData = {}

  if (updates.isAdmin !== undefined) {
    updateData.isAdmin = Boolean(updates.isAdmin)
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true, user }
  }

  const isGrantingAdminAccess =
    user.isAdmin === false && updateData.isAdmin === true

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      emailVerified: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      bannedAt: true,
      banReasonInternal: true,
      ...userInfoSelectFields,
    },
  })

  if (isGrantingAdminAccess && updatedUser.email) {
    await sendAdminAccessGrantedEmail({ to: updatedUser.email })
  }

  return { success: true, user: updatedUser }
}

/**
 * Archive (soft delete) a user
 * @param {string} userId
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export const archiveUser = async (userId) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (user.archivedAt) {
    return { success: false, error: "User is already archived" }
  }

  const now = new Date()

  const [, updatedUser] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { userId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { archivedAt: now, tokensInvalidBefore: now },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        archivedAt: true,
        bannedAt: true,
        banReasonInternal: true,
      },
    }),
  ])

  return { success: true, user: updatedUser }
}

/**
 * Unarchive a user, optionally requiring re-verification
 * @param {string} userId
 * @param {boolean} requireVerification
 * @returns {Promise<{ success: boolean, user?: object, message?: string, verificationSent?: boolean, error?: string }>}
 */
export const unarchiveUser = async (userId, requireVerification = false) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (!user.archivedAt) {
    return { success: false, error: "User is not archived" }
  }

  const now = new Date()
  const updateData = {
    archivedAt: null,
    tokensInvalidBefore: now,
  }

  if (requireVerification) {
    updateData.emailVerified = false
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      emailVerified: true,
      isAdmin: true,
      archivedAt: true,
      bannedAt: true,
      banReasonInternal: true,
    },
  })

  let verificationSent = false

  if (requireVerification) {
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: "ACCOUNT_REACTIVATION" },
    })

    const token = crypto.randomBytes(32).toString("hex")
    await prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        type: "ACCOUNT_REACTIVATION",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    await sendAccountReactivationEmail(user.email, token)
    verificationSent = true
  }

  return {
    success: true,
    user: updatedUser,
    message: requireVerification
      ? "User unarchived. Verification email sent."
      : "User unarchived successfully.",
    verificationSent,
  }
}

/**
 * Ban a user and invalidate all existing auth tokens
 * @param {string} userId
 * @param {string | undefined} reasonInternal
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export const banUser = async (userId, reasonInternal) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, bannedAt: true },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (user.bannedAt) {
    return { success: false, error: "User is already banned" }
  }

  let normalizedReasonInternal = null
  if (typeof reasonInternal === "string") {
    const trimmedReason = reasonInternal.trim()
    if (trimmedReason) {
      normalizedReasonInternal = trimmedReason
    }
  }

  const now = new Date()

  const [, updatedUser] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { userId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        bannedAt: now,
        banReasonInternal: normalizedReasonInternal,
        tokensInvalidBefore: now,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        archivedAt: true,
        bannedAt: true,
        banReasonInternal: true,
      },
    }),
  ])

  return { success: true, user: updatedUser }
}

/**
 * Unban a user and invalidate all existing auth tokens
 * @param {string} userId
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export const unbanUser = async (userId) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, bannedAt: true },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (!user.bannedAt) {
    return { success: false, error: "User is not banned" }
  }

  const now = new Date()

  const [, updatedUser] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { userId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        bannedAt: null,
        banReasonInternal: null,
        tokensInvalidBefore: now,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        archivedAt: true,
        bannedAt: true,
        banReasonInternal: true,
      },
    }),
  ])

  return { success: true, user: updatedUser }
}

/**
 * Permanently delete a user (GDPR compliance)
 * @param {string} userId
 * @param {string} confirmEmail - Must match user's email to confirm deletion
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const permanentlyDeleteUser = async (userId, confirmEmail) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  if (!confirmEmail) {
    return { success: false, error: "Confirmation email is required" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (user.email.toLowerCase() !== confirmEmail.toLowerCase()) {
    return {
      success: false,
      error: "Confirmation email does not match user email",
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({
      where: { userId },
    })

    await tx.contactSubmission.deleteMany({
      where: { userId },
    })

    await tx.refund.deleteMany({
      where: { requestedBy: userId },
    })

    await tx.refund.updateMany({
      where: { processedBy: userId },
      data: { processedBy: null },
    })

    const orders = await tx.order.findMany({
      where: { userId },
      select: { id: true },
    })

    for (const order of orders) {
      await tx.orderItem.deleteMany({
        where: { orderId: order.id },
      })
      await tx.refund.deleteMany({
        where: { orderId: order.id },
      })
    }

    await tx.order.deleteMany({
      where: { userId },
    })

    await tx.user.delete({
      where: { id: userId },
    })
  })

  return {
    success: true,
    message: "User and all associated data permanently deleted",
  }
}

/**
 * Get aggregate user stats for admin overview pages.
 * @returns {Promise<{ success: boolean, stats?: object, error?: string }>}
 */
export const getUserStats = async () => {
  const [
    totalUsers,
    totalArchivedUsers,
    totalBannedUsers,
    usersWithStripeCustomerId,
    usersWithBraintreeCustomerId,
    usersWithSquareCustomerId,
    usersWithAuthorizeCustomerId,
    totalGoogleUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { archivedAt: { not: null } } }),
    prisma.user.count({ where: { bannedAt: { not: null } } }),
    prisma.user.count({ where: { stripeCustomerId: { not: null } } }),
    prisma.user.count({ where: { braintreeCustomerId: { not: null } } }),
    prisma.user.count({ where: { squareCustomerId: { not: null } } }),
    prisma.user.count({ where: { authorizeCustomerId: { not: null } } }),
    prisma.user.count({ where: { authProvider: "GOOGLE" } }),
  ])

  return {
    success: true,
    stats: {
      totalUsers,
      totalArchivedUsers,
      totalBannedUsers,
      usersWithStripeCustomerId,
      usersWithBraintreeCustomerId,
      usersWithSquareCustomerId,
      usersWithAuthorizeCustomerId,
      totalGoogleUsers,
    },
  }
}

/**
 * @typedef {"newest" | "banned" | "archived"} UserListFilter
 */

/**
 * List users for admin overview with keyset pagination.
 * @param {object} options
 * @param {UserListFilter} options.filter
 * @param {number} options.limit
 * @param {string | undefined} [options.cursorCreatedAt]
 * @param {string | undefined} [options.cursorId]
 * @returns {Promise<{ success: boolean, users?: object[], totalCount?: number, nextCursor?: object | null, error?: string }>}
 */
export const listUsers = async ({
  filter,
  limit,
  cursorCreatedAt,
  cursorId,
}) => {
  let normalizedLimit = 20
  if (typeof limit === "number" && Number.isFinite(limit)) {
    normalizedLimit = Math.min(Math.max(limit, 1), 50)
  }

  const allowedFilters = new Set(["newest", "banned", "archived"])
  if (!allowedFilters.has(filter)) {
    return { success: false, error: "Invalid filter" }
  }

  let baseWhere = {}
  if (filter === "banned") {
    baseWhere = { bannedAt: { not: null } }
  }
  if (filter === "archived") {
    baseWhere = { archivedAt: { not: null } }
  }

  let cursorWhere = null
  if (cursorCreatedAt && cursorId) {
    const cursorDate = new Date(cursorCreatedAt)
    if (!Number.isNaN(cursorDate.getTime())) {
      cursorWhere = {
        OR: [
          { createdAt: { lt: cursorDate } },
          { createdAt: cursorDate, id: { lt: cursorId } },
        ],
      }
    }
  }

  const where = cursorWhere ? { AND: [baseWhere, cursorWhere] } : baseWhere

  const [totalCount, users] = await Promise.all([
    prisma.user.count({ where: baseWhere }),
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: normalizedLimit,
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true,
        archivedAt: true,
        bannedAt: true,
      },
    }),
  ])

  let nextCursor = null
  if (users.length === normalizedLimit) {
    const lastUser = users[users.length - 1]
    nextCursor = {
      cursorCreatedAt: lastUser.createdAt.toISOString(),
      cursorId: lastUser.id,
    }
  }

  return { success: true, users, totalCount, nextCursor }
}

/**
 * Get growth buckets for users over different time ranges.
 * @param {object} options
 * @param {UserGrowthRange} options.range
 * @returns {Promise<{ success: boolean, range?: UserGrowthRange, buckets?: Array<{ label: string, start: string, end: string, newUsers: number, totalUsersToDate: number }>, error?: string }>}
 */
export const getUserGrowth = async ({ range }) => {
  const allowedRanges = new Set(["week", "month", "year", "all"])
  if (!allowedRanges.has(range)) {
    return { success: false, error: "Invalid range" }
  }

  const now = new Date()

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
    const earliestUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    })

    if (!earliestUser) {
      return { success: true, range, buckets: [] }
    }

    rangeStart = toUtcMonthStart(earliestUser.createdAt)
    rangeEndExclusive = addUtcMonths(toUtcMonthStart(now), 1)

    const monthsSpan =
      (rangeEndExclusive.getUTCFullYear() - rangeStart.getUTCFullYear()) * 12 +
      (rangeEndExclusive.getUTCMonth() - rangeStart.getUTCMonth())

    bucketCount = Math.max(monthsSpan, 1)
  }

  const [initialTotalBeforeStart, usersInRange] = await Promise.all([
    prisma.user.count({ where: { createdAt: { lt: rangeStart } } }),
    prisma.user.findMany({
      where: { createdAt: { gte: rangeStart, lt: rangeEndExclusive } },
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

  const bucketNewUsers = new Array(bucketCount).fill(0)
  for (const user of usersInRange) {
    let bucketIndex = 0
    if (bucketUnit === "day") {
      const userDayStart = toUtcDayStart(user.createdAt)
      bucketIndex = Math.floor(
        (userDayStart.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)
      )
    } else {
      bucketIndex =
        (user.createdAt.getUTCFullYear() - rangeStart.getUTCFullYear()) * 12 +
        (user.createdAt.getUTCMonth() - rangeStart.getUTCMonth())
    }

    if (bucketIndex >= 0 && bucketIndex < bucketNewUsers.length) {
      bucketNewUsers[bucketIndex] += 1
    }
  }

  const labelFormatter =
    bucketUnit === "day"
      ? new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" })
      : new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })

  const buckets = []
  let runningTotal = initialTotalBeforeStart

  for (let index = 0; index < bucketCount; index += 1) {
    const start = bucketStarts[index]
    const endExclusive =
      bucketUnit === "day" ? addUtcDays(start, 1) : addUtcMonths(start, 1)

    const newUsers = bucketNewUsers[index]
    runningTotal += newUsers

    buckets.push({
      label: labelFormatter.format(start),
      start: start.toISOString(),
      end: endExclusive.toISOString(),
      newUsers,
      totalUsersToDate: runningTotal,
    })
  }

  return { success: true, range, buckets }
}
