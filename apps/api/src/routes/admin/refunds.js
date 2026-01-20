import { Router } from "express"
import { requireAdmin } from "@/middleware/admin.js"
import { formatMoney } from "@ballast/shared/src/money.js"
import {
  listRefundRequests,
  getRefundRequestById,
  approveRefundRequest,
  denyRefundRequest,
  normalizeRefundStatus,
} from "@/lib/admin/refunds.js"
import {
  sendRefundProcessedEmail,
  sendRefundDeniedEmail,
} from "@/gateways/emailGateway.js"

const router = Router()

// GET /admin/refunds?status=pending|approved|rejected|failed&limit=25&offset=0&userId=abc
router.get("/", requireAdmin, async (req, res) => {
  try {
    const status = normalizeRefundStatus(req.query.status)
    const limitRaw = req.query.limit
    const offsetRaw = req.query.offset
    const userId =
      typeof req.query.userId === "string" ? req.query.userId : undefined

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

    const results = await listRefundRequests({
      status: status || undefined,
      limit,
      offset,
      userId,
    })

    res.json(results)
  } catch (error) {
    console.error("List refunds error:", error)
    res.status(500).json({ error: "Failed to list refunds" })
  }
})

// GET /admin/refunds/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getRefundRequestById(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ refund: result.refund })
  } catch (error) {
    console.error("Get refund error:", error)
    res.status(500).json({ error: "Failed to fetch refund request" })
  }
})

// POST /admin/refunds/:id/approve
router.post("/:id/approve", requireAdmin, async (req, res) => {
  try {
    const amountCents = req.body?.amountCents
    const parsedAmountCents =
      typeof amountCents === "number" ? amountCents : Number.NaN
    const adminMessage =
      typeof req.body?.adminMessage === "string" ? req.body.adminMessage : ""

    const result = await approveRefundRequest({
      refundId: req.params.id,
      adminUserId: req.user.id,
      amountCents: parsedAmountCents,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    const refund = result.refund
    if (
      refund?.requestedByUser?.email &&
      refund?.orderId &&
      refund?.amountCents
    ) {
      await sendRefundProcessedEmail({
        to: refund.requestedByUser.email,
        orderId: refund.orderId,
        formattedAmount: formatMoney(refund.amountCents),
        adminMessage,
      })
    }

    res.json({
      refund: result.refund,
      order: result.order,
      processorResult: result.processorResult,
    })
  } catch (error) {
    console.error("Approve refund error:", error)
    res.status(500).json({ error: "Failed to approve refund request" })
  }
})

// POST /admin/refunds/:id/deny
router.post("/:id/deny", requireAdmin, async (req, res) => {
  try {
    const adminMessage =
      typeof req.body?.adminMessage === "string" ? req.body.adminMessage : ""
    const result = await denyRefundRequest({
      refundId: req.params.id,
      adminUserId: req.user.id,
    })

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    const refund = result.refund
    if (refund?.requestedByUser?.email && refund?.orderId) {
      await sendRefundDeniedEmail({
        to: refund.requestedByUser.email,
        orderId: refund.orderId,
        adminMessage,
      })
    }

    res.json({ refund: result.refund })
  } catch (error) {
    console.error("Deny refund error:", error)
    res.status(500).json({ error: "Failed to deny refund request" })
  }
})

export default router
