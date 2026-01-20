import { Router } from "express"
import { requireAdmin } from "../../middleware/admin.js"
import {
  searchUsers,
  searchOrders,
  searchRefunds,
} from "../../lib/admin/index.js"

const router = Router()

// GET /admin/search?q=...&type=all|users|orders|refunds&limit=5&offset=0
router.get("/", requireAdmin, async (req, res) => {
  try {
    const query = req.query.q || ""
    const type = req.query.type || "all"
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0

    if (limit < 1 || limit > 50) {
      return res.status(400).json({ error: "limit must be between 1 and 50" })
    }
    if (offset < 0) {
      return res.status(400).json({ error: "offset must be non-negative" })
    }

    const results = {}

    if (type === "all" || type === "users") {
      results.users = await searchUsers(query, { limit, offset })
    }

    if (type === "all" || type === "orders") {
      results.orders = await searchOrders(query, { limit, offset })
    }

    if (type === "all" || type === "refunds") {
      results.refunds = await searchRefunds(query, { limit, offset })
    }

    res.json(results)
  } catch (error) {
    console.error("Admin search error:", error)
    res.status(500).json({ error: "Search failed" })
  }
})

export default router
