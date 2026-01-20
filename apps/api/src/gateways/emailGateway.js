import { Resend } from "resend"
import {
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  RESEND_WEBHOOK_SECRET,
  API_URL,
  ADMIN_URL,
  WEBAPP_URL,
} from "@/constants.js"
import { escapeHtml } from "@/lib/utils/email.js"

let resend = null

const getResend = () => {
  if (!resend) {
    resend = new Resend(RESEND_API_KEY)
  }
  return resend
}

/**
 * Send welcome email with verification link for new signups
 * @param {string} email
 * @param {string} token
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendWelcomeEmail = async (email, token) => {
  const verifyUrl = `${API_URL}/auth/verify?token=${token}`

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: "Welcome to Ballast - Verify your email",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Ballast!</h1>
          <p>Thanks for signing up! Please verify your email address by clicking the link below:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${verifyUrl}">${verifyUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send welcome email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send email change verification link
 * @param {string} newEmail - The new email address to verify
 * @param {string} token
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendEmailChangeVerification = async (newEmail, token) => {
  const verifyUrl = `${API_URL}/auth/verify-email-change?token=${token}`

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to: newEmail,
      subject: "Confirm your new email address - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Confirm Your New Email</h1>
          <p>You requested to change your Ballast account email to this address. Click the link below to confirm:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Confirm Email Change
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${verifyUrl}">${verifyUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this change, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send email change verification:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send email change verification:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send password changed notification
 * @param {string} email
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendPasswordChangedNotification = async (email) => {
  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: "Your password was changed - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Changed</h1>
          <p>The password for your Ballast account was recently changed.</p>
          <p>If you made this change, you can safely ignore this email.</p>
          <p style="color: #666; font-size: 14px;">
            If you did not change your password, please contact support immediately as your account may have been compromised.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send password changed notification:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send password changed notification:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send password reset link
 * @param {string} email
 * @param {string} token
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${WEBAPP_URL}/reset-password?token=${token}`

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: "Reset your password - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reset Your Password</h1>
          <p>We received a request to reset the password for your Ballast account.</p>
          <p>Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send password reset email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send account reactivation link
 * @param {string} email
 * @param {string} token
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendAccountReactivationEmail = async (email, token) => {
  const reactivateUrl = `${API_URL}/auth/reactivate?token=${token}`

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: "Reactivate your account - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reactivate Your Account</h1>
          <p>Good news! Your Ballast account has been restored by our support team.</p>
          <p>To complete the reactivation and verify your email, click the link below:</p>
          <a href="${reactivateUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reactivate Account
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${reactivateUrl}">${reactivateUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 7 days. After clicking the link, you'll be able to log in with your existing password.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send account reactivation email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send account reactivation email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send refund request received confirmation.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.orderId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendRefundRequestReceivedEmail = async ({ to, orderId }) => {
  const ordersUrl = `${WEBAPP_URL}/account/orders/${orderId}`

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Refund request received - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Refund request received</h1>
          <p>We received your refund request for order <strong>${orderId}</strong>. Our team will review it shortly.</p>
          <a href="${ordersUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View your order
          </a>
          <p style="color: #666; font-size: 14px;">
            If you have any additional context to share, you can reply to this email.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send refund request received email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send refund request received email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send refund processed notification.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.orderId
 * @param {string} params.formattedAmount
 * @param {string|undefined} [params.adminMessage]
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendRefundProcessedEmail = async ({
  to,
  orderId,
  formattedAmount,
  adminMessage,
}) => {
  const ordersUrl = `${WEBAPP_URL}/account/orders/${orderId}`
  const trimmedAdminMessage =
    typeof adminMessage === "string" ? adminMessage.trim() : ""

  let messageHtml = ""
  if (trimmedAdminMessage) {
    messageHtml = `
      <div style="margin-top: 16px; padding: 12px 14px; background: #f3f5f7; border-radius: 6px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 6px;">Message from support</div>
        <div style="white-space: pre-wrap;">${trimmedAdminMessage
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")}</div>
      </div>
    `
  }

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Your refund was processed - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Refund processed</h1>
          <p>Your refund for order <strong>${orderId}</strong> was processed in the amount of <strong>${formattedAmount}</strong>.</p>
          ${messageHtml}
          <a href="${ordersUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View your order
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send refund processed email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send refund processed email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send refund denied notification.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.orderId
 * @param {string|undefined} [params.adminMessage]
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendRefundDeniedEmail = async ({ to, orderId, adminMessage }) => {
  const ordersUrl = `${WEBAPP_URL}/account/orders/${orderId}`
  const trimmedAdminMessage =
    typeof adminMessage === "string" ? adminMessage.trim() : ""

  let messageHtml = ""
  if (trimmedAdminMessage) {
    messageHtml = `
      <div style="margin-top: 16px; padding: 12px 14px; background: #f3f5f7; border-radius: 6px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 6px;">Message from support</div>
        <div style="white-space: pre-wrap;">${trimmedAdminMessage
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")}</div>
      </div>
    `
  }

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Refund request update - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Refund request update</h1>
          <p>Your refund request for order <strong>${orderId}</strong> was not approved at this time.</p>
          ${messageHtml}
          <a href="${ordersUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View your order
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send refund denied email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send refund denied email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send order confirmation email after successful purchase.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.orderId
 * @param {string} params.formattedTotal
 * @param {Array<{ name: string, quantity: number, formattedUnitPrice: string, formattedLineTotal: string }>} params.items
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendOrderConfirmationEmail = async ({
  to,
  orderId,
  formattedTotal,
  items,
}) => {
  const ordersUrl = `${WEBAPP_URL}/account/orders/${orderId}`

  const itemsList =
    Array.isArray(items) && items.length > 0
      ? `
        <ul style="padding-left: 18px; margin: 12px 0;">
          ${items
            .map((item) => {
              const name = escapeHtml(item.name)
              const quantity =
                typeof item.quantity === "number" ? item.quantity : 1
              const unitPrice = escapeHtml(item.formattedUnitPrice)
              const lineTotal = escapeHtml(item.formattedLineTotal)

              return `
                <li style="margin-bottom: 8px;">
                  <div><strong>${name}</strong> &times; ${quantity}</div>
                  <div style="color: #666; font-size: 13px;">${unitPrice} each &middot; ${lineTotal} total</div>
                </li>
              `
            })
            .join("")}
        </ul>
      `
      : `<p style="color: #666; font-size: 14px;">(No item details were recorded for this order.)</p>`

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Order confirmation - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thanks for your order</h1>
          <p>Your order <strong>${escapeHtml(orderId)}</strong> has been placed successfully.</p>
          ${itemsList}
          <p><strong>Total:</strong> ${escapeHtml(formattedTotal)}</p>
          <a href="${ordersUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View your order
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send order confirmation email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send order confirmation email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Notify a user that they have been granted admin dashboard access.
 * @param {object} params
 * @param {string} params.to
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendAdminAccessGrantedEmail = async ({ to }) => {
  const dashboardUrl = ADMIN_URL

  let dashboardLinkHtml = ""
  if (dashboardUrl) {
    dashboardLinkHtml = `
      <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Open admin dashboard
      </a>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:<br/>
        <a href="${dashboardUrl}">${dashboardUrl}</a>
      </p>
    `
  }

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Admin access granted - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Admin access granted</h1>
          <p>You have been granted access to the Ballast admin dashboard.</p>
          <p>You can sign in using your existing Ballast account credentials (the same login you use for ballast.systems).</p>
          ${dashboardLinkHtml}
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send admin access granted email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send admin access granted email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify an incoming Resend webhook using Svix headers.
 * IMPORTANT: payload must be the raw request body string.
 * @param {object} params
 * @param {string} params.payload
 * @param {{ id?: string, timestamp?: string, signature?: string }} params.headers
 * @returns {any}
 */
