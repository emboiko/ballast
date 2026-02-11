import prisma from "../../../../packages/shared/src/db/client.js"
import { loadEnv } from "../../../../packages/shared/src/config/env.js"
import { postInternalApi } from "../gateways/internalApiGateway.js"

const JOB_TYPE = "sendUpcomingChargeReminders"

const parsePositiveIntOrNull = (value) => {
  if (typeof value !== "string") {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number.parseInt(trimmed, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

const getDaysBeforeFromEnv = () => {
  loadEnv()
  return parsePositiveIntOrNull(process.env.PAYMENT_REMINDER_DAYS_BEFORE)
}

const addUtcDays = (date, daysToAdd) => {
  const startUtcMs = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )
  return new Date(startUtcMs + daysToAdd * 86400000)
}

const getUtcDayRange = (date) => {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  const endExclusive = new Date(start.getTime() + 86400000)
  return { start, endExclusive }
}

const updateJobRunProgress = async (prismaClient, jobRunId, progress) => {
  await prismaClient.jobRun.update({
    where: { id: jobRunId },
    data: { progress },
  })
}

export const sendUpcomingChargeReminders = async ({
  logger,
  now,
  prismaClient,
  postInternalApiFn,
  daysBefore,
} = {}) => {
  const log = logger || console
  const resolvedPrisma = prismaClient || prisma
  const resolvedPostInternalApi = postInternalApiFn || postInternalApi

  let currentTime = now
  if (!currentTime) {
    currentTime = new Date()
  }

  let resolvedDaysBefore = daysBefore
  if (!Number.isInteger(resolvedDaysBefore) || resolvedDaysBefore <= 0) {
    const fromEnv = getDaysBeforeFromEnv()
    if (fromEnv) {
      resolvedDaysBefore = fromEnv
    } else {
      resolvedDaysBefore = 3
    }
  }

  const targetDay = addUtcDays(currentTime, resolvedDaysBefore)
  const { start, endExclusive } = getUtcDayRange(targetDay)

  const jobRun = await resolvedPrisma.jobRun.create({
    data: {
      jobType: JOB_TYPE,
      status: "RUNNING",
      startedAt: currentTime,
      progress: {
        daysBefore: resolvedDaysBefore,
        totalSubscriptions: 0,
        totalPlans: 0,
        processedSubscriptions: 0,
        processedPlans: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
      },
    },
  })

  let processedSubscriptions = 0
  let processedPlans = 0
  let sent = 0
  let skipped = 0
  let failed = 0

  try {
    const [subscriptions, plans] = await Promise.all([
      resolvedPrisma.serviceSubscription.findMany({
        where: {
          status: "ACTIVE",
          nextChargeDate: { gte: start, lt: endExclusive },
        },
        select: { id: true, nextChargeDate: true },
        orderBy: { nextChargeDate: "asc" },
      }),
      resolvedPrisma.financingPlan.findMany({
        where: {
          status: "ACTIVE",
          nextPaymentDate: { gte: start, lt: endExclusive },
        },
        select: { id: true, nextPaymentDate: true },
        orderBy: { nextPaymentDate: "asc" },
      }),
    ])

    const totalSubscriptions = subscriptions.length
    const totalPlans = plans.length

    await updateJobRunProgress(resolvedPrisma, jobRun.id, {
      daysBefore: resolvedDaysBefore,
      totalSubscriptions,
      totalPlans,
      processedSubscriptions,
      processedPlans,
      sent,
      skipped,
      failed,
    })

    for (const subscription of subscriptions) {
      processedSubscriptions += 1

      try {
        const scheduledFor = subscription.nextChargeDate
        if (!scheduledFor) {
          skipped += 1
        } else {
          const response = await resolvedPostInternalApi({
            route: "/internal/notifications/subscriptions/upcoming-charge",
            body: {
              subscriptionId: subscription.id,
              scheduledFor: scheduledFor.toISOString(),
              daysBefore: resolvedDaysBefore,
            },
          })

          if (response.success) {
            if (response.data?.sent === true) {
              sent += 1
            } else {
              skipped += 1
            }
          } else {
            failed += 1
            log.warn("subscription reminder failed", {
              subscriptionId: subscription.id,
              error: response.error,
            })
          }
        }
      } catch (error) {
        failed += 1
        log.warn("subscription reminder error", {
          subscriptionId: subscription.id,
          message: error?.message || "Reminder failed",
        })
      }

      await updateJobRunProgress(resolvedPrisma, jobRun.id, {
        daysBefore: resolvedDaysBefore,
        totalSubscriptions,
        totalPlans,
        processedSubscriptions,
        processedPlans,
        sent,
        skipped,
        failed,
      })
    }

    for (const plan of plans) {
      processedPlans += 1

      try {
        const dueDate = plan.nextPaymentDate
        if (!dueDate) {
          skipped += 1
        } else {
          const response = await resolvedPostInternalApi({
            route: "/internal/notifications/financing/upcoming-charge",
            body: {
              planId: plan.id,
              dueDate: dueDate.toISOString(),
              daysBefore: resolvedDaysBefore,
            },
          })

          if (response.success) {
            if (response.data?.sent === true) {
              sent += 1
            } else {
              skipped += 1
            }
          } else {
            failed += 1
            log.warn("financing reminder failed", {
              planId: plan.id,
              error: response.error,
            })
          }
        }
      } catch (error) {
        failed += 1
        log.warn("financing reminder error", {
          planId: plan.id,
          message: error?.message || "Reminder failed",
        })
      }

      await updateJobRunProgress(resolvedPrisma, jobRun.id, {
        daysBefore: resolvedDaysBefore,
        totalSubscriptions,
        totalPlans,
        processedSubscriptions,
        processedPlans,
        sent,
        skipped,
        failed,
      })
    }

    const summary = {
      daysBefore: resolvedDaysBefore,
      totalSubscriptions,
      totalPlans,
      processedSubscriptions,
      processedPlans,
      sent,
      skipped,
      failed,
    }

    await resolvedPrisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        summary,
        progress: summary,
      },
    })

    log.info("completed", summary)
    return { success: true, summary }
  } catch (error) {
    const errorMessage = error?.message || "Job failed"
    await resolvedPrisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        error: errorMessage,
      },
    })
    log.error("failed", { message: errorMessage })
    throw error
  }
}

