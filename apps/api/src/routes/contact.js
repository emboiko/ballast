import { Router } from "express"
import { z } from "zod"
import { submitContactForm } from "../lib/contact.js"
import { optionalAuth } from "../middleware/auth.js"

const router = Router()

const contactBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().max(255).pipe(z.email()),
  subject: z.string().trim().max(500).optional(),
  message: z.string().trim().min(1).max(5000),
  turnstileToken: z.string().trim().min(1).optional(),
})

// POST /contact
router.post("/", optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null
    const parsedBody = contactBodySchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const result = await submitContactForm(
      parsedBody.data.name,
      parsedBody.data.email,
      parsedBody.data.subject || null,
      parsedBody.data.message,
      userId,
      parsedBody.data.turnstileToken || null,
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
