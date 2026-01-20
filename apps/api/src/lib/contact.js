import prisma from "../../../../packages/shared/src/db/client.js"
import { verifyTurnstile } from "../gateways/turnstileGateway.js"

/**
 * Submit a contact form
 * @param {string} name
 * @param {string} email
 * @param {string|null} subject
 * @param {string} message
 * @param {string|null} userId - User ID if authenticated, null for anonymous
 * @param {string|null} turnstileToken - Turnstile token (required if userId is null)
 * @param {string} ip - Client IP address
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const submitContactForm = async (
  name,
  email,
  subject,
  message,
  userId,
  turnstileToken,
  ip
) => {
  if (!name || !email || !message) {
    return { success: false, error: "Name, email, and message are required" }
  }

  if (name.length > 200) {
    return { success: false, error: "Name must be 200 characters or less" }
  }

  if (email.length > 255) {
    return { success: false, error: "Email must be 255 characters or less" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: "Invalid email format" }
  }

  if (subject && subject.length > 500) {
    return { success: false, error: "Subject must be 500 characters or less" }
  }

  if (message.length > 5000) {
    return { success: false, error: "Message must be 5000 characters or less" }
  }

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    if (email.toLowerCase() !== user.email.toLowerCase()) {
      return {
        success: false,
        error: "Email must match your account email",
      }
    }
  } else {
    if (!turnstileToken) {
      return {
        success: false,
        error: "Captcha verification is required for anonymous submissions",
      }
    }

    const isValidTurnstile = await verifyTurnstile(turnstileToken, ip)
    if (!isValidTurnstile) {
      return { success: false, error: "Invalid captcha verification" }
    }
  }

  try {
    await prisma.contactSubmission.create({
      data: {
        userId: userId || null,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject ? subject.trim() : null,
        message: message.trim(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Contact form submission error:", error)
    return { success: false, error: "Failed to submit contact form" }
  }
}
