import { Router } from "express"
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

router.post("/subscriptions/upcoming-charge", async (req, res) => {
  try {
    const result = await sendSubscriptionUpcomingChargeReminderNotification({
      subscriptionId: req.body?.subscriptionId,
      scheduledFor: req.body?.scheduledFor,
      daysBefore: req.body?.daysBefore,
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
    const result = await sendSubscriptionChargeFailedNotification({
      paymentId: req.body?.paymentId,
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
    const result = await sendSubscriptionDefaultedNotification({
      subscriptionId: req.body?.subscriptionId,
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
    const result = await sendFinancingUpcomingInstallmentReminderNotification({
      planId: req.body?.planId,
      dueDate: req.body?.dueDate,
      daysBefore: req.body?.daysBefore,
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
    const result = await sendFinancingChargeFailedNotification({
      paymentId: req.body?.paymentId,
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
    const result = await sendFinancingPlanDefaultedNotification({
      planId: req.body?.planId,
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

