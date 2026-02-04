import { Router } from "express"
import { requireAuth, requireVerified } from "../middleware/auth.js"
import {
  createFinancingPlanFromCheckout,
  listFinancingPlans,
  getFinancingPlan,
  createPrincipalPaymentIntent,
  recordPrincipalPayment,
} from "../lib/financing.js"

const router = Router()

// POST /financing/checkout
router.post(
  "/checkout",
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const result = await createFinancingPlanFromCheckout({
        userId: req.user.id,
        paymentIntentId: req.body.paymentIntentId,
        cartItems: req.body.cartItems,
        fees: req.body.fees,
        cadence: req.body.cadence,
        termCount: req.body.termCount,
      })

      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.status(201).json({
        planId: result.plan.id,
        orderId: result.order.id,
      })
    } catch (error) {
      console.error("Create financing plan error:", error)
      res.status(500).json({ error: "Failed to create financing plan" })
    }
  }
)

// GET /financing
router.get("/", requireAuth, requireVerified, async (req, res) => {
  try {
    const result = await listFinancingPlans(req.user.id)
    res.json(result)
  } catch (error) {
    console.error("List financing plans error:", error)
    res.status(500).json({ error: "Failed to list financing plans" })
  }
})

// GET /financing/:id
router.get("/:id", requireAuth, requireVerified, async (req, res) => {
  try {
    const result = await getFinancingPlan(req.user.id, req.params.id)

    if (result.error) {
      return res.status(404).json({ error: result.error })
    }

    res.json(result)
  } catch (error) {
    console.error("Get financing plan error:", error)
    res.status(500).json({ error: "Failed to fetch financing plan" })
  }
})

// POST /financing/:id/principal-intent
router.post(
  "/:id/principal-intent",
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const result = await createPrincipalPaymentIntent({
        userId: req.user.id,
        planId: req.params.id,
        amountCents: req.body.amountCents,
      })

      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      })
    } catch (error) {
      console.error("Create principal intent error:", error)
      res.status(500).json({ error: "Failed to create payment intent" })
    }
  }
)

// POST /financing/:id/principal
router.post(
  "/:id/principal",
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const result = await recordPrincipalPayment({
        userId: req.user.id,
        planId: req.params.id,
        paymentIntentId: req.body.paymentIntentId,
      })

      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.json({
        payment: result.payment,
        plan: result.plan,
      })
    } catch (error) {
      console.error("Record principal payment error:", error)
      res.status(500).json({ error: "Failed to record principal payment" })
    }
  }
)

export default router
