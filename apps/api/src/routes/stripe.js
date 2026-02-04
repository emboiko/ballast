import { Router } from "express"
import { requireAuth, requireVerified } from "../middleware/auth.js"
import {
  createStripeIntent,
  confirmStripePayment,
  cancelStripeIntent,
} from "../lib/stripe.js"

const router = Router()

// POST /payments/stripe/create-intent
// Creates a payment intent with the actual cart amount (lazy creation on checkout)
router.post(
  "/create-intent",
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const result = await createStripeIntent(
        req.user.id,
        req.user.email,
        req.body.amountCents
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
      const result = await confirmStripePayment(
        req.user.id,
        req.body.paymentIntentId,
        req.body.cartItems
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
      const result = await cancelStripeIntent(req.body.paymentIntentId)

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
