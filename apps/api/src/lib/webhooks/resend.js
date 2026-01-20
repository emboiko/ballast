import prisma from "../../../../../packages/shared/src/db/client.js"
import {
  deriveThreadKey,
  getHeaderValue,
  normalizeEmailAddress,
  parseMessageIdList,
} from "../utils/email.js"
import {
  getReceivedEmailContent,
  verifyResendWebhook,
} from "../../gateways/emailGateway.js"
import { recordSystemEvent } from "../systemEvents.js"

const getSvixHeaderString = (headerValue) => {
  if (typeof headerValue === "string") {
    return headerValue
  }
  return undefined
}

const normalizeEmailEventData = (data) => {
  if (data && typeof data === "object") {
    return data
  }
  return {}
}

const extractRecipient = (eventData) => {
  if (Array.isArray(eventData.to) && eventData.to.length > 0) {
    const firstRecipient = eventData.to[0]
    if (typeof firstRecipient === "string") {
      return firstRecipient
    }
    if (firstRecipient && typeof firstRecipient === "object") {
      if (typeof firstRecipient.email === "string") {
        return firstRecipient.email
      }
    }
  }

  if (typeof eventData.to === "string") {
    return eventData.to
  }

  return null
}

/**
 * Process a Resend webhook request body and headers.
 * @param {object} params
 * @param {string} params.rawBody
 * @param {Record<string, any>} params.headers
 * @returns {Promise<{ ok: true, deduped?: true }>}
 */
export const handleResendWebhook = async ({ rawBody, headers }) => {
  if (!rawBody) {
    throw new Error("Missing raw webhook payload")
  }

  const verifiedEvent = verifyResendWebhook({
    payload: rawBody,
    headers: {
      id: getSvixHeaderString(headers["svix-id"]),
      timestamp: getSvixHeaderString(headers["svix-timestamp"]),
      signature: getSvixHeaderString(headers["svix-signature"]),
    },
  })

  if (!verifiedEvent) {
    return { ok: true }
  }

  if (
    verifiedEvent.type === "email.bounced" ||
    verifiedEvent.type === "email.complained"
  ) {
    const eventData = normalizeEmailEventData(verifiedEvent.data)
    const recipient = extractRecipient(eventData)
    let eventType = "email.bounced"
    let payloadKey = "bounce"

    if (verifiedEvent.type === "email.complained") {
      eventType = "email.complained"
      payloadKey = "complaint"
    }

    const payload = {
      recipient,
      [payloadKey]: eventData,
    }

    await recordSystemEvent({
      eventType,
      entityType: "email",
      entityId: eventData.id || null,
      payload,
    })

    return { ok: true }
  }

  if (verifiedEvent.type !== "email.received") {
    return { ok: true }
  }

  const receivedEmailId =
    verifiedEvent.data?.email_id ||
    verifiedEvent.data?.emailId ||
    verifiedEvent.data?.id ||
    null

  if (!receivedEmailId) {
    throw new Error("Missing email id in webhook payload")
  }

  const existingByResendId = await prisma.communicationEmail.findFirst({
    where: { resendEmailId: receivedEmailId },
    select: { id: true },
  })

  if (existingByResendId) {
    return { ok: true, deduped: true }
  }

  const received = await getReceivedEmailContent(receivedEmailId)
  const emailData =
    received && typeof received === "object" && received.data
      ? received.data
      : received

  const subject = emailData?.subject || null
  const htmlBody = emailData?.html || null
  const textBody = emailData?.text || null
  const emailHeaders = emailData?.headers || null

  const messageId =
    getHeaderValue(emailHeaders, "message-id") ||
    getHeaderValue(emailHeaders, "message_id") ||
    null

  const inReplyTo =
    getHeaderValue(emailHeaders, "in-reply-to") ||
    getHeaderValue(emailHeaders, "in_reply_to") ||
    null

  const referencesHeader =
    getHeaderValue(emailHeaders, "references") ||
    getHeaderValue(emailHeaders, "reference") ||
    null

  const references = parseMessageIdList(referencesHeader)

  const fromEmail =
    normalizeEmailAddress(emailData?.from?.email) ||
    normalizeEmailAddress(emailData?.from) ||
    null

  let fromName = null
  if (emailData && emailData.from && typeof emailData.from === "object") {
    if (typeof emailData.from.name === "string") {
      const trimmedFromName = emailData.from.name.trim()
      if (trimmedFromName) {
        fromName = trimmedFromName
      }
    }
  }

  let toEmailsRaw = []
  if (Array.isArray(emailData?.to)) {
    toEmailsRaw = emailData.to
  } else if (emailData && emailData.to) {
    toEmailsRaw = [emailData.to]
  }

  const toEmails = toEmailsRaw
    .map((toValue) => {
      if (toValue && typeof toValue === "object") {
        return normalizeEmailAddress(toValue.email)
      }
      return normalizeEmailAddress(toValue)
    })
    .filter(Boolean)

  if (!fromEmail) {
    throw new Error("Missing from email")
  }

  const threadKey = deriveThreadKey({
    receivedEmailId,
    references,
    inReplyTo,
    messageId,
  })

  let linkedUserId = null
  const existingUser = await prisma.user.findUnique({
    where: { email: fromEmail },
    select: { id: true },
  })
  if (existingUser) {
    linkedUserId = existingUser.id
  }

  if (messageId) {
    const existingByMessageId = await prisma.communicationEmail.findFirst({
      where: { messageId },
      select: { id: true },
    })
    if (existingByMessageId) {
      return { ok: true, deduped: true }
    }
  }

  const communicationEmail = await prisma.communicationEmail.create({
    data: {
      direction: "INBOUND",
      status: "received",
      resendEmailId: receivedEmailId,
      messageId,
      inReplyTo,
      references,
      threadKey,
      subject,
      fromEmail,
      fromName,
      toEmails,
      textBody,
      htmlBody,
      headers: emailHeaders,
      readAt: null,
      userId: linkedUserId,
    },
  })

  await recordSystemEvent({
    eventType: "email.received",
    entityType: "email",
    entityId: communicationEmail.id,
    payload: {
      fromEmail,
      toEmails,
      subject,
      messageId,
      threadKey,
    },
  })

  return { ok: true }
}
