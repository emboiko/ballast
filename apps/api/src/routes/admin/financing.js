import { Router } from "express"
import { requireAdmin } from "../../middleware/admin.js"
import {
  listFinancingPlans,
  getFinancingPlanById,
} from "../../lib/admin/financing.js"

const router = Router()

// GET /admin/financing?limit=25&offset=0&userId=abc
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

    const results = await listFinancingPlans({
      limit,
      offset,
      userId,
    })

    res.json(results)
  } catch (error) {
    console.error("List financing plans error:", error)
    res.status(500).json({ error: "Failed to list financing plans" })
  }
})

// GET /admin/financing/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getFinancingPlanById(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ plan: result.plan })
  } catch (error) {
    console.error("Get financing plan error:", error)
    res.status(500).json({ error: "Failed to fetch financing plan" })
  }
})

export default router
