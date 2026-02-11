import { Router } from "express"
import { z } from "zod"
import { requireInternalJobsAuth } from "../../middleware/internalJobsAuth.js"
import {
  sendFinancingChargeFailedNotification,
  sendFinancingPlanDefaultedNotification,
  sendFinancingUpcomingInstallmentReminderNotification,
  sendSubscriptionChargeFailedNotification,
  sendSubscriptionDefaultedNotification,
  sendSubscriptionUpcomingChargeReminderNotification,
} from "../../lib/notifications/notifications.js"

const router = Router()

router.use(requireInternalJobsAuth)

const subscriptionUpcomingChargeBodySchema = z.object({
  subscriptionId: z.string().trim().min(1),
  scheduledFor: z.string().trim().min(1),
  daysBefore: z.number().int().positive(),
})

const subscriptionChargeFailedBodySchema = z.object({
  paymentId: z.string().trim().min(1),
})

const subscriptionDefaultedBodySchema = z.object({
  subscriptionId: z.string().trim().min(1),
})

const financingUpcomingChargeBodySchema = z.object({
  planId: z.string().trim().min(1),
  dueDate: z.string().trim().min(1),
  daysBefore: z.number().int().positive(),
})

const financingChargeFailedBodySchema = z.object({
  paymentId: z.string().trim().min(1),
})

const financingDefaultedBodySchema = z.object({
  planId: z.string().trim().min(1),
})

router.post("/subscriptions/upcoming-charge", async (req, res) => {
  try {
    const parsedBody = subscriptionUpcomingChargeBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await sendSubscriptionUpcomingChargeReminderNotification({
      subscriptionId: parsedBody.data.subscriptionId,
      scheduledFor: parsedBody.data.scheduledFor,
      daysBefore: parsedBody.data.daysBefore,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Invalid request" })
    }

    return res.json(result)
  } catch (error) {
    console.error("Internal subscription upcoming-charge error:", error)
    return res.status(500).json({ error: "Failed to send notification" })
  }
})

router.post("/subscriptions/charge-failed", async (req, res) => {
  try {
    const parsedBody = subscriptionChargeFailedBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await sendSubscriptionChargeFailedNotification({
      paymentId: parsedBody.data.paymentId,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Invalid request" })
    }

    return res.json(result)
  } catch (error) {
    console.error("Internal subscription charge-failed error:", error)
    return res.status(500).json({ error: "Failed to send notification" })
  }
})

router.post("/subscriptions/defaulted", async (req, res) => {
  try {
    const parsedBody = subscriptionDefaultedBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await sendSubscriptionDefaultedNotification({
      subscriptionId: parsedBody.data.subscriptionId,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Invalid request" })
    }

    return res.json(result)
  } catch (error) {
    console.error("Internal subscription defaulted error:", error)
    return res.status(500).json({ error: "Failed to send notification" })
  }
})

router.post("/financing/upcoming-charge", async (req, res) => {
  try {
    const parsedBody = financingUpcomingChargeBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await sendFinancingUpcomingInstallmentReminderNotification({
      planId: parsedBody.data.planId,
      dueDate: parsedBody.data.dueDate,
      daysBefore: parsedBody.data.daysBefore,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Invalid request" })
    }

    return res.json(result)
  } catch (error) {
    console.error("Internal financing upcoming-charge error:", error)
    return res.status(500).json({ error: "Failed to send notification" })
  }
})

router.post("/financing/charge-failed", async (req, res) => {
  try {
    const parsedBody = financingChargeFailedBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await sendFinancingChargeFailedNotification({
      paymentId: parsedBody.data.paymentId,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Invalid request" })
    }

    return res.json(result)
  } catch (error) {
    console.error("Internal financing charge-failed error:", error)
    return res.status(500).json({ error: "Failed to send notification" })
  }
})

router.post("/financing/defaulted", async (req, res) => {
  try {
    const parsedBody = financingDefaultedBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await sendFinancingPlanDefaultedNotification({
      planId: parsedBody.data.planId,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Invalid request" })
    }

    return res.json(result)
  } catch (error) {
    console.error("Internal financing defaulted error:", error)
    return res.status(500).json({ error: "Failed to send notification" })
  }
})

export default router
