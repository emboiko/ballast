import prisma from "../../../../packages/shared/src/db/client.js"
import { subtractMoney } from "../../../../packages/shared/src/money.js"
import { chargeStripePayment } from "../gateways/stripeGateway.js"

const MAX_FAILED_ATTEMPTS = 3

const normalizeInstallment = (installment) => {
  if (!installment) {
    return null
  }

  const amountCents = installment.amountCents
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return null
  }

  const dueDateValue = installment.dueDate
  const dueDate = new Date(dueDateValue)
  if (!dueDateValue || Number.isNaN(dueDate.getTime())) {
    return null
  }

  return {
    dueDate,
    amountCents,
  }
}

const getInstallments = (plan) => {
  if (!plan?.scheduleJson) {
    return []
  }

  const installments = plan.scheduleJson.installments
  if (!Array.isArray(installments)) {
    return []
  }

  const normalized = installments
    .map((installment) => normalizeInstallment(installment))
    .filter((installment) => installment !== null)

  normalized.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  return normalized
}

const getInstallmentKey = (date) => {
  return date.toISOString()
}

const buildLatestPaymentMap = (payments) => {
  const latestByDateKey = new Map()

  for (const payment of payments) {
    if (!payment?.scheduledFor) {
      continue
    }

    const dateKey = getInstallmentKey(payment.scheduledFor)
    if (!latestByDateKey.has(dateKey)) {
      latestByDateKey.set(dateKey, payment)
    }
  }

  return latestByDateKey
}

const buildPaidInstallmentSet = (payments) => {
  const paidInstallments = new Set()

  for (const payment of payments) {
    if (payment?.status !== "SUCCEEDED") {
      continue
    }
    if (!payment?.scheduledFor) {
      continue
    }
    paidInstallments.add(getInstallmentKey(payment.scheduledFor))
  }

  return paidInstallments
}

const buildPendingInstallmentSet = (payments) => {
  const pendingInstallments = new Set()

  for (const payment of payments) {
    if (payment?.status !== "PENDING") {
      continue
    }
    if (!payment?.scheduledFor) {
      continue
    }
    pendingInstallments.add(getInstallmentKey(payment.scheduledFor))
  }

  return pendingInstallments
}

const getNextPaymentDate = (installments, paidInstallments) => {
  for (const installment of installments) {
    const dateKey = getInstallmentKey(installment.dueDate)
    if (!paidInstallments.has(dateKey)) {
      return installment.dueDate
    }
  }

  return null
}

const chargeInstallment = async ({
  plan,
  customerId,
  paymentMethodId,
  amountCents,
  dueDate,
  jobRunId,
}) => {
  return chargeStripePayment({
    customerId,
    paymentMethodId,
    amountCents,
    currency: plan.currency || "usd",
    idempotencyKey: `financing:${plan.id}:${dueDate.toISOString()}`,
    metadata: {
      jobRunId,
      planId: plan.id,
      dueDate: dueDate.toISOString(),
    },
  })
}

const updateJobRunProgress = async (prismaClient, jobRunId, progress) => {
  await prismaClient.jobRun.update({
    where: { id: jobRunId },
    data: { progress },
  })
}

