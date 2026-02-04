import prisma from "../../../../packages/shared/src/db/client.js"
import { chargeSubscriptions } from "../../lib/jobs/chargeSubscriptions.js"

const correlationId = crypto.randomUUID()

const logger = {
  info: (...args) =>
    console.info(`[chargeSubscriptions][${correlationId}]`, ...args),
  warn: (...args) =>
    console.warn(`[chargeSubscriptions][${correlationId}]`, ...args),
  error: (...args) =>
    console.error(`[chargeSubscriptions][${correlationId}]`, ...args),
}

const run = async () => {
  try {
    await chargeSubscriptions({ logger })
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    logger.error("Charge subscriptions job failed", error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

run()
