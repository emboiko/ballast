import prisma from "../src/db/client.js"

const minutesAgo = (minutes) => {
  const now = Date.now()
  return new Date(now - minutes * 60 * 1000)
}

const buildSeedEvents = () => {
  return [
    {
      eventType: "user.created",
      entityType: "user",
      entityId: "seed-user-001",
      payload: { email: "samantha@ballast.dev", authProvider: "LOCAL" },
      createdAt: minutesAgo(10),
    },
    {
      eventType: "user.created",
      entityType: "user",
      entityId: "seed-user-002",
      payload: { email: "someone@gmail.com", authProvider: "GOOGLE" },
      createdAt: minutesAgo(10),
    },
    {
      eventType: "order.succeeded",
      entityType: "order",
      entityId: "seed-order-001",
      payload: {
        orderId: "seed-order-001",
        amountCents: 12500,
        currency: "usd",
        processor: "STRIPE",
        userId: "seed-user-001",
        orderItemName: "Retroencabulator Mk 1",
        orderItemCount: 2,
      },
      createdAt: minutesAgo(9),
    },
    {
      eventType: "refund.requested",
      entityType: "refund",
      entityId: "seed-refund-001",
      payload: {
        refundId: "seed-refund-001",
        orderId: "seed-order-001",
        userId: "seed-user-001",
        orderItemName: "Retroencabulator Mk 1",
        orderItemCount: 2,
      },
      createdAt: minutesAgo(8),
    },
    {
      eventType: "refund.failed",
      entityType: "refund",
      entityId: "seed-refund-002",
      payload: {
        refundId: "seed-refund-002",
        orderId: "seed-order-002",
        adminUserId: "seed-admin-001",
        reason: "processor_error",
        message: "Processor timeout during refund",
        orderItemName: "Calibration Kit Mk 3",
        orderItemCount: 1,
      },
      createdAt: minutesAgo(7),
    },
    {
      eventType: "email.received",
      entityType: "email",
      entityId: "seed-email-001",
      payload: {
        fromEmail: "ops@ballast.dev",
        toEmails: ["support@ballast.dev"],
        subject: "Issue with recent order",
        messageId: "seed-message-001",
        threadKey: "seed-thread-001",
      },
      createdAt: minutesAgo(6),
    },
    {
      eventType: "email.bounced",
      entityType: "email",
      entityId: "seed-email-002",
      payload: {
        recipient: "billing@ballast.dev",
        bounce: {
          id: "seed-bounce-001",
          to: ["billing@ballast.dev"],
          reason: "mailbox_full",
        },
      },
      createdAt: minutesAgo(5),
    },
    {
      eventType: "email.complained",
      entityType: "email",
      entityId: "seed-email-003",
      payload: {
        recipient: "alerts@ballast.dev",
        complaint: {
          id: "seed-complaint-001",
          to: ["alerts@ballast.dev"],
          reason: "spam_report",
        },
      },
      createdAt: minutesAgo(4),
    },
    {
      eventType: "order.succeeded",
      entityType: "order",
      entityId: "seed-order-002",
      payload: {
        orderId: "seed-order-002",
        amountCents: 6800,
        currency: "usd",
        processor: "STRIPE",
        userId: "seed-user-002",
        orderItemName: "Flux Rotor",
        orderItemCount: 1,
      },
      createdAt: minutesAgo(3),
    },
    {
      eventType: "user.created",
      entityType: "user",
      entityId: "seed-user-002",
      payload: { email: "leo@ballast.dev", authProvider: "GOOGLE" },
      createdAt: minutesAgo(2),
    },
  ]
}

const clearSystemEvents = async () => {
  await prisma.systemEvent.deleteMany()
}

const seedSystemEvents = async () => {
  const events = buildSeedEvents()
  await prisma.systemEvent.createMany({
    data: events,
  })
}

const run = async () => {
  await clearSystemEvents()
  await seedSystemEvents()
}

run()
  .catch((error) => {
    console.error("System events seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
