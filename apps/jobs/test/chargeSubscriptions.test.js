import assert from "node:assert/strict"
import { test } from "node:test"
import { chargeSubscriptions } from "../lib/jobs/chargeSubscriptions.js"

const createMockPrisma = ({
  subscriptions = [],
  payments = [],
  users = [],
} = {}) => {
  const jobRuns = []
  let paymentCounter = 1
  let jobRunCounter = 1

  const findSubscriptionIndexById = (subscriptionId) => {
    return subscriptions.findIndex(
      (subscription) => subscription.id === subscriptionId
    )
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
    serviceSubscription: {
      findMany: async ({ where }) => {
        return subscriptions.filter((subscription) => {
          if (where?.status && subscription.status !== where.status) {
            return false
          }
          const nextChargeFilter = where?.nextChargeDate
          if (nextChargeFilter?.lte) {
            if (!subscription.nextChargeDate) {
              return false
            }
            if (
              subscription.nextChargeDate.getTime() >
              nextChargeFilter.lte.getTime()
            ) {
              return false
            }
          }
          return true
        })
      },
      update: async ({ where, data }) => {
        const subscriptionIndex = findSubscriptionIndexById(where.id)
        if (subscriptionIndex === -1) {
          throw new Error(`Subscription ${where.id} not found`)
        }
        subscriptions[subscriptionIndex] = {
          ...subscriptions[subscriptionIndex],
          ...data,
        }
        return subscriptions[subscriptionIndex]
      },
    },
    serviceSubscriptionPayment: {
      findMany: async ({ where, orderBy }) => {
        const filtered = payments.filter((payment) => {
          if (
            where?.subscriptionId &&
            payment.subscriptionId !== where.subscriptionId
          ) {
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
      subscriptions,
      payments,
      users,
      jobRuns,
    },
  }
}

const buildSubscription = ({ overrides = {} } = {}) => {
  const base = {
    id: "sub_1",
    userId: "user_1",
    serviceId: "service_1",
    processor: "STRIPE",
    processorCustomerId: "cus_123",
    processorPaymentMethodId: "pm_123",
    currency: "usd",
    interval: "MONTHLY",
    priceCents: 1000,
    status: "ACTIVE",
    nextChargeDate: new Date("2026-01-10T00:00:00Z"),
    failedPaymentAttempts: 0,
    lastFailedChargeAt: null,
    endedAt: null,
  }

  return {
    ...base,
    ...overrides,
  }
}

test("charges due renewal and advances nextChargeDate (month clamping)", async () => {
  const subscription = buildSubscription({
    overrides: {
      interval: "MONTHLY",
      nextChargeDate: new Date("2026-01-31T00:00:00Z"),
      failedPaymentAttempts: 2,
    },
  })
  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
  })
  const chargeCalls = []
  const chargeRenewalFn = async (input) => {
    chargeCalls.push(input)
    return { success: true, paymentIntentId: "pi_123" }
  }

  const result = await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-02-01T00:00:00Z"),
  })

  assert.equal(result.success, true)
  assert.equal(chargeCalls.length, 1)
  assert.equal(data.payments.length, 1)
  assert.equal(data.payments[0].status, "SUCCEEDED")
  assert.equal(data.subscriptions[0].failedPaymentAttempts, 0)
  assert.equal(data.subscriptions[0].lastFailedChargeAt, null)
  assert.equal(
    data.subscriptions[0].nextChargeDate.toISOString(),
    "2026-02-28T00:00:00.000Z"
  )
})

test("skips renewal when latest payment is pending", async () => {
  const subscription = buildSubscription()
  const scheduledFor = new Date(subscription.nextChargeDate)
  const existingPendingPayment = {
    id: "payment_1",
    subscriptionId: subscription.id,
    status: "PENDING",
    amountCents: subscription.priceCents,
    currency: "usd",
    scheduledFor,
    createdAt: new Date("2026-01-10T01:00:00Z"),
  }

  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
    payments: [existingPendingPayment],
  })

  const chargeCalls = []
  const chargeRenewalFn = async (input) => {
    chargeCalls.push(input)
    return { success: true, paymentIntentId: "pi_ignored" }
  }

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-10T10:00:00Z"),
  })

  assert.equal(chargeCalls.length, 0)
  assert.equal(data.payments.length, 1)
  assert.equal(data.payments[0].status, "PENDING")
})

test("retries renewal over three consecutive days then defaults", async () => {
  const subscription = buildSubscription({
    overrides: {
      nextChargeDate: new Date("2026-01-10T00:00:00Z"),
    },
  })
  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
  })

  const chargeRenewalFn = async () => {
    return { success: false, error: "card declined" }
  }

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-10T09:00:00Z"),
  })
  assert.equal(data.subscriptions[0].status, "ACTIVE")
  assert.equal(data.subscriptions[0].failedPaymentAttempts, 1)

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-11T09:00:00Z"),
  })
  assert.equal(data.subscriptions[0].status, "ACTIVE")
  assert.equal(data.subscriptions[0].failedPaymentAttempts, 2)

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-12T09:00:00Z"),
  })
  assert.equal(data.subscriptions[0].status, "DEFAULTED")
  assert.equal(data.subscriptions[0].failedPaymentAttempts, 3)
  assert.equal(data.subscriptions[0].nextChargeDate, null)
  assert.ok(data.subscriptions[0].endedAt instanceof Date)
  assert.equal(data.payments.length, 3)
})

