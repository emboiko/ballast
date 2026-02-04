import { Router } from "express"
import { requireAdmin } from "../../middleware/admin.js"
import {
  listContactSubmissions,
  getContactSubmissionById,
  setContactSubmissionReadStatus,
  deleteContactSubmission,
} from "../../lib/admin/index.js"

const router = Router()

// GET /admin/contact-submissions?limit=25&offset=0&unread=true&userId=abc
router.get("/", requireAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const unreadParam =
      typeof req.query.unread === "string" ? req.query.unread : null
    const userId =
      typeof req.query.userId === "string" ? req.query.userId : null

    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "limit must be between 1 and 100" })
    }

    if (Number.isNaN(offset) || offset < 0) {
      return res.status(400).json({ error: "offset must be non-negative" })
    }

    let unreadOnly = false
    if (unreadParam === "true") {
      unreadOnly = true
    }

    const results = await listContactSubmissions({
      limit,
      offset,
      unreadOnly,
      userId,
    })

    res.json(results)
  } catch (error) {
    console.error("List contact submissions error:", error)
    res.status(500).json({ error: "Failed to fetch contact submissions" })
  }
})

// GET /admin/contact-submissions/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getContactSubmissionById(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ submission: result.submission })
  } catch (error) {
    console.error("Get contact submission error:", error)
    res.status(500).json({ error: "Failed to fetch contact submission" })
  }
})

// PATCH /admin/contact-submissions/:id/read
router.patch("/:id/read", requireAdmin, async (req, res) => {
  try {
    const isRead = Boolean(req.body && req.body.isRead)

    const result = await setContactSubmissionReadStatus(req.params.id, isRead)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ submission: result.submission })
  } catch (error) {
    console.error("Update contact submission read status error:", error)
    res.status(500).json({ error: "Failed to update read status" })
  }
})

// DELETE /admin/contact-submissions/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await deleteContactSubmission(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ success: true })
  } catch (error) {
    console.error("Delete contact submission error:", error)
    res.status(500).json({ error: "Failed to delete contact submission" })
  }
})

export default router
