import { Router } from "express"
import { requireAdmin } from "@/middleware/admin.js"
import {
  listOrders,
  getOrderById,
  getOrderStats,
  getOrderGrowth,
} from "@/lib/admin/orders.js"

const router = Router()

// GET /admin/orders?limit=25&offset=0&userId=abc
router.get("/", requireAdmin, async (req, res) => {
  try {
    const limitRaw = req.query.limit
    const offsetRaw = req.query.offset
    let userId
    if (typeof req.query.userId === "string") {
      userId = req.query.userId
    }

    let limit = 25
    if (typeof limitRaw === "string") {
      const parsed = Number.parseInt(limitRaw, 10)
      if (Number.isFinite(parsed)) {
        limit = parsed
      }
    }

    let offset = 0
    if (typeof offsetRaw === "string") {
      const parsed = Number.parseInt(offsetRaw, 10)
      if (Number.isFinite(parsed)) {
        offset = parsed
      }
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "limit must be between 1 and 100" })
    }

    if (!Number.isInteger(offset) || offset < 0) {
      return res.status(400).json({ error: "offset must be non-negative" })
    }

    const results = await listOrders({
      limit,
      offset,
      userId,
    })

    res.json(results)
  } catch (error) {
    console.error("List orders error:", error)
    res.status(500).json({ error: "Failed to list orders" })
  }
})

// GET /admin/orders/stats
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    let userId
    if (typeof req.query.userId === "string") {
      userId = req.query.userId
    }
    const result = await getOrderStats({ userId })

    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.error || "Failed to get stats" })
    }

    res.json({ stats: result.stats })
  } catch (error) {
    console.error("Order stats error:", error)
    res.status(500).json({ error: "Failed to fetch order stats" })
  }
})

// GET /admin/orders/growth?range=week|month|year|all
router.get("/growth", requireAdmin, async (req, res) => {
  try {
    const range = req.query.range
    let normalizedRange = "month"
    if (typeof range === "string") {
      normalizedRange = range
    }

    let userId
    if (typeof req.query.userId === "string") {
      userId = req.query.userId
    }

    const result = await getOrderGrowth({ range: normalizedRange, userId })

    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.error || "Failed to get growth" })
    }

    res.json({ range: result.range, buckets: result.buckets })
  } catch (error) {
    console.error("Order growth error:", error)
    res.status(500).json({ error: "Failed to fetch order growth" })
  }
})

// GET /admin/orders/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getOrderById(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ order: result.order })
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({ error: "Failed to fetch order" })
  }
})

export default router
