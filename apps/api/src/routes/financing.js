import { Router } from "express"
import { z } from "zod"
import { requireAuth, requireVerified } from "../middleware/auth.js"
import {
  createFinancingPlanFromCheckout,
  listFinancingPlans,
  getFinancingPlan,
  createPrincipalPaymentIntent,
  recordPrincipalPayment,
} from "../lib/financing.js"

const router = Router()

const cartItemSchema = z.looseObject({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  priceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive().optional(),
  type: z.string().trim().min(1).optional(),
})

const feeSchema = z.looseObject({
  amountCents: z.number().int().nonnegative(),
})

const checkoutBodySchema = z.object({
  paymentIntentId: z.string().trim().min(1),
  cartItems: z.array(cartItemSchema).min(1),
  fees: z.array(feeSchema).optional(),
  cadence: z.string().trim().min(1),
  termCount: z.number().int().positive(),
})

const planIdParamSchema = z.object({
  id: z.string().trim().min(1),
})

const principalIntentBodySchema = z.object({
  amountCents: z.number().int().positive(),
})

const principalRecordBodySchema = z.object({
  paymentIntentId: z.string().trim().min(1),
})

// POST /financing/checkout
router.post("/checkout", requireAuth, requireVerified, async (req, res) => {
  try {
    const parsedBody = checkoutBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await createFinancingPlanFromCheckout({
      userId: req.user.id,
      paymentIntentId: parsedBody.data.paymentIntentId,
      cartItems: parsedBody.data.cartItems,
      fees: parsedBody.data.fees,
      cadence: parsedBody.data.cadence,
      termCount: parsedBody.data.termCount,
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
})

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
    const parsedParams = planIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await getFinancingPlan(req.user.id, parsedParams.data.id)

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
      const parsedParams = planIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ error: "Invalid request" })
      }

      const parsedBody = principalIntentBodySchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request" })
      }

      const result = await createPrincipalPaymentIntent({
        userId: req.user.id,
        planId: parsedParams.data.id,
        amountCents: parsedBody.data.amountCents,
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
      const parsedParams = planIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ error: "Invalid request" })
      }

      const parsedBody = principalRecordBodySchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request" })
      }

      const result = await recordPrincipalPayment({
        userId: req.user.id,
        planId: parsedParams.data.id,
        paymentIntentId: parsedBody.data.paymentIntentId,
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
