import assert from "node:assert/strict"
import { test } from "node:test"
import { chargeFinancingPlans } from "../lib/jobs/chargeFinancingPlans.js"

const createMockPrisma = ({
  plans = [],
  payments = [],
  users = [],
} = {}) => {
  const jobRuns = []
  let paymentCounter = 1
  let jobRunCounter = 1

  const findPlanIndexById = (planId) => {
    return plans.findIndex((plan) => plan.id === planId)
  }

  const findPaymentIndexById = (paymentId) => {
    return payments.findIndex((payment) => payment.id === paymentId)
  }

  const prismaClient = {
    jobRun: {
      create: async ({ data }) => {
        const jobRun = {
          id: `jobrun_${jobRunCounter}`,
          ...data,
        }
        jobRunCounter += 1
        jobRuns.push(jobRun)
        return jobRun
      },
      update: async ({ where, data }) => {
        const jobRun = jobRuns.find((item) => item.id === where.id)
        if (!jobRun) {
          throw new Error(`JobRun ${where.id} not found`)
        }
        Object.assign(jobRun, data)
        return jobRun
      },
    },
    financingPlan: {
      findMany: async ({ where }) => {
        return plans.filter((plan) => {
          if (where?.status && plan.status !== where.status) {
            return false
          }
          const nextPaymentFilter = where?.nextPaymentDate
          if (nextPaymentFilter?.lte) {
            if (!plan.nextPaymentDate) {
              return false
            }
            if (plan.nextPaymentDate.getTime() > nextPaymentFilter.lte.getTime()) {
              return false
            }
          }
          return true
        })
      },
      update: async ({ where, data }) => {
        const planIndex = findPlanIndexById(where.id)
        if (planIndex === -1) {
          throw new Error(`Plan ${where.id} not found`)
        }
        plans[planIndex] = {
          ...plans[planIndex],
          ...data,
        }
        return plans[planIndex]
      },
    },
    financingPayment: {
      findMany: async ({ where, orderBy }) => {
        const filtered = payments.filter((payment) => {
          if (where?.planId && payment.planId !== where.planId) {
            return false
          }
          if (where?.type && payment.type !== where.type) {
            return false
          }
          return true
        })
        if (orderBy?.createdAt === "desc") {
          filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        }
        return filtered
      },
      create: async ({ data }) => {
        const payment = {
          id: `payment_${paymentCounter}`,
          createdAt: new Date(),
          ...data,
        }
        paymentCounter += 1
        payments.push(payment)
        return payment
      },
      update: async ({ where, data }) => {
        const paymentIndex = findPaymentIndexById(where.id)
        if (paymentIndex === -1) {
          throw new Error(`Payment ${where.id} not found`)
        }
        payments[paymentIndex] = {
          ...payments[paymentIndex],
          ...data,
        }
        return payments[paymentIndex]
      },
    },
    user: {
      findUnique: async ({ where }) => {
        return users.find((user) => user.id === where.id) || null
      },
    },
  }

  return {
    prismaClient,
    data: {
      plans,
      payments,
      users,
      jobRuns,
    },
  }
}

const buildPlan = ({ overrides = {} } = {}) => {
  const basePlan = {
    id: "plan_1",
    userId: "user_1",
    processor: "STRIPE",
    processorCustomerId: "cus_123",
    processorPaymentMethodId: "pm_123",
    status: "ACTIVE",
    remainingBalanceCents: 10000,
    currency: "usd",
    failedPaymentAttempts: 0,
    nextPaymentDate: new Date("2026-01-10T00:00:00Z"),
    scheduleJson: {
      installments: [
        {
          dueDate: "2026-01-10T00:00:00Z",
          amountCents: 5000,
        },
        {
          dueDate: "2026-02-10T00:00:00Z",
          amountCents: 5000,
        },
      ],
    },
  }

  return {
    ...basePlan,
    ...overrides,
  }
}

test("charges due installment and updates plan balance", async () => {
  const plan = buildPlan()
  const { prismaClient, data } = createMockPrisma({ plans: [plan] })
  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return { success: true, paymentIntentId: "pi_123" }
  }

  const result = await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(result.success, true)
  assert.equal(chargeInstallmentCalls.length, 1)
  assert.equal(data.payments.length, 1)
  assert.equal(data.payments[0].status, "SUCCEEDED")
  assert.equal(data.plans[0].remainingBalanceCents, 5000)
  assert.equal(
    data.plans[0].nextPaymentDate.toISOString(),
    "2026-02-10T00:00:00.000Z"
  )
  assert.equal(data.plans[0].failedPaymentAttempts, 0)
  assert.equal(data.jobRuns[0].status, "COMPLETED")
})

test("skips installment already marked as succeeded", async () => {
  const plan = buildPlan({
    overrides: {
      remainingBalanceCents: 5000,
    },
  })
  const existingPayment = {
    id: "payment_1",
    planId: plan.id,
    type: "INSTALLMENT",
    status: "SUCCEEDED",
    amountCents: 5000,
    currency: "usd",
    scheduledFor: new Date("2026-01-10T00:00:00Z"),
    createdAt: new Date("2026-01-11T00:00:00Z"),
  }
  const { prismaClient, data } = createMockPrisma({
    plans: [plan],
    payments: [existingPayment],
  })
  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return { success: true, paymentIntentId: "pi_456" }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(chargeInstallmentCalls.length, 0)
  assert.equal(data.payments.length, 1)
  assert.equal(
    data.plans[0].nextPaymentDate.toISOString(),
    "2026-02-10T00:00:00.000Z"
  )
})

test("defaults plan after three failed attempts and stores failure message", async () => {
  const plan = buildPlan({
    overrides: {
      failedPaymentAttempts: 2,
    },
  })
  const { prismaClient, data } = createMockPrisma({ plans: [plan] })
  const chargeInstallmentFn = async () => {
    return { success: false, error: "insufficient funds" }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(data.plans[0].status, "DEFAULTED")
  assert.equal(data.plans[0].failedPaymentAttempts, 3)
  assert.equal(data.payments.length, 1)
  assert.equal(data.payments[0].failureMessage, "insufficient funds")
  assert.equal(data.plans[0].nextPaymentDate, null)
})
