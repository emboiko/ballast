import assert from "node:assert/strict"
import { test } from "node:test"
import { chargeFinancingPlans } from "../lib/jobs/chargeFinancingPlans.js"

const createMockLogger = () => {
  const entries = {
    info: [],
    warn: [],
    error: [],
  }

  return {
    logger: {
      info: (...args) => {
        entries.info.push(args)
      },
      warn: (...args) => {
        entries.warn.push(args)
      },
      error: (...args) => {
        entries.error.push(args)
      },
    },
    entries,
  }
}

const createMockPrisma = ({ plans = [], payments = [], users = [] } = {}) => {
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
            if (
              plan.nextPaymentDate.getTime() > nextPaymentFilter.lte.getTime()
            ) {
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
    logger: console,
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

test("skips installment when latest payment is pending", async () => {
  const plan = buildPlan()
  const existingPendingPayment = {
    id: "payment_1",
    planId: plan.id,
    type: "INSTALLMENT",
    status: "PENDING",
    amountCents: 5000,
    currency: "usd",
    scheduledFor: new Date("2026-01-10T00:00:00Z"),
    createdAt: new Date("2026-01-11T00:00:00Z"),
  }

  const { prismaClient, data } = createMockPrisma({
    plans: [plan],
    payments: [existingPendingPayment],
  })

  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return { success: true, paymentIntentId: "pi_ignored" }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(chargeInstallmentCalls.length, 0)
  assert.equal(data.payments.length, 1)
  assert.equal(data.payments[0].status, "PENDING")
})

test("caps installment amount to remaining balance and marks paid off", async () => {
  const plan = buildPlan({
    overrides: {
      remainingBalanceCents: 3000,
      scheduleJson: {
        installments: [
          {
            dueDate: "2026-01-10T00:00:00Z",
            amountCents: 5000,
          },
        ],
      },
    },
  })

  const { prismaClient, data } = createMockPrisma({ plans: [plan] })
  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return { success: true, paymentIntentId: "pi_123" }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(chargeInstallmentCalls.length, 1)
  assert.equal(chargeInstallmentCalls[0].amountCents, 3000)
  assert.equal(data.plans[0].remainingBalanceCents, 0)
  assert.equal(data.plans[0].status, "PAID_OFF")
  assert.equal(data.plans[0].nextPaymentDate, null)
})

test("charges multiple due installments in one run for weekly cadence", async () => {
  const plan = buildPlan({
    overrides: {
      remainingBalanceCents: 9000,
      nextPaymentDate: new Date("2026-01-01T00:00:00Z"),
      scheduleJson: {
        installments: [
          { dueDate: "2026-01-01T00:00:00Z", amountCents: 3000 },
          { dueDate: "2026-01-08T00:00:00Z", amountCents: 3000 },
          { dueDate: "2026-01-15T00:00:00Z", amountCents: 3000 },
        ],
      },
    },
  })

  const { prismaClient, data } = createMockPrisma({ plans: [plan] })
  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return {
      success: true,
      paymentIntentId: `pi_${chargeInstallmentCalls.length}`,
    }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-10T00:00:00Z"),
  })

  assert.equal(chargeInstallmentCalls.length, 2)
  assert.equal(data.payments.length, 2)
  assert.equal(
    data.payments[0].scheduledFor.toISOString(),
    "2026-01-01T00:00:00.000Z"
  )
  assert.equal(
    data.payments[1].scheduledFor.toISOString(),
    "2026-01-08T00:00:00.000Z"
  )
  assert.equal(
    data.plans[0].nextPaymentDate.toISOString(),
    "2026-01-15T00:00:00.000Z"
  )
})

test("charges multiple due installments in one run for monthly cadence", async () => {
  const plan = buildPlan({
    overrides: {
      remainingBalanceCents: 15000,
      nextPaymentDate: new Date("2026-01-10T00:00:00Z"),
      scheduleJson: {
        installments: [
          { dueDate: "2026-01-10T00:00:00Z", amountCents: 5000 },
          { dueDate: "2026-02-10T00:00:00Z", amountCents: 5000 },
          { dueDate: "2026-03-10T00:00:00Z", amountCents: 5000 },
        ],
      },
    },
  })

  const { prismaClient, data } = createMockPrisma({ plans: [plan] })
  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return {
      success: true,
      paymentIntentId: `pi_${chargeInstallmentCalls.length}`,
    }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-02-15T00:00:00Z"),
  })

  assert.equal(chargeInstallmentCalls.length, 2)
  assert.equal(
    data.plans[0].nextPaymentDate.toISOString(),
    "2026-03-10T00:00:00.000Z"
  )
})

