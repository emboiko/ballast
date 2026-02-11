import assert from "node:assert/strict"
import { test } from "node:test"
import { sendUpcomingChargeReminders } from "../lib/jobs/sendUpcomingChargeReminders.js"

const createMockPrisma = ({ subscriptions = [], plans = [] } = {}) => {
  const jobRuns = []
  let jobRunCounter = 1

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
      findMany: async ({ where, orderBy, select }) => {
        const filtered = subscriptions.filter((subscription) => {
          if (where?.status && subscription.status !== where.status) {
            return false
          }

          const dateFilter = where?.nextChargeDate
          if (dateFilter?.gte) {
            if (!subscription.nextChargeDate) {
              return false
            }
            if (subscription.nextChargeDate.getTime() < dateFilter.gte.getTime()) {
              return false
            }
          }
          if (dateFilter?.lt) {
            if (!subscription.nextChargeDate) {
              return false
            }
            if (subscription.nextChargeDate.getTime() >= dateFilter.lt.getTime()) {
              return false
            }
          }

          return true
        })

        if (orderBy?.nextChargeDate === "asc") {
          filtered.sort(
            (a, b) => a.nextChargeDate.getTime() - b.nextChargeDate.getTime()
          )
        }

        if (select) {
          return filtered.map((row) => {
            const result = {}
            for (const key of Object.keys(select)) {
              if (select[key] === true) {
                result[key] = row[key]
              }
            }
            return result
          })
        }

        return filtered
      },
    },
    financingPlan: {
      findMany: async ({ where, orderBy, select }) => {
        const filtered = plans.filter((plan) => {
          if (where?.status && plan.status !== where.status) {
            return false
          }

          const dateFilter = where?.nextPaymentDate
          if (dateFilter?.gte) {
            if (!plan.nextPaymentDate) {
              return false
            }
            if (plan.nextPaymentDate.getTime() < dateFilter.gte.getTime()) {
              return false
            }
          }
          if (dateFilter?.lt) {
            if (!plan.nextPaymentDate) {
              return false
            }
            if (plan.nextPaymentDate.getTime() >= dateFilter.lt.getTime()) {
              return false
            }
          }

          return true
        })

        if (orderBy?.nextPaymentDate === "asc") {
          filtered.sort(
            (a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime()
          )
        }

        if (select) {
          return filtered.map((row) => {
            const result = {}
            for (const key of Object.keys(select)) {
              if (select[key] === true) {
                result[key] = row[key]
              }
            }
            return result
          })
        }

        return filtered
      },
    },
  }

  return { prismaClient, data: { jobRuns } }
}

test("selects upcoming charges due on UTC day + daysBefore and calls internal API", async () => {
  const now = new Date("2026-02-10T12:00:00.000Z")
  const daysBefore = 3
  const targetDayStart = new Date("2026-02-13T00:00:00.000Z")
  const targetDayLater = new Date("2026-02-13T23:59:59.000Z")
  const outsideDay = new Date("2026-02-14T00:00:00.000Z")

  const subscriptions = [
    {
      id: "sub_due",
      status: "ACTIVE",
      nextChargeDate: targetDayStart,
    },
    {
      id: "sub_not_due",
      status: "ACTIVE",
      nextChargeDate: outsideDay,
    },
  ]

  const plans = [
    {
      id: "plan_due",
      status: "ACTIVE",
      nextPaymentDate: targetDayLater,
    },
    {
      id: "plan_not_due",
      status: "ACTIVE",
      nextPaymentDate: outsideDay,
    },
  ]

  const { prismaClient, data } = createMockPrisma({ subscriptions, plans })

  const calls = []
  const postInternalApiFn = async ({ route, body }) => {
    calls.push({ route, body })

    if (route.includes("/subscriptions/")) {
      return { success: true, data: { sent: true } }
    }

    return { success: true, data: { sent: false } }
  }

  const result = await sendUpcomingChargeReminders({
    prismaClient,
    postInternalApiFn,
    now,
    daysBefore,
  })

  assert.equal(result.success, true)
  assert.equal(calls.length, 2)
  assert.equal(calls[0].route, "/internal/notifications/subscriptions/upcoming-charge")
  assert.equal(calls[0].body.subscriptionId, "sub_due")
  assert.equal(calls[0].body.scheduledFor, targetDayStart.toISOString())
  assert.equal(calls[0].body.daysBefore, 3)

  assert.equal(calls[1].route, "/internal/notifications/financing/upcoming-charge")
  assert.equal(calls[1].body.planId, "plan_due")
  assert.equal(calls[1].body.dueDate, targetDayLater.toISOString())
  assert.equal(calls[1].body.daysBefore, 3)

  assert.equal(data.jobRuns.length, 1)
  assert.equal(data.jobRuns[0].status, "COMPLETED")
  assert.equal(data.jobRuns[0].summary.sent, 1)
  assert.equal(data.jobRuns[0].summary.skipped, 1)
})

