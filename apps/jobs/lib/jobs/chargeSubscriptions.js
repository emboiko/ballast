import prisma from "../../../../packages/shared/src/db/client.js"
import { chargeStripePayment } from "../gateways/stripeGateway.js"
import { postInternalApi } from "../gateways/internalApiGateway.js"

const JOB_TYPE = "chargeSubscriptions"
const MAX_FAILED_ATTEMPTS = 3

const isSameUtcDate = (a, b) => {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

const getUtcDayNumber = (date) => {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86400000
  )
}

const getIntervalMonths = (interval) => {
  if (interval === "MONTHLY") {
    return 1
  }
  if (interval === "QUARTERLY") {
    return 3
  }
  if (interval === "SEMI_ANNUAL") {
    return 6
  }
  if (interval === "ANNUAL") {
    return 12
  }
  return null
}

const daysInMonthUtc = (year, monthIndexZeroBased) => {
  return new Date(Date.UTC(year, monthIndexZeroBased + 1, 0)).getUTCDate()
}

const addMonthsClampedUtc = (date, monthsToAdd) => {
  const startYear = date.getUTCFullYear()
  const startMonth = date.getUTCMonth()
  const startDay = date.getUTCDate()

  const startHours = date.getUTCHours()
  const startMinutes = date.getUTCMinutes()
  const startSeconds = date.getUTCSeconds()
  const startMs = date.getUTCMilliseconds()

  const totalMonths = startMonth + monthsToAdd
  const targetYear = startYear + Math.floor(totalMonths / 12)
  const targetMonth = ((totalMonths % 12) + 12) % 12

  const maxDay = daysInMonthUtc(targetYear, targetMonth)
  const targetDay = Math.min(startDay, maxDay)

  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      targetDay,
      startHours,
      startMinutes,
      startSeconds,
      startMs
    )
  )
}

const addIntervalToDateUtc = ({ date, interval }) => {
  const monthsToAdd = getIntervalMonths(interval)
  if (!monthsToAdd) {
    return null
  }
  return addMonthsClampedUtc(date, monthsToAdd)
}

const getScheduledForKey = (date) => {
  return date.toISOString()
}

const buildPaidScheduleSet = (payments) => {
  const paid = new Set()

  for (const payment of payments) {
    if (payment?.status !== "SUCCEEDED") {
      continue
    }
    if (!payment?.scheduledFor) {
      continue
    }
    paid.add(getScheduledForKey(payment.scheduledFor))
  }

  return paid
}

const buildPendingScheduleSet = (payments) => {
  const pending = new Set()

  for (const payment of payments) {
    if (payment?.status !== "PENDING") {
      continue
    }
    if (!payment?.scheduledFor) {
      continue
    }
    pending.add(getScheduledForKey(payment.scheduledFor))
  }

  return pending
}

const buildLatestPaymentMap = (payments) => {
  const latestByScheduledFor = new Map()

  for (const payment of payments) {
    if (!payment?.scheduledFor) {
      continue
    }

    const key = getScheduledForKey(payment.scheduledFor)
    if (!latestByScheduledFor.has(key)) {
      latestByScheduledFor.set(key, payment)
    }
  }

  return latestByScheduledFor
}

const updateJobRunProgress = async (prismaClient, jobRunId, progress) => {
  await prismaClient.jobRun.update({
    where: { id: jobRunId },
    data: { progress },
  })
}

