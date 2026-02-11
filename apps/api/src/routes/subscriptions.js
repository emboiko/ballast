import { Router } from "express"
import { requireAuth, requireVerified } from "../middleware/auth.js"
import {
  getUserSubscription,
  listUserSubscriptions,
} from "../lib/subscriptions.js"

const router = Router()

// GET /subscriptions
router.get("/", requireAuth, requireVerified, async (req, res) => {
  try {
    const result = await listUserSubscriptions(req.user.id)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }
    return res.json({ subscriptions: result.subscriptions })
  } catch (error) {
    console.error("List subscriptions error:", error)
    return res.status(500).json({ error: "Failed to list subscriptions" })
  }
})

// GET /subscriptions/:id
router.get("/:id", requireAuth, requireVerified, async (req, res) => {
  try {
    const result = await getUserSubscription(req.user.id, req.params.id)
    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }
    return res.json({ subscription: result.subscription })
  } catch (error) {
    console.error("Get subscription error:", error)
    return res.status(500).json({ error: "Failed to fetch subscription" })
  }
})

export default router
