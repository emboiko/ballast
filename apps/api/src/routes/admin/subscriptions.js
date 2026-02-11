import { Router } from "express"
import { requireAdmin } from "../../middleware/admin.js"
import {
  listServiceSubscriptions,
  getServiceSubscriptionById,
} from "../../lib/admin/index.js"

const router = Router()

const normalizeStatusParam = (status) => {
  if (typeof status !== "string") {
    return "ALL"
  }

  const normalized = status.trim().toUpperCase()
  if (
    normalized === "ACTIVE" ||
    normalized === "CANCELED" ||
    normalized === "DEFAULTED" ||
    normalized === "ALL"
  ) {
    return normalized
  }

  return "ALL"
}

router.get("/", requireAdmin, async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10)
    const offset = Number.parseInt(req.query.offset, 10)
    const userId =
      typeof req.query.userId === "string" ? req.query.userId : undefined
    const status = normalizeStatusParam(req.query.status)

    const result = await listServiceSubscriptions({
      limit: Number.isNaN(limit) ? 25 : limit,
      offset: Number.isNaN(offset) ? 0 : offset,
      userId,
      status,
    })

    res.json(result)
  } catch (error) {
    console.error("List subscriptions error:", error)
    res.status(500).json({ error: "Failed to fetch subscriptions" })
  }
})

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getServiceSubscriptionById(req.params.id)
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
