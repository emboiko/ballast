import { Router } from "express"
import { requireAuth, requireVerified } from "../middleware/auth.js"
import { calculateCartFees } from "../lib/fees.js"

const router = Router()

// POST /fees/cart
router.post("/cart", requireAuth, requireVerified, async (req, res) => {
  try {
    const { cartItems } = req.body
    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ error: "cartItems must be an array" })
    }

    const userAgent = req.get("user-agent") || null
    const result = await calculateCartFees(cartItems, userAgent)

    res.json({ fees: result.fees })
  } catch (error) {
    console.error("Calculate cart fees error:", error)
    res.status(500).json({ error: "Failed to calculate cart fees" })
  }
})

export default router
