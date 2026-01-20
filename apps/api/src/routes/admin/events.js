import { Router } from "express"
import { requireAdmin } from "@/middleware/admin.js"
import { listSystemEvents } from "@/lib/admin/events.js"

const router = Router()

const parseDateValue = (value) => {
  if (typeof value !== "string") {
    return null
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

// GET /admin/events?limit=25&before=2024-01-01T00:00:00.000Z&after=2024-01-02T00:00:00.000Z
router.get("/", requireAdmin, async (req, res) => {
  try {
    const limitRaw = req.query.limit
    let limit = 25
    if (typeof limitRaw === "string") {
      const parsed = Number.parseInt(limitRaw, 10)
      if (Number.isFinite(parsed)) {
        limit = parsed
      }
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "limit must be between 1 and 100" })
    }

    const before = parseDateValue(req.query.before)
    const after = parseDateValue(req.query.after)

    if (req.query.before && !before) {
      return res
        .status(400)
        .json({ error: "before must be an ISO date string" })
    }

    if (req.query.after && !after) {
      return res.status(400).json({ error: "after must be an ISO date string" })
    }

    if (before && after) {
      return res
        .status(400)
        .json({ error: "Use either before or after, not both" })
    }

    const results = await listSystemEvents({ limit, before, after })
    res.json(results)
  } catch (error) {
    console.error("List events error:", error)
    res.status(500).json({ error: "Failed to list system events" })
  }
})

export default router
