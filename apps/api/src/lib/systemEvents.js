import prisma from "@ballast/shared/src/db/client.js"
import { formatMoney } from "@ballast/shared/src/money.js"

export const SYSTEM_EVENT_DEFINITIONS = {
  "user.created": {
    title: "User created",
    getDescription: (payload) => {
      const email = payload?.email
      if (typeof email === "string" && email.trim().length > 0) {
        return `New user signup: ${email.trim()}`
      }
      return "New user signup"
    },
  },
  "order.succeeded": {
    title: "Order succeeded",
    getDescription: (payload) => {
      const orderItemSummary = buildOrderItemSummary(payload)
      const amountCents = payload?.amountCents
      let description = "Order payment succeeded"
      if (orderItemSummary) {
        description = `${description}: ${orderItemSummary}`
      }
      if (Number.isInteger(amountCents)) {
        description = `${description} (${formatMoney(amountCents)})`
      }
      return description
    },
  },
  "refund.failed": {
    title: "Refund failed",
    getDescription: (payload) => {
      const orderItemSummary = buildOrderItemSummary(payload)
      let description = "Refund failed to process"
      if (orderItemSummary) {
        description = `${description}: ${orderItemSummary}`
      }
      return description
    },
  },
  "email.bounced": {
    title: "Email bounced",
    getDescription: (payload) => {
      const recipient = payload?.recipient
      if (typeof recipient === "string" && recipient.trim().length > 0) {
        return `Email bounced for ${recipient.trim()}`
      }
      return "Email bounced"
    },
  },
  "email.complained": {
    title: "Email complaint",
    getDescription: (payload) => {
      const recipient = payload?.recipient
      if (typeof recipient === "string" && recipient.trim().length > 0) {
        return `Email complaint for ${recipient.trim()}`
      }
      return "Email complaint received"
    },
  },
  "email.received": {
    title: "Email received",
    getDescription: (payload) => {
      const fromEmail = payload?.fromEmail
      if (typeof fromEmail === "string" && fromEmail.trim().length > 0) {
        return `Inbound email from ${fromEmail.trim()}`
      }
      return "Inbound email received"
    },
  },
  "refund.requested": {
    title: "Refund requested",
    getDescription: (payload) => {
      const orderItemSummary = buildOrderItemSummary(payload)
      if (orderItemSummary) {
        return `Refund request submitted for ${orderItemSummary}`
      }
      return "Refund request submitted"
    },
  },
}

const buildOrderItemSummary = (payload) => {
  const orderItemName = payload?.orderItemName
  const orderItemCount = payload?.orderItemCount

  if (typeof orderItemName !== "string" || orderItemName.trim().length === 0) {
    return null
  }

  let summary = orderItemName.trim()

  if (Number.isInteger(orderItemCount) && orderItemCount > 1) {
    summary = `${summary} + ${orderItemCount - 1} more`
  }

  return summary
}

const normalizeEventType = (eventType) => {
  if (typeof eventType !== "string") {
    return null
  }
  const trimmed = eventType.trim()
  if (!trimmed) {
    return null
  }
  return trimmed
}

export const recordSystemEvent = async ({
  eventType,
  entityType = null,
  entityId = null,
  payload = null,
}) => {
  const normalizedEventType = normalizeEventType(eventType)
  if (!normalizedEventType) {
    console.warn("Failed to record system event: eventType is required")
    return null
  }

  if (!SYSTEM_EVENT_DEFINITIONS[normalizedEventType]) {
    console.warn(
      `Failed to record system event: unknown event type ${normalizedEventType}`
    )
    return null
  }

  try {
    return await prisma.systemEvent.create({
      data: {
        eventType: normalizedEventType,
        entityType,
        entityId,
        payload,
      },
    })
  } catch (error) {
    console.warn(`Failed to record system event ${normalizedEventType}:`, error)
    return null
  }
}

export const formatSystemEventForAdmin = (event) => {
  const definition = SYSTEM_EVENT_DEFINITIONS[event.eventType]
  let title = event.eventType
  let description = ""

  if (definition) {
    if (typeof definition.title === "string") {
      title = definition.title
    }
    if (typeof definition.getDescription === "function") {
      description = definition.getDescription(event.payload)
    }
  }

  return {
    id: event.id,
    eventType: event.eventType,
    title,
    description,
    createdAt: event.createdAt,
    entityType: event.entityType,
    entityId: event.entityId,
    payload: event.payload,
  }
}
