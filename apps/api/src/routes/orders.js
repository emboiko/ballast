import { Router } from "express"
import { requireAuth, requireVerified } from "@/middleware/auth.js"
import { fetchOrders, fetchOrder, createRefundRequest } from "@/lib/orders.js"

const router = Router()

// GET /orders
// Returns orders for the authenticated user with optional pagination
// Query params: limit (number), offset (number)
router.get("/", requireAuth, requireVerified, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined

    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      return res.status(400).json({ error: "limit must be a positive integer" })
    }
    if (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) {
      return res
        .status(400)
        .json({ error: "offset must be a non-negative integer" })
    }

    const result = await fetchOrders(req.user.id, { limit, offset })
    res.json(result)
  } catch (error) {
    console.error("Fetch orders error:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// GET /orders/:id
// Returns a specific order for the authenticated user with refunds and payment method details
router.get("/:id", requireAuth, requireVerified, async (req, res) => {
  try {
    const result = await fetchOrder(req.params.id, req.user.id)

    if (result.error) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ order: result.order })
  } catch (error) {
    console.error("Fetch order error:", error)
    res.status(500).json({ error: "Failed to fetch order" })
  }
})

// POST /orders/:id/refunds
// Creates a refund request for an order
router.post("/:id/refunds", requireAuth, requireVerified, async (req, res) => {
  try {
    const result = await createRefundRequest(
      req.params.id,
      req.user.id,
      req.body.reason
    )

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json({
      refund: result.refund,
      message: result.message,
    })
  } catch (error) {
    console.error("Create refund request error:", error)
    res.status(500).json({ error: "Failed to create refund request" })
  }
})

export default router