export const verifyResendWebhook = ({ payload, headers }) => {
  if (!RESEND_WEBHOOK_SECRET) {
    throw new Error("RESEND_WEBHOOK_SECRET is not set")
  }

  return getResend().webhooks.verify({
    payload,
    headers: {
      id: headers.id,
      timestamp: headers.timestamp,
      signature: headers.signature,
    },
    webhookSecret: RESEND_WEBHOOK_SECRET,
  })
}

/**
 * Fetch a received email's full content from Resend Receiving API.
 * @param {string} resendEmailId
 * @returns {Promise<any>}
 */
export const getReceivedEmailContent = async (resendEmailId) => {
  if (!resendEmailId) {
    return { data: null, error: { message: "resendEmailId is required" } }
  }

  return getResend().emails.receiving.get(resendEmailId)
}

/**
 * Send an email reply while preserving threading.
 * @param {object} params
 * @param {string|string[]} params.to
 * @param {string} params.subject
 * @param {string|undefined} params.text
 * @param {string|undefined} params.html
 * @param {string|undefined} params.inReplyTo
 * @param {string[]|undefined} params.references
 * @returns {Promise<{ data?: any, error?: any }>}
 */
export const sendReplyEmail = async ({
  to,
  subject,
  text,
  html,
  inReplyTo,
  references,
}) => {
  const headers = {}

  if (inReplyTo) {
    headers["In-Reply-To"] = inReplyTo
  }

  if (references && references.length > 0) {
    headers["References"] = references.join(" ")
  }

  let requestHeaders = undefined
  if (Object.keys(headers).length > 0) {
    requestHeaders = headers
  }

  return getResend().emails.send({
    from: RESEND_FROM_EMAIL,
    to,
    subject,
    text,
    html,
    headers: requestHeaders,
  })
}
