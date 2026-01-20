import { Router } from "express"
import { handleResendWebhook } from "../../lib/webhooks/resend.js"

const router = Router()

// POST /webhooks/resend
router.post("/", async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : ""
    const result = await handleResendWebhook({
      rawBody,
      headers: req.headers,
    })
    res.status(200).json(result)
  } catch (error) {
    console.error("Resend webhook handler error:", error)
    res.status(500).json({ error: "Failed to process webhook" })
  }
})

export default router
