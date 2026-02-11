import { Router } from "express"
import { z } from "zod"
import { requireAdmin } from "../../middleware/admin.js"
import {
  searchUsers,
  searchOrders,
  searchRefunds,
  searchFinancingPlans,
} from "../../lib/admin/index.js"

const router = Router()

const adminSearchQuerySchema = z.object({
  q: z.coerce.string().optional().default(""),
  type: z
    .enum(["all", "users", "orders", "refunds", "financing"])
    .optional()
    .default("all"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(5),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

// GET /admin/search?q=...&type=all|users|orders|refunds|financing&limit=5&offset=0
router.get("/", requireAdmin, async (req, res) => {
  try {
    const parsedQuery = adminSearchQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const query = parsedQuery.data.q
    const type = parsedQuery.data.type
    const limit = parsedQuery.data.limit
    const offset = parsedQuery.data.offset

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

    if (type === "all" || type === "financing") {
      results.financing = await searchFinancingPlans(query, { limit, offset })
    }

    res.json(results)
  } catch (error) {
    console.error("Admin search error:", error)
    res.status(500).json({ error: "Search failed" })
  }
})

export default router
