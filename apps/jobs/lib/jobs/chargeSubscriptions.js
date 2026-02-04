import prisma from "../../../../packages/shared/src/db/client.js"

const JOB_TYPE = "chargeSubscriptions"

export const chargeSubscriptions = async ({ logger } = {}) => {
  const log = logger || console
  const now = new Date()

  const jobRun = await prisma.jobRun.create({
    data: {
      jobType: JOB_TYPE,
      status: "SKIPPED",
      startedAt: now,
      completedAt: now,
      summary: {
        message: "Subscriptions job is not implemented yet.",
      },
      progress: {
        totalPlans: 0,
        processedPlans: 0,
        totalInstallmentsDue: 0,
        processedInstallments: 0,
        succeededPayments: 0,
        failedPayments: 0,
      },
    },
  })

  log.info(`[${JOB_TYPE}] skipped`, { jobRunId: jobRun.id })
  return { success: true, jobRunId: jobRun.id }
}