const resolveStripeCustomerId = async (prismaClient, subscription) => {
  if (subscription.processorCustomerId) {
    return subscription.processorCustomerId
  }

  const user = await prismaClient.user.findUnique({
    where: { id: subscription.userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) {
    await prismaClient.serviceSubscription.update({
      where: { id: subscription.id },
      data: { processorCustomerId: user.stripeCustomerId },
    })
    return user.stripeCustomerId
  }

  return null
}

const getProcessorHandler = (prismaClient, subscription) => {
  if (subscription.processor === "STRIPE") {
    return {
      name: "STRIPE",
      resolveContext: async () => {
        const customerId = await resolveStripeCustomerId(
          prismaClient,
          subscription
        )
        if (!customerId) {
          return { error: "Missing Stripe customer ID" }
        }
        if (!subscription.processorPaymentMethodId) {
          return { error: "Missing Stripe payment method ID" }
        }
        return {
          customerId,
          paymentMethodId: subscription.processorPaymentMethodId,
        }
      },
    }
  }

  return null
}

const chargeRenewal = async ({
  subscription,
  customerId,
  paymentMethodId,
  amountCents,
  scheduledFor,
  jobRunId,
}) => {
  return chargeStripePayment({
    customerId,
    paymentMethodId,
    amountCents,
    currency: subscription.currency || "usd",
    idempotencyKey: `subscription:${subscription.id}:${scheduledFor.toISOString()}`,
    metadata: {
      jobRunId,
      subscriptionId: subscription.id,
      scheduledFor: scheduledFor.toISOString(),
      serviceId: subscription.serviceId,
      interval: subscription.interval,
    },
  })
}

/**
 * Charge due subscription renewals.
 * @param {object} [params]
 * @param {Console|{ info?: Function, warn: Function, error?: Function }} [params.logger]
 * @param {Date} [params.now]
 * @param {any} [params.prismaClient]
 * @param {Function} [params.chargeRenewalFn]
 * @param {Function} [params.getProcessorHandlerFn]
 * @param {Function} [params.postInternalApiFn]
 * @returns {Promise<{ success: boolean, summary?: object, error?: string }>}
 */
export const chargeSubscriptions = async ({
  logger,
  now,
  prismaClient,
  chargeRenewalFn,
  getProcessorHandlerFn,
  postInternalApiFn,
} = {}) => {
  const log = logger || console
  let currentTime = now
  if (!currentTime) {
    currentTime = new Date()
  }

  const resolvedPrisma = prismaClient || prisma
  const resolvedChargeRenewal = chargeRenewalFn || chargeRenewal
  const resolvedGetProcessorHandler =
    getProcessorHandlerFn || getProcessorHandler
  const resolvedPostInternalApi = postInternalApiFn || postInternalApi

  const jobRun = await resolvedPrisma.jobRun.create({
    data: {
      jobType: JOB_TYPE,
      status: "RUNNING",
      startedAt: currentTime,
      progress: {
        totalSubscriptions: 0,
        processedSubscriptions: 0,
        totalChargesDue: 0,
        processedCharges: 0,
        succeededPayments: 0,
        failedPayments: 0,
        skippedCharges: 0,
      },
    },
  })

  let processedSubscriptions = 0
  let totalChargesDue = 0
  let processedCharges = 0
  let succeededPayments = 0
  let failedPayments = 0
  let skippedCharges = 0

  try {
    const subscriptions = await resolvedPrisma.serviceSubscription.findMany({
      where: {
        status: "ACTIVE",
        nextChargeDate: { lte: currentTime },
      },
      orderBy: { nextChargeDate: "asc" },
    })

    const totalSubscriptions = subscriptions.length
    await updateJobRunProgress(resolvedPrisma, jobRun.id, {
      totalSubscriptions,
      processedSubscriptions,
      totalChargesDue,
      processedCharges,
      succeededPayments,
      failedPayments,
      skippedCharges,
    })

    for (const subscription of subscriptions) {
      if (!subscription.nextChargeDate) {
        processedSubscriptions += 1
        continue
      }

      const scheduledFor = new Date(subscription.nextChargeDate)
      if (Number.isNaN(scheduledFor.getTime())) {
        skippedCharges += 1
        processedSubscriptions += 1
        continue
      }

      const daysLate =
        getUtcDayNumber(currentTime) - getUtcDayNumber(scheduledFor)
      if (daysLate < 0) {
        processedSubscriptions += 1
        continue
      }

      totalChargesDue += 1

      if (subscription.lastFailedChargeAt) {
        const lastFailed = new Date(subscription.lastFailedChargeAt)
        if (
          !Number.isNaN(lastFailed.getTime()) &&
          isSameUtcDate(lastFailed, currentTime)
        ) {
          skippedCharges += 1
          processedSubscriptions += 1
          await updateJobRunProgress(resolvedPrisma, jobRun.id, {
            totalSubscriptions,
            processedSubscriptions,
            totalChargesDue,
            processedCharges,
            succeededPayments,
            failedPayments,
            skippedCharges,
          })
          continue
        }
      }

      const processorHandler = resolvedGetProcessorHandler(
        resolvedPrisma,
        subscription
      )
      if (!processorHandler) {
        skippedCharges += 1
        log.warn("unsupported processor", {
          subscriptionId: subscription.id,
          processor: subscription.processor,
        })
        processedSubscriptions += 1
        await updateJobRunProgress(resolvedPrisma, jobRun.id, {
          totalSubscriptions,
          processedSubscriptions,
          totalChargesDue,
          processedCharges,
          succeededPayments,
          failedPayments,
          skippedCharges,
        })
        continue
      }

      const processorContext = await processorHandler.resolveContext()
      if (processorContext.error) {
        skippedCharges += 1
        log.warn(`${processorHandler.name} context missing`, {
          subscriptionId: subscription.id,
          message: processorContext.error,
        })
        processedSubscriptions += 1
        await updateJobRunProgress(resolvedPrisma, jobRun.id, {
          totalSubscriptions,
          processedSubscriptions,
          totalChargesDue,
          processedCharges,
          succeededPayments,
          failedPayments,
          skippedCharges,
        })
        continue
      }

      const payments = await resolvedPrisma.serviceSubscriptionPayment.findMany(
        {
          where: { subscriptionId: subscription.id },
          orderBy: { createdAt: "desc" },
        }
      )

      const paidScheduleSet = buildPaidScheduleSet(payments)
      const pendingScheduleSet = buildPendingScheduleSet(payments)
      const latestPaymentBySchedule = buildLatestPaymentMap(payments)

      const scheduleKey = getScheduledForKey(scheduledFor)
      if (paidScheduleSet.has(scheduleKey)) {
        const nextChargeDate = addIntervalToDateUtc({
          date: scheduledFor,
          interval: subscription.interval,
        })

        await resolvedPrisma.serviceSubscription.update({
          where: { id: subscription.id },
          data: {
            nextChargeDate,
            failedPaymentAttempts: 0,
            lastFailedChargeAt: null,
          },
        })

        processedSubscriptions += 1
        await updateJobRunProgress(resolvedPrisma, jobRun.id, {
          totalSubscriptions,
          processedSubscriptions,
          totalChargesDue,
          processedCharges,
          succeededPayments,
          failedPayments,
          skippedCharges,
        })
        continue
      }

      if (pendingScheduleSet.has(scheduleKey)) {
        skippedCharges += 1
        processedSubscriptions += 1
        await updateJobRunProgress(resolvedPrisma, jobRun.id, {
          totalSubscriptions,
          processedSubscriptions,
          totalChargesDue,
          processedCharges,
          succeededPayments,
          failedPayments,
          skippedCharges,
        })
        continue
      }

      const latestPayment = latestPaymentBySchedule.get(scheduleKey)
      if (latestPayment?.status === "PENDING") {
        skippedCharges += 1
        processedSubscriptions += 1
        await updateJobRunProgress(resolvedPrisma, jobRun.id, {
          totalSubscriptions,
          processedSubscriptions,
          totalChargesDue,
          processedCharges,
          succeededPayments,
          failedPayments,
          skippedCharges,
        })
        continue
      }

      if (
        !Number.isInteger(subscription.priceCents) ||
        subscription.priceCents <= 0
      ) {
        skippedCharges += 1
        processedSubscriptions += 1
        await updateJobRunProgress(resolvedPrisma, jobRun.id, {
          totalSubscriptions,
          processedSubscriptions,
          totalChargesDue,
          processedCharges,
          succeededPayments,
          failedPayments,
          skippedCharges,
        })
        continue
      }

      const payment = await resolvedPrisma.serviceSubscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          status: "PENDING",
          amountCents: subscription.priceCents,
          currency: subscription.currency || "usd",
          scheduledFor,
        },
      })

      processedCharges += 1

      let chargeResult = null
      try {
        chargeResult = await resolvedChargeRenewal({
          subscription,
          customerId: processorContext.customerId,
          paymentMethodId: processorContext.paymentMethodId,
          amountCents: subscription.priceCents,
          scheduledFor,
          jobRunId: jobRun.id,
        })
      } catch (error) {
        const errorMessage = error?.message || "Charge failed"
        log.error("charge error", {
          subscriptionId: subscription.id,
          paymentId: payment.id,
          message: errorMessage,
        })
        chargeResult = { success: false, error: errorMessage }
      }

      let failedPaymentAttempts = subscription.failedPaymentAttempts || 0
      let updatedStatus = subscription.status
      let nextChargeDate = subscription.nextChargeDate

      if (chargeResult && chargeResult.success) {
        await resolvedPrisma.serviceSubscriptionPayment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCEEDED",
            paidAt: currentTime,
            processorPaymentId: chargeResult.paymentIntentId,
          },
        })

        nextChargeDate = addIntervalToDateUtc({
          date: scheduledFor,
          interval: subscription.interval,
        })

        failedPaymentAttempts = 0
        succeededPayments += 1

        await resolvedPrisma.serviceSubscription.update({
          where: { id: subscription.id },
          data: {
            nextChargeDate,
            failedPaymentAttempts,
            lastFailedChargeAt: null,
          },
        })
      } else {
        let errorMessage = "Charge failed"
        if (chargeResult && chargeResult.error) {
          errorMessage = chargeResult.error
        }

        await resolvedPrisma.serviceSubscriptionPayment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            failureMessage: errorMessage,
          },
        })

        try {
          await resolvedPostInternalApi({
            route: "/internal/notifications/subscriptions/charge-failed",
            body: { paymentId: payment.id },
          })
        } catch (error) {
          log.warn("failed to send subscription charge-failed notification", {
            subscriptionId: subscription.id,
            paymentId: payment.id,
            message: error?.message || "Notification failed",
          })
        }

        failedPaymentAttempts += 1
        failedPayments += 1

        log.warn("charge failed", {
          subscriptionId: subscription.id,
          paymentId: payment.id,
          message: errorMessage,
        })

        if (failedPaymentAttempts >= MAX_FAILED_ATTEMPTS) {
          updatedStatus = "DEFAULTED"
          nextChargeDate = null
        }

        let endedAt = null
        if (updatedStatus === "DEFAULTED") {
          endedAt = currentTime
        }

        await resolvedPrisma.serviceSubscription.update({
          where: { id: subscription.id },
          data: {
            status: updatedStatus,
            nextChargeDate,
            failedPaymentAttempts,
            lastFailedChargeAt: currentTime,
            endedAt,
          },
        })

        if (updatedStatus === "DEFAULTED") {
          try {
            await resolvedPostInternalApi({
              route: "/internal/notifications/subscriptions/defaulted",
              body: { subscriptionId: subscription.id },
            })
          } catch (error) {
            log.warn("failed to send subscription defaulted notification", {
              subscriptionId: subscription.id,
              message: error?.message || "Notification failed",
            })
          }
        }
      }

      processedSubscriptions += 1
      await updateJobRunProgress(resolvedPrisma, jobRun.id, {
        totalSubscriptions,
        processedSubscriptions,
        totalChargesDue,
        processedCharges,
        succeededPayments,
        failedPayments,
        skippedCharges,
      })
    }

    const summary = {
      totalSubscriptions,
      processedSubscriptions,
      totalChargesDue,
      processedCharges,
      succeededPayments,
      failedPayments,
      skippedCharges,
    }

    await resolvedPrisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "COMPLETED",
        completedAt: currentTime,
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
        completedAt: currentTime,
        error: errorMessage,
      },
    })

    log.error("failed", { message: errorMessage })
    throw error
  }
}
