import { Router } from "express"
import { z } from "zod"
import { requireAuth, requireVerified } from "../middleware/auth.js"
import {
  createStripeIntent,
  confirmStripePayment,
  cancelStripeIntent,
} from "../lib/stripe.js"

const router = Router()

const createIntentBodySchema = z.object({
  amountCents: z.number().int().positive(),
})

const cancelIntentBodySchema = z.object({
  paymentIntentId: z.string().trim().min(1),
})

const cartItemSchema = z.looseObject({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  priceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive().optional(),
  type: z.string().trim().min(1).optional(),
})

const confirmPaymentBodySchema = z.object({
  paymentIntentId: z.string().trim().min(1),
  cartItems: z.array(cartItemSchema).min(1),
})

// POST /payments/stripe/create-intent
// Creates a payment intent with the actual cart amount (lazy creation on checkout)
router.post(
  "/create-intent",
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const parsedBody = createIntentBodySchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request" })
      }

      const result = await createStripeIntent(
        req.user.id,
        req.user.email,
        parsedBody.data.amountCents
      )

      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      })
    } catch (error) {
      console.error("Create payment intent error:", error)
      res.status(500).json({ error: "Failed to create payment intent" })
    }
  }
)

// POST /payments/stripe/confirm-payment
// Called after client-side confirmation to record the order
router.post(
  "/confirm-payment",
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const parsedBody = confirmPaymentBodySchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request" })
      }

      const result = await confirmStripePayment(
        req.user.id,
        parsedBody.data.paymentIntentId,
        parsedBody.data.cartItems
      )

      if (!result.success) {
        return res.status(500).json({ error: result.error })
      }

      res.json({
        success: true,
        orderId: result.order.id,
        status: result.order.status,
      })
    } catch (error) {
      console.error("Confirm payment error:", error)
      res.status(500).json({ error: "Failed to confirm payment" })
    }
  }
)

// POST /payments/stripe/cancel-intent
// Cancels a payment intent when switching payment modes
router.post(
  "/cancel-intent",
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const parsedBody = cancelIntentBodySchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request" })
      }

      const result = await cancelStripeIntent(parsedBody.data.paymentIntentId)

      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.json({ status: result.status })
    } catch (error) {
      console.error("Cancel payment intent error:", error)
      res.status(500).json({ error: "Failed to cancel payment intent" })
    }
  }
)

export default router
