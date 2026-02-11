import { z } from "zod"
import prisma from "../../../../../packages/shared/src/db/client.js"
import { formatMoney } from "../../../../../packages/shared/src/money.js"
import { PAYMENT_REMINDER_DAYS_BEFORE } from "../../constants.js"
import {
  sendFinancingChargeFailedEmail,
  sendFinancingPlanActivatedEmail,
  sendFinancingPlanDefaultedEmail,
  sendFinancingUpcomingInstallmentReminderEmail,
  sendSubscriptionActivatedEmail,
  sendSubscriptionChargeFailedEmail,
  sendSubscriptionDefaultedEmail,
  sendSubscriptionUpcomingChargeReminderEmail,
} from "../../gateways/emailGateway.js"

const CHANNEL_EMAIL = "email"

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

export const getDefaultReminderDaysBefore = () => {
  const parsed = parsePositiveIntOrNull(PAYMENT_REMINDER_DAYS_BEFORE)
  if (parsed) {
    return parsed
  }
  return 3
}

const toDateOrNull = (value) => {
  if (!value) {
    return null
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

const buildDedupeKey = ({
  type,
  entityType,
  entityId,
  scheduledFor,
  daysBefore,
}) => {
  let scheduledForPart = "none"
  if (scheduledFor) {
    scheduledForPart = scheduledFor.toISOString()
  }

  let daysBeforePart = "none"
  if (Number.isInteger(daysBefore)) {
    daysBeforePart = `${daysBefore}`
  }
  return `${type}:${entityType}:${entityId}:${scheduledForPart}:${daysBeforePart}`
}

const tryCreateNotification = async ({
  type,
  userId,
  entityType,
  entityId,
  scheduledFor,
  daysBefore,
}) => {
  const dedupeKey = buildDedupeKey({
    type,
    entityType,
    entityId,
    scheduledFor,
    daysBefore,
  })

  try {
    const notification = await prisma.automatedNotification.create({
      data: {
        type,
        channel: CHANNEL_EMAIL,
        userId,
        entityType,
        entityId,
        scheduledFor: scheduledFor || undefined,
        daysBefore: Number.isInteger(daysBefore) ? daysBefore : undefined,
        dedupeKey,
      },
    })
    return { created: true, notification }
  } catch (error) {
    if (error?.code === "P2002") {
      return { created: false, notification: null }
    }
    throw error
  }
}

const getIntervalLabel = (interval) => {
  if (interval === "MONTHLY") {
    return "Monthly"
  }
  if (interval === "QUARTERLY") {
    return "Quarterly"
  }
  if (interval === "SEMI_ANNUAL") {
    return "6-month"
  }
  if (interval === "ANNUAL") {
    return "12-month"
  }
  return String(interval || "—")
}

const getCadenceLabel = (cadence) => {
  if (cadence === "WEEKLY") {
    return "Weekly"
  }
  if (cadence === "MONTHLY") {
    return "Monthly"
  }
  return String(cadence || "—")
}

export const sendSubscriptionActivatedNotification = async ({ subscriptionId }) => {
  const parsed = z.string().min(1).safeParse(subscriptionId)
  if (!parsed.success) {
    return { success: false, sent: false, skipped: false, error: "Invalid subscriptionId" }
  }

  const subscription = await prisma.serviceSubscription.findUnique({
    where: { id: parsed.data },
    select: {
      id: true,
      interval: true,
      priceCents: true,
      nextChargeDate: true,
      user: { select: { id: true, email: true } },
      service: { select: { name: true } },
    },
  })

  if (!subscription?.user?.email) {
    return { success: false, sent: false, skipped: false, error: "User email not found" }
  }

  const attempt = await tryCreateNotification({
    type: "subscription.activated",
    userId: subscription.user.id,
    entityType: "serviceSubscription",
    entityId: subscription.id,
    scheduledFor: null,
    daysBefore: null,
  })

  if (!attempt.created) {
    return { success: true, sent: false, skipped: true }
  }

  const emailResult = await sendSubscriptionActivatedEmail({
    to: subscription.user.email,
    subscriptionId: subscription.id,
    serviceName: subscription.service?.name || "Service",
    intervalLabel: getIntervalLabel(subscription.interval),
    formattedPrice: formatMoney(subscription.priceCents),
    nextChargeDate: subscription.nextChargeDate,
  })

  if (!emailResult.success) {
    return { success: false, sent: false, skipped: false, error: emailResult.error }
  }

  return { success: true, sent: true, skipped: false }
}

export const sendSubscriptionUpcomingChargeReminderNotification = async ({
  subscriptionId,
  scheduledFor,
  daysBefore,
}) => {
  const schema = z.object({
    subscriptionId: z.string().min(1),
    scheduledFor: z.union([z.string().min(1), z.date()]),
    daysBefore: z.number().int().positive(),
  })

  const parsed = schema.safeParse({ subscriptionId, scheduledFor, daysBefore })
  if (!parsed.success) {
    return { success: false, sent: false, skipped: false, error: "Invalid input" }
  }

  const scheduledForDate = toDateOrNull(parsed.data.scheduledFor)
  if (!scheduledForDate) {
    return { success: false, sent: false, skipped: false, error: "Invalid scheduledFor" }
  }

  const subscription = await prisma.serviceSubscription.findUnique({
    where: { id: parsed.data.subscriptionId },
    select: {
      id: true,
      priceCents: true,
      user: { select: { id: true, email: true } },
      service: { select: { name: true } },
    },
  })

  if (!subscription?.user?.email) {
    return { success: false, sent: false, skipped: false, error: "User email not found" }
  }

  const attempt = await tryCreateNotification({
    type: "subscription.upcoming_charge",
    userId: subscription.user.id,
    entityType: "serviceSubscription",
    entityId: subscription.id,
    scheduledFor: scheduledForDate,
    daysBefore: parsed.data.daysBefore,
  })

  if (!attempt.created) {
    return { success: true, sent: false, skipped: true }
  }

  const emailResult = await sendSubscriptionUpcomingChargeReminderEmail({
    to: subscription.user.email,
    subscriptionId: subscription.id,
    serviceName: subscription.service?.name || "Service",
    formattedAmount: formatMoney(subscription.priceCents),
    scheduledFor: scheduledForDate,
    daysBefore: parsed.data.daysBefore,
  })

  if (!emailResult.success) {
    return { success: false, sent: false, skipped: false, error: emailResult.error }
  }

  return { success: true, sent: true, skipped: false }
}

export const sendSubscriptionChargeFailedNotification = async ({ paymentId }) => {
  const parsed = z.string().min(1).safeParse(paymentId)
  if (!parsed.success) {
    return { success: false, sent: false, skipped: false, error: "Invalid paymentId" }
  }

  const payment = await prisma.serviceSubscriptionPayment.findUnique({
    where: { id: parsed.data },
    select: {
      id: true,
      status: true,
      amountCents: true,
      scheduledFor: true,
      failureMessage: true,
      subscription: {
        select: {
          id: true,
          user: { select: { id: true, email: true } },
          service: { select: { name: true } },
        },
      },
    },
  })

  if (!payment?.subscription?.user?.email) {
    return { success: false, sent: false, skipped: false, error: "User email not found" }
  }

  if (payment.status !== "FAILED") {
    return { success: true, sent: false, skipped: true }
  }

  const attempt = await tryCreateNotification({
    type: "subscription.charge_failed",
    userId: payment.subscription.user.id,
    entityType: "serviceSubscription",
    entityId: payment.subscription.id,
    scheduledFor: payment.scheduledFor,
    daysBefore: null,
  })

  if (!attempt.created) {
    return { success: true, sent: false, skipped: true }
  }

  const emailResult = await sendSubscriptionChargeFailedEmail({
    to: payment.subscription.user.email,
    subscriptionId: payment.subscription.id,
    serviceName: payment.subscription.service?.name || "Service",
    formattedAmount: formatMoney(payment.amountCents),
    scheduledFor: payment.scheduledFor,
    failureMessage: payment.failureMessage || undefined,
  })

  if (!emailResult.success) {
    return { success: false, sent: false, skipped: false, error: emailResult.error }
  }

  return { success: true, sent: true, skipped: false }
}

export const sendSubscriptionDefaultedNotification = async ({ subscriptionId }) => {
  const parsed = z.string().min(1).safeParse(subscriptionId)
  if (!parsed.success) {
    return { success: false, sent: false, skipped: false, error: "Invalid subscriptionId" }
  }

  const subscription = await prisma.serviceSubscription.findUnique({
    where: { id: parsed.data },
    select: {
      id: true,
      status: true,
      user: { select: { id: true, email: true } },
      service: { select: { name: true } },
    },
  })

  if (!subscription?.user?.email) {
    return { success: false, sent: false, skipped: false, error: "User email not found" }
  }

  if (subscription.status !== "DEFAULTED") {
    return { success: true, sent: false, skipped: true }
  }

  const attempt = await tryCreateNotification({
    type: "subscription.defaulted",
    userId: subscription.user.id,
    entityType: "serviceSubscription",
    entityId: subscription.id,
    scheduledFor: null,
    daysBefore: null,
  })

  if (!attempt.created) {
    return { success: true, sent: false, skipped: true }
  }

  const emailResult = await sendSubscriptionDefaultedEmail({
    to: subscription.user.email,
    subscriptionId: subscription.id,
    serviceName: subscription.service?.name || "Service",
  })

  if (!emailResult.success) {
    return { success: false, sent: false, skipped: false, error: emailResult.error }
  }

  return { success: true, sent: true, skipped: false }
}

export const sendFinancingPlanActivatedNotification = async ({ planId }) => {
  const parsed = z.string().min(1).safeParse(planId)
  if (!parsed.success) {
    return { success: false, sent: false, skipped: false, error: "Invalid planId" }
  }

  const plan = await prisma.financingPlan.findUnique({
    where: { id: parsed.data },
    select: {
      id: true,
      status: true,
      totalAmountCents: true,
      downPaymentCents: true,
      installmentAmountCents: true,
      cadence: true,
      termCount: true,
      nextPaymentDate: true,
      user: { select: { id: true, email: true } },
    },
  })

  if (!plan?.user?.email) {
    return { success: false, sent: false, skipped: false, error: "User email not found" }
  }

  if (plan.status !== "ACTIVE") {
    return { success: true, sent: false, skipped: true }
  }

  const attempt = await tryCreateNotification({
    type: "financing.activated",
    userId: plan.user.id,
    entityType: "financingPlan",
    entityId: plan.id,
    scheduledFor: null,
    daysBefore: null,
  })

  if (!attempt.created) {
    return { success: true, sent: false, skipped: true }
  }

  const emailResult = await sendFinancingPlanActivatedEmail({
    to: plan.user.email,
    planId: plan.id,
    formattedTotal: formatMoney(plan.totalAmountCents),
    formattedDownPayment: formatMoney(plan.downPaymentCents),
    formattedInstallmentAmount: formatMoney(plan.installmentAmountCents),
    cadenceLabel: getCadenceLabel(plan.cadence),
    termCount: plan.termCount,
    nextPaymentDate: plan.nextPaymentDate,
  })

  if (!emailResult.success) {
    return { success: false, sent: false, skipped: false, error: emailResult.error }
  }

  return { success: true, sent: true, skipped: false }
}

export const sendFinancingUpcomingInstallmentReminderNotification = async ({
  planId,
  dueDate,
  daysBefore,
}) => {
  const schema = z.object({
    planId: z.string().min(1),
    dueDate: z.union([z.string().min(1), z.date()]),
    daysBefore: z.number().int().positive(),
  })

  const parsed = schema.safeParse({ planId, dueDate, daysBefore })
  if (!parsed.success) {
    return { success: false, sent: false, skipped: false, error: "Invalid input" }
  }

  const dueDateValue = toDateOrNull(parsed.data.dueDate)
  if (!dueDateValue) {
    return { success: false, sent: false, skipped: false, error: "Invalid dueDate" }
  }

  const plan = await prisma.financingPlan.findUnique({
    where: { id: parsed.data.planId },
    select: {
      id: true,
      status: true,
      installmentAmountCents: true,
      user: { select: { id: true, email: true } },
    },
  })

  if (!plan?.user?.email) {
    return { success: false, sent: false, skipped: false, error: "User email not found" }
  }

  if (plan.status !== "ACTIVE") {
    return { success: true, sent: false, skipped: true }
  }

  const attempt = await tryCreateNotification({
    type: "financing.upcoming_installment",
    userId: plan.user.id,
    entityType: "financingPlan",
    entityId: plan.id,
    scheduledFor: dueDateValue,
    daysBefore: parsed.data.daysBefore,
  })

  if (!attempt.created) {
    return { success: true, sent: false, skipped: true }
  }

  const emailResult = await sendFinancingUpcomingInstallmentReminderEmail({
    to: plan.user.email,
    planId: plan.id,
    formattedAmount: formatMoney(plan.installmentAmountCents),
    dueDate: dueDateValue,
    daysBefore: parsed.data.daysBefore,
  })

  if (!emailResult.success) {
    return { success: false, sent: false, skipped: false, error: emailResult.error }
  }

  return { success: true, sent: true, skipped: false }
}

export const sendFinancingChargeFailedNotification = async ({ paymentId }) => {
  const parsed = z.string().min(1).safeParse(paymentId)
  if (!parsed.success) {
    return { success: false, sent: false, skipped: false, error: "Invalid paymentId" }
  }

  const payment = await prisma.financingPayment.findUnique({
    where: { id: parsed.data },
    select: {
      id: true,
      status: true,
      amountCents: true,
      scheduledFor: true,
      failureMessage: true,
      plan: {
        select: {
          id: true,
          user: { select: { id: true, email: true } },
        },
      },
    },
  })

  if (!payment?.plan?.user?.email) {
    return { success: false, sent: false, skipped: false, error: "User email not found" }
  }

  if (payment.status !== "FAILED") {
    return { success: true, sent: false, skipped: true }
  }

  const attempt = await tryCreateNotification({
    type: "financing.charge_failed",
    userId: payment.plan.user.id,
    entityType: "financingPlan",
    entityId: payment.plan.id,
    scheduledFor: payment.scheduledFor,
    daysBefore: null,
  })

  if (!attempt.created) {
    return { success: true, sent: false, skipped: true }
  }

  const emailResult = await sendFinancingChargeFailedEmail({
    to: payment.plan.user.email,
    planId: payment.plan.id,
    formattedAmount: formatMoney(payment.amountCents),
    dueDate: payment.scheduledFor,
    failureMessage: payment.failureMessage || undefined,
  })

  if (!emailResult.success) {
    return { success: false, sent: false, skipped: false, error: emailResult.error }
  }

  return { success: true, sent: true, skipped: false }
}

export const sendFinancingPlanDefaultedNotification = async ({ planId }) => {
  const parsed = z.string().min(1).safeParse(planId)
  if (!parsed.success) {
    return { success: false, sent: false, skipped: false, error: "Invalid planId" }
  }

  const plan = await prisma.financingPlan.findUnique({
    where: { id: parsed.data },
    select: {
      id: true,
      status: true,
      user: { select: { id: true, email: true } },
    },
  })

  if (!plan?.user?.email) {
    return { success: false, sent: false, skipped: false, error: "User email not found" }
  }

  if (plan.status !== "DEFAULTED") {
    return { success: true, sent: false, skipped: true }
  }

  const attempt = await tryCreateNotification({
    type: "financing.defaulted",
    userId: plan.user.id,
    entityType: "financingPlan",
    entityId: plan.id,
    scheduledFor: null,
    daysBefore: null,
  })

  if (!attempt.created) {
    return { success: true, sent: false, skipped: true }
  }

  const emailResult = await sendFinancingPlanDefaultedEmail({
    to: plan.user.email,
    planId: plan.id,
  })

  if (!emailResult.success) {
    return { success: false, sent: false, skipped: false, error: emailResult.error }
  }

  return { success: true, sent: true, skipped: false }
}

