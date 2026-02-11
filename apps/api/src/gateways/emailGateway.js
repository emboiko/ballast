import { Resend } from "resend"
import {
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  RESEND_WEBHOOK_SECRET,
  API_URL,
  ADMIN_URL,
  WEBAPP_URL,
} from "../constants.js"
import { escapeHtml } from "../lib/utils/email.js"

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

const formatEmailDate = (date) => {
  if (!date) {
    return "—"
  }
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return "—"
  }
  return parsed.toLocaleDateString("en-US")
}

/**
 * Notify a user that a subscription has been activated.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.subscriptionId
 * @param {string} params.serviceName
 * @param {string} params.intervalLabel
 * @param {string} params.formattedPrice
 * @param {Date|string|null|undefined} params.nextChargeDate
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendSubscriptionActivatedEmail = async ({
  to,
  subscriptionId,
  serviceName,
  intervalLabel,
  formattedPrice,
  nextChargeDate,
}) => {
  const subscriptionUrl = `${WEBAPP_URL}/account/subscriptions/${subscriptionId}`
  const nextChargeLabel = formatEmailDate(nextChargeDate)

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Subscription activated - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Subscription activated</h1>
          <p>Your subscription for <strong>${escapeHtml(
            serviceName
          )}</strong> is now active.</p>
          <p><strong>Interval:</strong> ${escapeHtml(intervalLabel)}</p>
          <p><strong>Price:</strong> ${escapeHtml(formattedPrice)}</p>
          <p><strong>Next charge:</strong> ${escapeHtml(nextChargeLabel)}</p>
          <a href="${subscriptionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View subscription
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send subscription activated email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (caughtError) {
    console.error("Failed to send subscription activated email:", caughtError)
    return { success: false, error: caughtError.message }
  }
}

/**
 * Notify a user about an upcoming subscription renewal charge.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.subscriptionId
 * @param {string} params.serviceName
 * @param {string} params.formattedAmount
 * @param {Date|string|null|undefined} params.scheduledFor
 * @param {number} params.daysBefore
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendSubscriptionUpcomingChargeReminderEmail = async ({
  to,
  subscriptionId,
  serviceName,
  formattedAmount,
  scheduledFor,
  daysBefore,
}) => {
  const subscriptionUrl = `${WEBAPP_URL}/account/subscriptions/${subscriptionId}`
  const chargeDateLabel = formatEmailDate(scheduledFor)

  let daysBeforeLabel = "a few"
  if (Number.isInteger(daysBefore) && daysBefore > 0) {
    daysBeforeLabel = `${daysBefore}`
  }

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Upcoming subscription charge - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Upcoming subscription charge</h1>
          <p>This is a reminder that your subscription for <strong>${escapeHtml(
            serviceName
          )}</strong> will renew in <strong>${escapeHtml(
            daysBeforeLabel
          )} days</strong>.</p>
          <p><strong>Amount:</strong> ${escapeHtml(formattedAmount)}</p>
          <p><strong>Charge date:</strong> ${escapeHtml(chargeDateLabel)}</p>
          <a href="${subscriptionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View subscription
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error(
        "Failed to send subscription upcoming charge reminder email:",
        error
      )
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (caughtError) {
    console.error(
      "Failed to send subscription upcoming charge reminder email:",
      caughtError
    )
    return { success: false, error: caughtError.message }
  }
}

/**
 * Notify a user that a subscription renewal charge failed.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.subscriptionId
 * @param {string} params.serviceName
 * @param {string} params.formattedAmount
 * @param {Date|string|null|undefined} params.scheduledFor
 * @param {string|undefined} params.failureMessage
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendSubscriptionChargeFailedEmail = async ({
  to,
  subscriptionId,
  serviceName,
  formattedAmount,
  scheduledFor,
  failureMessage,
}) => {
  const subscriptionUrl = `${WEBAPP_URL}/account/subscriptions/${subscriptionId}`
  const chargeDateLabel = formatEmailDate(scheduledFor)
  const trimmedFailureMessage =
    typeof failureMessage === "string" ? failureMessage.trim() : ""

  let failureHtml = ""
  if (trimmedFailureMessage) {
    failureHtml = `
      <div style="margin-top: 16px; padding: 12px 14px; background: #f3f5f7; border-radius: 6px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 6px;">Reason</div>
        <div style="white-space: pre-wrap;">${escapeHtml(
          trimmedFailureMessage
        )}</div>
      </div>
    `
  }

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Subscription payment failed - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Subscription payment failed</h1>
          <p>We were unable to process your renewal payment for <strong>${escapeHtml(
            serviceName
          )}</strong>.</p>
          <p><strong>Amount:</strong> ${escapeHtml(formattedAmount)}</p>
          <p><strong>Scheduled for:</strong> ${escapeHtml(chargeDateLabel)}</p>
          ${failureHtml}
          <a href="${subscriptionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View subscription
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send subscription charge failed email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (caughtError) {
    console.error(
      "Failed to send subscription charge failed email:",
      caughtError
    )
    return { success: false, error: caughtError.message }
  }
}

/**
 * Notify a user that a subscription has been defaulted for non-payment.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.subscriptionId
 * @param {string} params.serviceName
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendSubscriptionDefaultedEmail = async ({
  to,
  subscriptionId,
  serviceName,
}) => {
  const subscriptionUrl = `${WEBAPP_URL}/account/subscriptions/${subscriptionId}`

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Subscription defaulted - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Subscription defaulted</h1>
          <p>Your subscription for <strong>${escapeHtml(
            serviceName
          )}</strong> has been defaulted due to repeated payment failures.</p>
          <a href="${subscriptionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View subscription
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send subscription defaulted email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (caughtError) {
    console.error("Failed to send subscription defaulted email:", caughtError)
    return { success: false, error: caughtError.message }
  }
}

/**
 * Notify a user that a financing plan has been activated.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.planId
 * @param {string} params.formattedTotal
 * @param {string} params.formattedDownPayment
 * @param {string} params.formattedInstallmentAmount
 * @param {string} params.cadenceLabel
 * @param {number} params.termCount
 * @param {Date|string|null|undefined} params.nextPaymentDate
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendFinancingPlanActivatedEmail = async ({
  to,
  planId,
  formattedTotal,
  formattedDownPayment,
  formattedInstallmentAmount,
  cadenceLabel,
  termCount,
  nextPaymentDate,
}) => {
  const planUrl = `${WEBAPP_URL}/account/financing/${planId}`
  const nextPaymentLabel = formatEmailDate(nextPaymentDate)

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Financing plan activated - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Financing plan activated</h1>
          <p>Your financing plan is now active.</p>
          <p><strong>Total:</strong> ${escapeHtml(formattedTotal)}</p>
          <p><strong>Down payment:</strong> ${escapeHtml(formattedDownPayment)}</p>
          <p><strong>Term:</strong> ${escapeHtml(
            `${termCount} payments (${cadenceLabel})`
          )}</p>
          <p><strong>Installment amount:</strong> ${escapeHtml(
            formattedInstallmentAmount
          )}</p>
          <p><strong>Next payment:</strong> ${escapeHtml(nextPaymentLabel)}</p>
          <a href="${planUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View financing plan
          </a>
          <p style="color: #666; font-size: 14px;">
            You can also make principal payments from your plan details page.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send financing plan activated email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (caughtError) {
    console.error("Failed to send financing plan activated email:", caughtError)
    return { success: false, error: caughtError.message }
  }
}

/**
 * Notify a user about an upcoming financing installment.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.planId
 * @param {string} params.formattedAmount
 * @param {Date|string|null|undefined} params.dueDate
 * @param {number} params.daysBefore
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendFinancingUpcomingInstallmentReminderEmail = async ({
  to,
  planId,
  formattedAmount,
  dueDate,
  daysBefore,
}) => {
  const planUrl = `${WEBAPP_URL}/account/financing/${planId}`
  const dueDateLabel = formatEmailDate(dueDate)
  let daysBeforeLabel = "a few"
  if (Number.isInteger(daysBefore) && daysBefore > 0) {
    daysBeforeLabel = `${daysBefore}`
  }

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Upcoming financing payment - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Upcoming financing payment</h1>
          <p>This is a reminder that you have a financing payment due in <strong>${escapeHtml(
            daysBeforeLabel
          )} days</strong>.</p>
          <p><strong>Amount:</strong> ${escapeHtml(formattedAmount)}</p>
          <p><strong>Due date:</strong> ${escapeHtml(dueDateLabel)}</p>
          <a href="${planUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View financing plan
          </a>
          <p style="color: #666; font-size: 14px;">
            You can make principal payments from your plan details page.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error(
        "Failed to send financing upcoming installment reminder email:",
        error
      )
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (caughtError) {
    console.error(
      "Failed to send financing upcoming installment reminder email:",
      caughtError
    )
    return { success: false, error: caughtError.message }
  }
}

/**
 * Notify a user that a financing charge failed.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.planId
 * @param {string} params.formattedAmount
 * @param {Date|string|null|undefined} params.dueDate
 * @param {string|undefined} params.failureMessage
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendFinancingChargeFailedEmail = async ({
  to,
  planId,
  formattedAmount,
  dueDate,
  failureMessage,
}) => {
  const planUrl = `${WEBAPP_URL}/account/financing/${planId}`
  const dueDateLabel = formatEmailDate(dueDate)
  const trimmedFailureMessage =
    typeof failureMessage === "string" ? failureMessage.trim() : ""

  let failureHtml = ""
  if (trimmedFailureMessage) {
    failureHtml = `
      <div style="margin-top: 16px; padding: 12px 14px; background: #f3f5f7; border-radius: 6px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 6px;">Reason</div>
        <div style="white-space: pre-wrap;">${escapeHtml(
          trimmedFailureMessage
        )}</div>
      </div>
    `
  }

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Financing payment failed - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Financing payment failed</h1>
          <p>We were unable to process your financing payment.</p>
          <p><strong>Amount:</strong> ${escapeHtml(formattedAmount)}</p>
          <p><strong>Due date:</strong> ${escapeHtml(dueDateLabel)}</p>
          ${failureHtml}
          <a href="${planUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View financing plan
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send financing charge failed email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (caughtError) {
    console.error("Failed to send financing charge failed email:", caughtError)
    return { success: false, error: caughtError.message }
  }
}

/**
 * Notify a user that a financing plan has defaulted for non-payment.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.planId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendFinancingPlanDefaultedEmail = async ({ to, planId }) => {
  const planUrl = `${WEBAPP_URL}/account/financing/${planId}`

  try {
    const { error } = await getResend().emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Financing plan defaulted - Ballast",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Financing plan defaulted</h1>
          <p>Your financing plan has been defaulted due to repeated payment failures.</p>
          <a href="${planUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View financing plan
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            — The Ballast Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send financing plan defaulted email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (caughtError) {
    console.error("Failed to send financing plan defaulted email:", caughtError)
    return { success: false, error: caughtError.message }
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
