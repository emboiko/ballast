import { Router } from "express"
import { requireAdmin } from "../../middleware/admin.js"
import {
  listCommunicationEmails,
  getCommunicationEmailById,
  replyToCommunicationEmail,
  setCommunicationEmailReadStatus,
  deleteCommunicationEmail,
} from "../../lib/admin/index.js"

const router = Router()

// GET /admin/communications/emails?limit=25&offset=0&threadKey=...
router.get("/emails", requireAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const threadKey =
      typeof req.query.threadKey === "string" ? req.query.threadKey : null
    const directionParam =
      typeof req.query.direction === "string" ? req.query.direction : null
    const unreadParam =
      typeof req.query.unread === "string" ? req.query.unread : null

    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "limit must be between 1 and 100" })
    }

    if (Number.isNaN(offset) || offset < 0) {
      return res.status(400).json({ error: "offset must be non-negative" })
    }

    let direction = null
    if (directionParam === "INBOUND") {
      direction = "INBOUND"
    }
    if (directionParam === "OUTBOUND") {
      direction = "OUTBOUND"
    }

    let unreadOnly = false
    if (unreadParam === "true") {
      unreadOnly = true
    }

    const results = await listCommunicationEmails({
      limit,
      offset,
      threadKey: threadKey || undefined,
      direction: direction || undefined,
      unreadOnly,
    })

    res.json(results)
  } catch (error) {
    console.error("List communications emails error:", error)
    res.status(500).json({ error: "Failed to fetch emails" })
  }
})

// GET /admin/communications/emails/:id
router.get("/emails/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getCommunicationEmailById(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ email: result.email })
  } catch (error) {
    console.error("Get communications email error:", error)
    res.status(500).json({ error: "Failed to fetch email" })
  }
})

// POST /admin/communications/emails/:id/reply
router.post("/emails/:id/reply", requireAdmin, async (req, res) => {
  try {
    const replyText =
      req.body && typeof req.body.replyText === "string"
        ? req.body.replyText
        : ""

    const result = await replyToCommunicationEmail({
      emailId: req.params.id,
      replyText,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json({ email: result.outboundEmail })
  } catch (error) {
    console.error("Reply to communications email error:", error)
    res.status(500).json({ error: "Failed to send reply" })
  }
})

// PATCH /admin/communications/emails/:id/read
router.patch("/emails/:id/read", requireAdmin, async (req, res) => {
  try {
    const isRead = Boolean(req.body && req.body.isRead)

    const result = await setCommunicationEmailReadStatus(req.params.id, isRead)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ email: result.email })
  } catch (error) {
    console.error("Update email read status error:", error)
    res.status(500).json({ error: "Failed to update read status" })
  }
})

// DELETE /admin/communications/emails/:id
router.delete("/emails/:id", requireAdmin, async (req, res) => {
  try {
    const result = await deleteCommunicationEmail(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ success: true })
  } catch (error) {
    console.error("Delete communications email error:", error)
    res.status(500).json({ error: "Failed to delete email" })
  }
})

export default router
