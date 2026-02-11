import crypto from "node:crypto"
import prisma from "../../../../packages/shared/src/db/client.js"
import { sendUpcomingChargeReminders } from "../../lib/jobs/sendUpcomingChargeReminders.js"

const correlationId = crypto.randomUUID()

const logger = {
  info: (...args) =>
    console.info(`[sendUpcomingChargeReminders][${correlationId}]`, ...args),
  warn: (...args) =>
    console.warn(`[sendUpcomingChargeReminders][${correlationId}]`, ...args),
  error: (...args) =>
    console.error(`[sendUpcomingChargeReminders][${correlationId}]`, ...args),
}

const run = async () => {
  try {
    await sendUpcomingChargeReminders({ logger })
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    logger.error("Send upcoming charge reminders job failed", error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

run()

