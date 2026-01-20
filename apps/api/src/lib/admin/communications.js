import prisma from "@ballast/shared/src/db/client.js"
import { RESEND_FROM_EMAIL } from "@/constants.js"
import { sendReplyEmail } from "@/gateways/emailGateway.js"
import {
  uniqueStrings,
  normalizeEmailAddress,
  toSimpleHtml,
} from "@/lib/utils/email.js"

/**
 * List communication emails for admin UI.
 * @param {object} params
 * @param {number} [params.limit=25]
 * @param {number} [params.offset=0]
 * @param {string|undefined} [params.threadKey]
 * @returns {Promise<{ emails: Array<object>, total: number, hasMore: boolean }>}
 */
export const listCommunicationEmails = async ({
  limit = 25,
  offset = 0,
  threadKey,
  direction,
  unreadOnly,
} = {}) => {
  const whereClause = {}

  if (threadKey) {
    whereClause.threadKey = threadKey
  }

  if (unreadOnly) {
    whereClause.direction = "INBOUND"
    whereClause.readAt = null
  } else if (direction) {
    whereClause.direction = direction
  }

  const [emails, total] = await Promise.all([
    prisma.communicationEmail.findMany({
      where: whereClause,
      select: {
        id: true,
        direction: true,
        status: true,
        threadKey: true,
        subject: true,
        fromEmail: true,
        fromName: true,
        toEmails: true,
        receivedAt: true,
        readAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.communicationEmail.count({
      where: whereClause,
    }),
  ])

  return {
    emails,
    total,
    hasMore: offset + emails.length < total,
  }
}

/**
 * Get a single communication email by ID.
 * @param {string} emailId
 * @returns {Promise<{ success: boolean, email?: object, error?: string }>}
 */
export const getCommunicationEmailById = async (emailId) => {
  if (!emailId) {
    return { success: false, error: "Email ID is required" }
  }

  const email = await prisma.communicationEmail.findUnique({
    where: { id: emailId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  })

  if (!email) {
    return { success: false, error: "Email not found" }
  }

  return { success: true, email }
}

/**
 * Mark a communication email read/unread.
 * @param {string} emailId
 * @param {boolean} isRead
 * @returns {Promise<{ success: boolean, email?: object, error?: string }>}
 */
export const setCommunicationEmailReadStatus = async (emailId, isRead) => {
  if (!emailId) {
    return { success: false, error: "Email ID is required" }
  }

  const email = await prisma.communicationEmail.findUnique({
    where: { id: emailId },
    select: { id: true },
  })

  if (!email) {
    return { success: false, error: "Email not found" }
  }

  let readAt = null
  if (isRead) {
    readAt = new Date()
  }

  const updatedEmail = await prisma.communicationEmail.update({
    where: { id: emailId },
    data: { readAt },
  })

  return { success: true, email: updatedEmail }
}

/**
 * Permanently delete a communication email.
 * @param {string} emailId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const deleteCommunicationEmail = async (emailId) => {
  if (!emailId) {
    return { success: false, error: "Email ID is required" }
  }

  const email = await prisma.communicationEmail.findUnique({
    where: { id: emailId },
    select: { id: true },
  })

  if (!email) {
    return { success: false, error: "Email not found" }
  }

  await prisma.communicationEmail.delete({
    where: { id: emailId },
  })

  return { success: true }
}

/**
 * Reply to an inbound email and persist the outbound message.
 * @param {object} params
 * @param {string} params.emailId
 * @param {string} params.replyText
 * @returns {Promise<{ success: boolean, outboundEmail?: object, error?: string }>}
 */
export const replyToCommunicationEmail = async ({ emailId, replyText }) => {
  if (!emailId) {
    return { success: false, error: "Email ID is required" }
  }

  if (!replyText || !replyText.trim()) {
    return { success: false, error: "Reply text is required" }
  }

  const originalEmail = await prisma.communicationEmail.findUnique({
    where: { id: emailId },
  })

  if (!originalEmail) {
    return { success: false, error: "Email not found" }
  }

  if (originalEmail.direction !== "INBOUND") {
    return { success: false, error: "Can only reply to inbound emails" }
  }

  const normalizedToEmail = normalizeEmailAddress(originalEmail.fromEmail)
  if (!normalizedToEmail) {
    return {
      success: false,
      error: "Original email is missing a sender address",
    }
  }

  let subject = "Re:"
  if (originalEmail.subject && typeof originalEmail.subject === "string") {
    const trimmedSubject = originalEmail.subject.trim()
    if (trimmedSubject.toLowerCase().startsWith("re:")) {
      subject = trimmedSubject
    } else {
      subject = `Re: ${trimmedSubject}`
    }
  }

  const inReplyTo = originalEmail.messageId || null

  const references = uniqueStrings([
    ...(Array.isArray(originalEmail.references)
      ? originalEmail.references
      : []),
    originalEmail.messageId || "",
  ])

  const trimmedReplyText = replyText.trim()
  const replyHtml = toSimpleHtml(trimmedReplyText)

  const { data, error } = await sendReplyEmail({
    to: normalizedToEmail,
    subject,
    text: trimmedReplyText,
    html: replyHtml || undefined,
    inReplyTo: inReplyTo || undefined,
    references,
  })

  if (error) {
    console.error("Failed to send reply email:", error)
    return { success: false, error: "Failed to send reply email" }
  }

  let resendEmailId = null
  if (data && typeof data === "object" && typeof data.id === "string") {
    resendEmailId = data.id
  }

  let linkedUserId = originalEmail.userId || null
  if (!linkedUserId) {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedToEmail },
      select: { id: true },
    })
    if (existingUser) {
      linkedUserId = existingUser.id
    }
  }

  const fromEmail = normalizeEmailAddress(RESEND_FROM_EMAIL) || "unknown"

  const outboundEmail = await prisma.communicationEmail.create({
    data: {
      direction: "OUTBOUND",
      status: "sent",
      resendEmailId,
      messageId: null,
      inReplyTo,
      references,
      threadKey: originalEmail.threadKey,
      subject,
      fromEmail,
      fromName: null,
      toEmails: [normalizedToEmail],
      textBody: trimmedReplyText,
      htmlBody: replyHtml,
      headers: null,
      receivedAt: null,
      readAt: new Date(),
      userId: linkedUserId,
    },
  })

  return { success: true, outboundEmail }
}