test("resets failed attempt counter after a successful payment", async () => {
  const plan = buildPlan({
    overrides: {
      failedPaymentAttempts: 2,
      remainingBalanceCents: 5000,
      scheduleJson: {
        installments: [{ dueDate: "2026-01-10T00:00:00Z", amountCents: 5000 }],
      },
    },
  })
  const { prismaClient, data } = createMockPrisma({ plans: [plan] })
  const chargeInstallmentFn = async () => {
    return { success: true, paymentIntentId: "pi_123" }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(data.plans[0].failedPaymentAttempts, 0)
})

test("handles chargeInstallment throw by marking payment failed and incrementing attempts", async () => {
  const plan = buildPlan({
    overrides: {
      failedPaymentAttempts: 1,
    },
  })
  const { prismaClient, data } = createMockPrisma({ plans: [plan] })
  const chargeInstallmentFn = async () => {
    throw new Error("network error")
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(data.payments.length, 1)
  assert.equal(data.payments[0].status, "FAILED")
  assert.equal(data.payments[0].failureMessage, "network error")
  assert.equal(data.plans[0].failedPaymentAttempts, 2)
})

test("uses user stripeCustomerId when plan is missing processorCustomerId", async () => {
  const plan = buildPlan({
    overrides: {
      processorCustomerId: null,
    },
  })
  const users = [{ id: plan.userId, stripeCustomerId: "cus_from_user" }]
  const { prismaClient, data } = createMockPrisma({ plans: [plan], users })

  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return { success: true, paymentIntentId: "pi_123" }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(chargeInstallmentCalls.length, 1)
  assert.equal(chargeInstallmentCalls[0].customerId, "cus_from_user")
  assert.equal(data.plans[0].processorCustomerId, "cus_from_user")
})

test("skips due installments for unsupported processor and logs warning", async () => {
  const plan = buildPlan({
    overrides: {
      processor: "PAYPAL",
    },
  })
  const { prismaClient, data } = createMockPrisma({ plans: [plan] })
  const { logger, entries } = createMockLogger()
  const chargeInstallmentFn = async () => {
    return { success: true, paymentIntentId: "pi_should_not_happen" }
  }

  const result = await chargeFinancingPlans({
    logger,
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(result.success, true)
  assert.equal(data.payments.length, 0)
  assert.equal(entries.warn.length, 1)
  assert.equal(data.jobRuns[0].summary.skippedInstallments, 1)
})

test("does not double-charge an installment if any succeeded payment exists for that due date", async () => {
  const plan = buildPlan({
    overrides: {
      remainingBalanceCents: 5000,
    },
  })
  const succeededPayment = {
    id: "payment_succeeded",
    planId: plan.id,
    type: "INSTALLMENT",
    status: "SUCCEEDED",
    amountCents: 5000,
    currency: "usd",
    scheduledFor: new Date("2026-01-10T00:00:00Z"),
    createdAt: new Date("2026-01-11T00:00:00Z"),
  }
  const failedLaterPayment = {
    id: "payment_failed_later",
    planId: plan.id,
    type: "INSTALLMENT",
    status: "FAILED",
    amountCents: 5000,
    currency: "usd",
    scheduledFor: new Date("2026-01-10T00:00:00Z"),
    createdAt: new Date("2026-01-12T00:00:00Z"),
  }
  const { prismaClient, data } = createMockPrisma({
    plans: [plan],
    payments: [failedLaterPayment, succeededPayment],
  })

  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return { success: true, paymentIntentId: "pi_should_not_happen" }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(chargeInstallmentCalls.length, 0)
  assert.equal(data.payments.length, 2)
})

test("skips charging when any pending payment exists for due date (even if a newer failed exists)", async () => {
  const plan = buildPlan({
    overrides: {
      remainingBalanceCents: 5000,
    },
  })
  const dueDate = new Date("2026-01-10T00:00:00Z")

  const olderPendingPayment = {
    id: "payment_pending_old",
    planId: plan.id,
    type: "INSTALLMENT",
    status: "PENDING",
    amountCents: 5000,
    currency: "usd",
    scheduledFor: dueDate,
    createdAt: new Date("2026-01-11T00:00:00Z"),
  }
  const newerFailedPayment = {
    id: "payment_failed_newer",
    planId: plan.id,
    type: "INSTALLMENT",
    status: "FAILED",
    amountCents: 5000,
    currency: "usd",
    scheduledFor: dueDate,
    createdAt: new Date("2026-01-12T00:00:00Z"),
  }

  const { prismaClient, data } = createMockPrisma({
    plans: [plan],
    payments: [newerFailedPayment, olderPendingPayment],
  })

  const chargeInstallmentCalls = []
  const chargeInstallmentFn = async (input) => {
    chargeInstallmentCalls.push(input)
    return { success: true, paymentIntentId: "pi_should_not_happen" }
  }

  await chargeFinancingPlans({
    prismaClient,
    chargeInstallmentFn,
    now: new Date("2026-01-15T00:00:00Z"),
  })

  assert.equal(chargeInstallmentCalls.length, 0)
  assert.equal(data.payments.length, 2)
  assert.equal(data.plans[0].remainingBalanceCents, 5000)
  assert.equal(
    data.plans[0].nextPaymentDate.toISOString(),
    "2026-01-10T00:00:00.000Z"
  )
})