const resolveStripeCustomerId = async (prismaClient, plan) => {
  if (plan.processorCustomerId) {
    return plan.processorCustomerId
  }

  const user = await prismaClient.user.findUnique({
    where: { id: plan.userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) {
    await prismaClient.financingPlan.update({
      where: { id: plan.id },
      data: { processorCustomerId: user.stripeCustomerId },
    })
    return user.stripeCustomerId
  }

  return null
}

const getProcessorHandler = (prismaClient, plan) => {
  if (plan.processor === "STRIPE") {
    return {
      name: "STRIPE",
      resolveContext: async () => {
        const customerId = await resolveStripeCustomerId(prismaClient, plan)
        if (!customerId) {
          return { error: "Missing Stripe customer ID" }
        }
        if (!plan.processorPaymentMethodId) {
          return { error: "Missing Stripe payment method ID" }
        }
        return {
          customerId,
          paymentMethodId: plan.processorPaymentMethodId,
        }
      },
    }
  }

  return null
}

export const chargeFinancingPlans = async ({
  logger,
  now,
  prismaClient,
  chargeInstallmentFn,
  getProcessorHandlerFn,
} = {}) => {
  const log = logger || console
  let currentTime = now
  if (!currentTime) {
    currentTime = new Date()
  }
  const resolvedPrisma = prismaClient || prisma
  const resolvedChargeInstallment = chargeInstallmentFn || chargeInstallment
  const resolvedGetProcessorHandler =
    getProcessorHandlerFn || getProcessorHandler

  const jobRun = await resolvedPrisma.jobRun.create({
    data: {
      jobType: "chargeFinancingPlans",
      status: "RUNNING",
      startedAt: currentTime,
      progress: {
        totalPlans: 0,
        processedPlans: 0,
        totalInstallmentsDue: 0,
        processedInstallments: 0,
        succeededPayments: 0,
        failedPayments: 0,
        skippedInstallments: 0,
      },
    },
  })

  let processedPlans = 0
  let totalInstallmentsDue = 0
  let processedInstallments = 0
  let succeededPayments = 0
  let failedPayments = 0
  let skippedInstallments = 0

  try {
    const plans = await resolvedPrisma.financingPlan.findMany({
      where: {
        status: "ACTIVE",
        nextPaymentDate: { lte: currentTime },
      },
      orderBy: { nextPaymentDate: "asc" },
    })

    const totalPlans = plans.length
    await updateJobRunProgress(resolvedPrisma, jobRun.id, {
      totalPlans,
      processedPlans,
      totalInstallmentsDue,
      processedInstallments,
      succeededPayments,
      failedPayments,
      skippedInstallments,
    })

    for (const plan of plans) {
      const installments = getInstallments(plan)
      const dueInstallments = installments.filter(
        (installment) => installment.dueDate.getTime() <= currentTime.getTime()
      )

      totalInstallmentsDue += dueInstallments.length

      const planPayments = await resolvedPrisma.financingPayment.findMany({
        where: { planId: plan.id, type: "INSTALLMENT" },
        orderBy: { createdAt: "desc" },
      })

      const latestPaymentByDateKey = buildLatestPaymentMap(planPayments)
      const paidInstallments = buildPaidInstallmentSet(planPayments)
      const pendingInstallments = buildPendingInstallmentSet(planPayments)
      let remainingBalanceCents = plan.remainingBalanceCents
      let failedPaymentAttempts = plan.failedPaymentAttempts || 0
      let updatedStatus = plan.status

      const processorHandler = resolvedGetProcessorHandler(resolvedPrisma, plan)
      if (!processorHandler) {
        skippedInstallments += dueInstallments.length
        log.warn("unsupported processor", {
          planId: plan.id,
          processor: plan.processor,
        })
        processedPlans += 1
        await updateJobRunProgress(resolvedPrisma, jobRun.id, {
          totalPlans,
          processedPlans,
          totalInstallmentsDue,
          processedInstallments,
          succeededPayments,
          failedPayments,
          skippedInstallments,
        })
        continue
      }

      const processorContext = await processorHandler.resolveContext()
      if (processorContext.error) {
        skippedInstallments += dueInstallments.length
        log.warn(`${processorHandler.name} context missing`, {
          planId: plan.id,
          message: processorContext.error,
        })
        processedPlans += 1
        await updateJobRunProgress(resolvedPrisma, jobRun.id, {
          totalPlans,
          processedPlans,
          totalInstallmentsDue,
          processedInstallments,
          succeededPayments,
          failedPayments,
          skippedInstallments,
        })
        continue
      }

      for (const installment of dueInstallments) {
        if (remainingBalanceCents <= 0) {
          break
        }

        const installmentKey = getInstallmentKey(installment.dueDate)
        if (paidInstallments.has(installmentKey)) {
          continue
        }
        if (pendingInstallments.has(installmentKey)) {
          continue
        }
        const latestPayment = latestPaymentByDateKey.get(installmentKey)
        if (latestPayment) {
          if (latestPayment.status === "SUCCEEDED") {
            continue
          }
          if (latestPayment.status === "PENDING") {
            continue
          }
        }

        let amountCents = installment.amountCents
        if (amountCents > remainingBalanceCents) {
          amountCents = remainingBalanceCents
        }

        if (amountCents <= 0) {
          continue
        }

        const payment = await resolvedPrisma.financingPayment.create({
          data: {
            planId: plan.id,
            type: "INSTALLMENT",
            status: "PENDING",
            amountCents,
            currency: plan.currency || "usd",
            scheduledFor: installment.dueDate,
          },
        })

        processedInstallments += 1

        let chargeResult = null
        try {
          chargeResult = await resolvedChargeInstallment({
            plan,
            customerId: processorContext.customerId,
            paymentMethodId: processorContext.paymentMethodId,
            amountCents,
            dueDate: installment.dueDate,
            jobRunId: jobRun.id,
          })
        } catch (error) {
          const errorMessage = error?.message || "Charge failed"
          log.error("charge error", {
            planId: plan.id,
            paymentId: payment.id,
            message: errorMessage,
          })
          chargeResult = { success: false, error: errorMessage }
        }

        if (chargeResult && chargeResult.success) {
          await resolvedPrisma.financingPayment.update({
            where: { id: payment.id },
            data: {
              status: "SUCCEEDED",
              paidAt: new Date(),
              processorPaymentId: chargeResult.paymentIntentId,
            },
          })
          paidInstallments.add(installmentKey)
          remainingBalanceCents = subtractMoney(
            remainingBalanceCents,
            amountCents
          )
          if (remainingBalanceCents < 0) {
            remainingBalanceCents = 0
          }
          succeededPayments += 1
          failedPaymentAttempts = 0
        } else {
          let errorMessage = "Charge failed"
          if (chargeResult && chargeResult.error) {
            errorMessage = chargeResult.error
          }
          await resolvedPrisma.financingPayment.update({
            where: { id: payment.id },
            data: {
              status: "FAILED",
              failureMessage: errorMessage,
            },
          })
          failedPayments += 1
          failedPaymentAttempts += 1
          log.warn("charge failed", {
            planId: plan.id,
            paymentId: payment.id,
            message: errorMessage,
          })

          if (failedPaymentAttempts >= MAX_FAILED_ATTEMPTS) {
            updatedStatus = "DEFAULTED"
            break
          }
        }
      }

      if (updatedStatus === "ACTIVE" && remainingBalanceCents <= 0) {
        updatedStatus = "PAID_OFF"
      }

      let nextPaymentDate = null
      if (updatedStatus === "ACTIVE") {
        nextPaymentDate = getNextPaymentDate(installments, paidInstallments)
      } else {
        nextPaymentDate = null
      }

      await resolvedPrisma.financingPlan.update({
        where: { id: plan.id },
        data: {
          remainingBalanceCents,
          status: updatedStatus,
          nextPaymentDate,
          failedPaymentAttempts,
        },
      })

      processedPlans += 1
      await updateJobRunProgress(resolvedPrisma, jobRun.id, {
        totalPlans,
        processedPlans,
        totalInstallmentsDue,
        processedInstallments,
        succeededPayments,
        failedPayments,
        skippedInstallments,
      })
    }

    const summary = {
      totalPlans: plans.length,
      processedPlans,
      totalInstallmentsDue,
      processedInstallments,
      succeededPayments,
      failedPayments,
      skippedInstallments,
    }

    await resolvedPrisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        summary,
        progress: summary,
      },
    })

    log.info("completed", summary)
    return { success: true, summary }
  } catch (error) {
    const errorMessage = error?.message || "Job failed"
    await resolvedPrisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        error: errorMessage,
      },
    })

    log.error("failed", { message: errorMessage })
    throw error
  }
}
