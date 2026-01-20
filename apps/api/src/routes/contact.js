import { Router } from "express"
import { submitContactForm } from "../lib/contact.js"
import { optionalAuth } from "../middleware/auth.js"

const router = Router()

// POST /contact
router.post("/", optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null
    const result = await submitContactForm(
      req.body.name,
      req.body.email,
      req.body.subject || null,
      req.body.message,
      userId,
      req.body.turnstileToken || null,
      req.ip
    )

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json({ message: "Contact form submitted successfully" })
  } catch (error) {
    console.error("Contact route error:", error)
    res.status(500).json({ error: "Failed to process contact form" })
  }
})

export default router
