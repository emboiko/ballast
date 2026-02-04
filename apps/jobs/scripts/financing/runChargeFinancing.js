import prisma from "../../../../packages/shared/src/db/client.js"
import { chargeFinancingPlans } from "../../lib/jobs/chargeFinancingPlans.js"

const correlationId = crypto.randomUUID()

const logger = {
  info: (...args) =>
    console.info(`[chargeFinancingPlans][${correlationId}]`, ...args),
  warn: (...args) =>
    console.warn(`[chargeFinancingPlans][${correlationId}]`, ...args),
  error: (...args) =>
    console.error(`[chargeFinancingPlans][${correlationId}]`, ...args),
}

const run = async () => {
  try {
    await chargeFinancingPlans({ logger })
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    logger.error("Charge financing job failed", error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

run()
