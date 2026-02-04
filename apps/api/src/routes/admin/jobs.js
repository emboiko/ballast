import { Router } from "express"
import { requireAdmin } from "../../middleware/admin.js"
import { listJobRuns, getJobRunById } from "../../lib/admin/index.js"

const router = Router()

// GET /admin/jobs?status=running|completed|failed|skipped&jobType=chargeFinancingPlans&limit=25&offset=0
router.get("/", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status
    const jobType = req.query.jobType
    const limitRaw = req.query.limit
    const offsetRaw = req.query.offset

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

    const results = await listJobRuns({
      status,
      jobType,
      limit,
      offset,
    })

    res.json(results)
  } catch (error) {
    console.error("List jobs error:", error)
    res.status(500).json({ error: "Failed to list job runs" })
  }
})

// GET /admin/jobs/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getJobRunById(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ jobRun: result.jobRun })
  } catch (error) {
    console.error("Get job run error:", error)
    res.status(500).json({ error: "Failed to fetch job run" })
  }
})

export default router
