import { z } from "zod"
import prisma from "../../../../packages/shared/src/db/client.js"
import { getPaymentIntentSummary } from "../gateways/stripeGateway.js"
import { sendSubscriptionActivatedNotification } from "./notifications/notifications.js"

const subscriptionIntervalSchema = z.enum([
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
])

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

export const addIntervalToDateUtc = ({ date, interval }) => {
  const monthsToAdd = getIntervalMonths(interval)
  if (!monthsToAdd) {
    throw new Error("Invalid interval")
  }
  return addMonthsClampedUtc(date, monthsToAdd)
}

const buildOrderPaymentKey = ({ paymentIntentId, serviceId }) => {
  return `order:${paymentIntentId}:${serviceId}`
}

export const createServiceSubscriptionsFromOrder = async ({
  userId,
  orderId,
  paymentIntentId,
  now,
}) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }
  if (!orderId) {
    return { success: false, error: "Order ID is required" }
  }
  if (typeof paymentIntentId !== "string" || !paymentIntentId.trim()) {
    return { success: false, error: "Payment intent ID is required" }
  }

  let resolvedNow = now
  if (!resolvedNow) {
    resolvedNow = new Date()
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { stripeCustomerId: true } } },
  })

  if (!order) {
    return { success: false, error: "Order not found" }
  }
  if (order.userId !== userId) {
    return { success: false, error: "Order does not belong to user" }
  }

  const serviceItems = (order.items || []).filter(
    (item) => item.type === "service"
  )
  if (serviceItems.length === 0) {
    return { success: true, createdCount: 0 }
  }

  const { paymentIntent, paymentMethodId, paymentMethodDetails } =
    await getPaymentIntentSummary(paymentIntentId)

  if (paymentIntent.status !== "succeeded") {
    return { success: false, error: "Payment intent has not succeeded" }
  }

  let customerId = null
  if (typeof paymentIntent.customer === "string") {
    customerId = paymentIntent.customer
  } else if (paymentIntent.customer?.id) {
    customerId = paymentIntent.customer.id
  }

  if (!customerId) {
    customerId = order.user?.stripeCustomerId || null
  }

  if (!customerId) {
    return { success: false, error: "Missing Stripe customer ID" }
  }
  if (!paymentMethodId) {
    return {
      success: false,
      error: "Payment method is required for subscriptions",
    }
  }

  let createdCount = 0

  for (const orderItem of serviceItems) {
    const serviceId = orderItem.itemId

    let parsedInterval = null
    if (orderItem.subscriptionInterval) {
      const intervalResult = subscriptionIntervalSchema.safeParse(
        orderItem.subscriptionInterval
      )
      if (intervalResult.success) {
        parsedInterval = intervalResult.data
      }
    }
    if (!parsedInterval) {
      parsedInterval = "MONTHLY"
    }

    if (!Number.isInteger(orderItem.priceCents) || orderItem.priceCents <= 0) {
      return { success: false, error: "Invalid service price" }
    }

    const quantity =
      typeof orderItem.quantity === "number" ? orderItem.quantity : 1
    if (quantity !== 1) {
      return { success: false, error: "Invalid service quantity" }
    }

    let intervalPrice = await prisma.serviceIntervalPrice.findUnique({
      where: {
        serviceId_interval: {
          serviceId,
          interval: parsedInterval,
        },
      },
    })

    if (!intervalPrice) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { priceCents: true },
      })

      if (
        !service ||
        !Number.isInteger(service.priceCents) ||
        service.priceCents <= 0
      ) {
        return { success: false, error: "Service not found" }
      }

      const monthsToAdd = getIntervalMonths(parsedInterval)
      if (!monthsToAdd) {
        return { success: false, error: "Invalid interval" }
      }

      try {
        intervalPrice = await prisma.serviceIntervalPrice.create({
          data: {
            serviceId,
            interval: parsedInterval,
            priceCents: service.priceCents * monthsToAdd,
            isEnabled: true,
          },
        })
      } catch {
        intervalPrice = await prisma.serviceIntervalPrice.findUnique({
          where: {
            serviceId_interval: {
              serviceId,
              interval: parsedInterval,
            },
          },
        })
      }
    }

    if (!intervalPrice || intervalPrice.isEnabled !== true) {
      return {
        success: false,
        error: "Selected subscription interval is not available",
      }
    }

    const existingActiveSubscription =
      await prisma.serviceSubscription.findFirst({
        where: { userId, serviceId, status: "ACTIVE" },
        select: { id: true },
      })

    const orderPaymentKey = buildOrderPaymentKey({ paymentIntentId, serviceId })

    if (existingActiveSubscription) {
      const existingOrderPayment =
        await prisma.serviceSubscriptionPayment.findFirst({
          where: {
            subscriptionId: existingActiveSubscription.id,
            processorPaymentId: orderPaymentKey,
          },
          select: { id: true },
        })

      if (existingOrderPayment) {
        continue
      }

      return {
        success: false,
        error: "You already have an active subscription for this service",
      }
    }

    const periodStartDate = order.createdAt || resolvedNow
    const nextChargeDate = addIntervalToDateUtc({
      date: periodStartDate,
      interval: parsedInterval,
    })

    const subscription = await prisma.serviceSubscription.create({
      data: {
        userId,
        serviceId,
        processor: "STRIPE",
        processorPaymentMethodId: paymentMethodId,
        processorCustomerId: customerId,
        processorPaymentMethod: paymentMethodDetails,
        currency: order.currency || "usd",
        interval: parsedInterval,
        priceCents: orderItem.priceCents,
        status: "ACTIVE",
        nextChargeDate,
      },
      select: { id: true },
    })

    await prisma.serviceSubscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        status: "SUCCEEDED",
        amountCents: orderItem.priceCents,
        currency: order.currency || "usd",
        scheduledFor: periodStartDate,
        paidAt: periodStartDate,
        processorPaymentId: orderPaymentKey,
      },
    })

    try {
      await sendSubscriptionActivatedNotification({
        subscriptionId: subscription.id,
      })
    } catch (error) {
      console.warn("Failed to send subscription activated email:", error)
    }

    createdCount += 1
  }

  return { success: true, createdCount }
}

export const listUserSubscriptions = async (userId) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  const subscriptions = await prisma.serviceSubscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
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
      service: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  return { success: true, subscriptions }
}

export const getUserSubscription = async (userId, subscriptionId) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }
  if (!subscriptionId) {
    return { success: false, error: "Subscription ID is required" }
  }

  const subscription = await prisma.serviceSubscription.findFirst({
    where: { id: subscriptionId, userId },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          longDescription: true,
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