test("does not attempt renewal twice on the same day", async () => {
  const subscription = buildSubscription()
  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
  })
  let callCount = 0
  const chargeRenewalFn = async () => {
    callCount += 1
    return { success: false, error: "card declined" }
  }

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-10T09:00:00Z"),
  })
  assert.equal(callCount, 1)

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-10T18:00:00Z"),
  })
  assert.equal(callCount, 1)
  assert.equal(data.payments.length, 1)
})

test("does not double-charge when any succeeded payment exists for scheduledFor", async () => {
  const subscription = buildSubscription({
    overrides: {
      failedPaymentAttempts: 2,
    },
  })
  const scheduledFor = new Date(subscription.nextChargeDate)
  const succeededPayment = {
    id: "payment_succeeded",
    subscriptionId: subscription.id,
    status: "SUCCEEDED",
    amountCents: subscription.priceCents,
    currency: "usd",
    scheduledFor,
    createdAt: new Date("2026-01-10T01:00:00Z"),
  }
  const failedLaterPayment = {
    id: "payment_failed_later",
    subscriptionId: subscription.id,
    status: "FAILED",
    amountCents: subscription.priceCents,
    currency: "usd",
    scheduledFor,
    createdAt: new Date("2026-01-10T02:00:00Z"),
  }

  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
    payments: [failedLaterPayment, succeededPayment],
  })

  const chargeCalls = []
  const chargeRenewalFn = async (input) => {
    chargeCalls.push(input)
    return { success: true, paymentIntentId: "pi_should_not_happen" }
  }

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-10T09:00:00Z"),
  })

  assert.equal(chargeCalls.length, 0)
  assert.equal(data.subscriptions[0].failedPaymentAttempts, 0)
  assert.equal(
    data.subscriptions[0].nextChargeDate.toISOString(),
    "2026-02-10T00:00:00.000Z"
  )
})

test("charges only one period per run even if nextChargeDate is far behind", async () => {
  const subscription = buildSubscription({
    overrides: {
      interval: "MONTHLY",
      nextChargeDate: new Date("2026-01-01T00:00:00Z"),
    },
  })
  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
  })
  const chargeCalls = []
  const chargeRenewalFn = async (input) => {
    chargeCalls.push(input)
    return { success: true, paymentIntentId: "pi_123" }
  }

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-03-01T00:00:00Z"),
  })

  assert.equal(chargeCalls.length, 1)
  assert.equal(
    data.subscriptions[0].nextChargeDate.toISOString(),
    "2026-02-01T00:00:00.000Z"
  )
})

test("skips charging when any pending payment exists for scheduledFor (even if a newer failed exists)", async () => {
  const subscription = buildSubscription({
    overrides: {
      failedPaymentAttempts: 2,
      lastFailedChargeAt: null,
    },
  })
  const scheduledFor = new Date(subscription.nextChargeDate)

  const olderPendingPayment = {
    id: "payment_pending_old",
    subscriptionId: subscription.id,
    status: "PENDING",
    amountCents: subscription.priceCents,
    currency: "usd",
    scheduledFor,
    createdAt: new Date("2026-01-10T01:00:00Z"),
  }
  const newerFailedPayment = {
    id: "payment_failed_newer",
    subscriptionId: subscription.id,
    status: "FAILED",
    amountCents: subscription.priceCents,
    currency: "usd",
    scheduledFor,
    createdAt: new Date("2026-01-10T02:00:00Z"),
  }

  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
    payments: [newerFailedPayment, olderPendingPayment],
  })

  const chargeCalls = []
  const chargeRenewalFn = async (input) => {
    chargeCalls.push(input)
    return { success: true, paymentIntentId: "pi_should_not_happen" }
  }

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-10T09:00:00Z"),
  })

  assert.equal(chargeCalls.length, 0)
  assert.equal(data.payments.length, 2)
  assert.equal(data.subscriptions[0].failedPaymentAttempts, 2)
  assert.equal(
    data.subscriptions[0].nextChargeDate.toISOString(),
    "2026-01-10T00:00:00.000Z"
  )
})

test("skips charging when priceCents is invalid", async () => {
  const subscription = buildSubscription({
    overrides: {
      priceCents: 0,
    },
  })
  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
  })

  const chargeCalls = []
  const chargeRenewalFn = async (input) => {
    chargeCalls.push(input)
    return { success: true, paymentIntentId: "pi_should_not_happen" }
  }

  const result = await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-01-10T09:00:00Z"),
  })

  assert.equal(result.success, true)
  assert.equal(chargeCalls.length, 0)
  assert.equal(data.payments.length, 0)
  assert.equal(data.jobRuns[0].summary.skippedCharges, 1)
})

test("advances nextChargeDate correctly for quarterly cadence (month clamping)", async () => {
  const subscription = buildSubscription({
    overrides: {
      interval: "QUARTERLY",
      nextChargeDate: new Date("2026-01-31T00:00:00Z"),
    },
  })
  const { prismaClient, data } = createMockPrisma({
    subscriptions: [subscription],
  })
  const chargeRenewalFn = async () => {
    return { success: true, paymentIntentId: "pi_123" }
  }

  await chargeSubscriptions({
    prismaClient,
    chargeRenewalFn,
    now: new Date("2026-02-01T00:00:00Z"),
  })

  assert.equal(
    data.subscriptions[0].nextChargeDate.toISOString(),
    "2026-04-30T00:00:00.000Z"
  )
})
