import prisma from "../../../../packages/shared/src/db/client.js"
import {
  formatMoney,
  percentOfMoney,
} from "../../../../packages/shared/src/money.js"
import {
  getOrCreateCustomer,
  createPaymentIntent,
  getPaymentIntentSummary,
} from "../gateways/stripeGateway.js"

const DOWN_PAYMENT_PERCENT = 20
const MAX_TERM_COUNT = 60
const MIN_PRINCIPAL_PAYMENT_CENTS = 500

const normalizeCadence = (cadence) => {
  if (typeof cadence !== "string") {
    return null
  }

  const normalized = cadence.trim().toUpperCase()
  if (normalized !== "WEEKLY" && normalized !== "MONTHLY") {
    return null
  }

  return normalized
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const addMonths = (date, months) => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

const calculateCartTotalCents = (cartItems) => {
  if (!Array.isArray(cartItems)) {
    return 0
  }

  return cartItems.reduce((sum, item) => {
    const priceCents =
      typeof item.priceCents === "number" ? item.priceCents : 0
    const quantity = typeof item.quantity === "number" ? item.quantity : 1
    return sum + priceCents * Math.max(quantity, 1)
  }, 0)
}

const calculateFeesTotalCents = (fees) => {
  if (!Array.isArray(fees)) {
    return 0
  }

  return fees.reduce((sum, fee) => {
    const amountCents = typeof fee.amountCents === "number" ? fee.amountCents : 0
    return sum + amountCents
  }, 0)
}

const buildInstallmentSchedule = ({
  financedAmountCents,
  termCount,
  cadence,
  startDate,
}) => {
  const baseAmount = Math.floor(financedAmountCents / termCount)
  const remainder = financedAmountCents - baseAmount * termCount
  const installments = []

  for (let installmentIndex = 0; installmentIndex < termCount; installmentIndex += 1) {
    const amountCents =
      baseAmount + (installmentIndex < remainder ? 1 : 0)
    let dueDate = null

    if (cadence === "WEEKLY") {
      dueDate = addDays(startDate, 7 * (installmentIndex + 1))
    } else {
      dueDate = addMonths(startDate, installmentIndex + 1)
    }

    installments.push({
      sequence: installmentIndex + 1,
      amountCents,
      dueDate: dueDate.toISOString(),
    })
  }

  return installments
}

const buildContractHtml = ({ plan, user, order, schedule }) => {
  const userName = user?.fullName || "Customer"
  const userEmail = user?.email || "N/A"
  const contractDate = new Date().toLocaleDateString("en-US")
  const cadenceLabel = plan.cadence === "WEEKLY" ? "Weekly" : "Monthly"
  const scheduleSummary = schedule
    .map((installment) => {
      const formattedDate = new Date(installment.dueDate).toLocaleDateString(
        "en-US"
      )
      return `<li>${formattedDate}: ${formatMoney(installment.amountCents)}</li>`
    })
    .join("")

  return `
    <section>
      <h1>Financing Agreement</h1>
      <p>Date: ${contractDate}</p>
      <p>Customer: ${userName}</p>
      <p>Email: ${userEmail}</p>
      <p>Order ID: ${order?.id || "N/A"}</p>
    </section>
    <section>
      <h2>Plan Overview</h2>
      <p>Total Amount: ${formatMoney(plan.totalAmountCents)}</p>
      <p>Down Payment: ${formatMoney(plan.downPaymentCents)}</p>
      <p>Financed Amount: ${formatMoney(plan.financedAmountCents)}</p>
      <p>Term: ${plan.termCount} payments (${cadenceLabel})</p>
      <p>Installment Amount: ${formatMoney(plan.installmentAmountCents)}</p>
    </section>
    <section>
      <h2>Payment Schedule</h2>
      <ol>
        ${scheduleSummary}
      </ol>
    </section>
  `
}

export const createFinancingPlanFromCheckout = async ({
  userId,
  paymentIntentId,
  cartItems,
  fees,
  cadence,
  termCount,
}) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  if (typeof paymentIntentId !== "string" || !paymentIntentId.trim()) {
    return { success: false, error: "Payment intent ID is required" }
  }

  const normalizedCadence = normalizeCadence(cadence)
  if (!normalizedCadence) {
    return { success: false, error: "Cadence must be weekly or monthly" }
  }

  if (!Number.isInteger(termCount) || termCount < 1 || termCount > MAX_TERM_COUNT) {
    return { success: false, error: "Invalid term count" }
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { success: false, error: "Cart items are required" }
  }

  const cartTotalCents = calculateCartTotalCents(cartItems)
  const feesTotalCents = calculateFeesTotalCents(fees)
  const totalAmountCents = cartTotalCents + feesTotalCents
  if (totalAmountCents <= 0) {
    return { success: false, error: "Cart total must be greater than zero" }
  }

  const downPaymentCents = percentOfMoney(totalAmountCents, DOWN_PAYMENT_PERCENT)
  const financedAmountCents = totalAmountCents - downPaymentCents

  if (downPaymentCents <= 0) {
    return { success: false, error: "Down payment must be greater than zero" }
  }

  if (financedAmountCents <= 0) {
    return { success: false, error: "Financed amount must be greater than zero" }
  }

  const installments = buildInstallmentSchedule({
    financedAmountCents,
    termCount,
    cadence: normalizedCadence,
    startDate: new Date(),
  })

  const installmentAmountCents = installments[0]?.amountCents ?? financedAmountCents
  const nextPaymentDate = installments[0]
    ? new Date(installments[0].dueDate)
    : null

  const { paymentIntent, paymentMethodId, paymentMethodDetails } =
    await getPaymentIntentSummary(paymentIntentId)

  if (paymentIntent.status !== "succeeded") {
    return { success: false, error: "Payment intent has not succeeded" }
  }

  if (paymentIntent.amount !== downPaymentCents) {
    return {
      success: false,
      error: "Down payment amount does not match the financing plan",
    }
  }

  if (!paymentMethodId) {
    return {
      success: false,
      error: "Payment method is required for financing plans",
    }
  }

  let paymentCustomerId = null
  if (typeof paymentIntent.customer === "string") {
    paymentCustomerId = paymentIntent.customer
  } else if (paymentIntent.customer?.id) {
    paymentCustomerId = paymentIntent.customer.id
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      stripeCustomerId: true,
    },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  const existingOrder = await prisma.order.findUnique({
    where: { processorPaymentId: paymentIntentId },
    include: { items: true },
  })

  let order = existingOrder
  if (!order) {
    order = await prisma.order.create({
      data: {
        userId,
        processor: "STRIPE",
        processorPaymentId: paymentIntentId,
        amountCents: totalAmountCents,
        currency: paymentIntent.currency || "usd",
        status: "financing",
        items: {
          create: cartItems.map((item) => ({
            itemId: item.id,
            name: item.name,
            priceCents: item.priceCents,
            quantity: item.quantity || 1,
            type: item.type || (item.id === "demo-service" ? "service" : "item"),
          })),
        },
      },
    })
  }

  if (order.userId !== userId) {
    return { success: false, error: "Order does not belong to user" }
  }

  const existingPlan = await prisma.financingPlan.findFirst({
    where: { orderId: order.id },
  })

  if (existingPlan) {
    return {
      success: true,
      plan: existingPlan,
      order,
    }
  }

  const plan = await prisma.financingPlan.create({
    data: {
      userId,
      orderId: order.id,
      processor: "STRIPE",
      processorPaymentMethodId: paymentMethodId,
      processorCustomerId: paymentCustomerId || user.stripeCustomerId,
      processorPaymentMethod: paymentMethodDetails,
      totalAmountCents,
      downPaymentCents,
      financedAmountCents,
      remainingBalanceCents: financedAmountCents,
      installmentAmountCents,
      termCount,
      cadence: normalizedCadence,
      scheduleJson: {
        cadence: normalizedCadence,
        termCount,
        downPaymentCents,
        installments,
      },
      nextPaymentDate,
      status: "ACTIVE",
    },
  })

  await prisma.financingPayment.create({
    data: {
      planId: plan.id,
      type: "INSTALLMENT",
      status: "SUCCEEDED",
      amountCents: downPaymentCents,
      currency: paymentIntent.currency || "usd",
      paidAt: new Date(),
      processorPaymentId: paymentIntentId,
    },
  })

  const contractHtml = buildContractHtml({
    plan,
    user,
    order,
    schedule: installments,
  })

  await prisma.financingContract.create({
    data: {
      planId: plan.id,
      version: 1,
      html: contractHtml,
      createdBy: userId,
    },
  })

  return {
    success: true,
    plan,
    order,
  }
}

export const listFinancingPlans = async (userId) => {
  const plans = await prisma.financingPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalAmountCents: true,
      remainingBalanceCents: true,
      installmentAmountCents: true,
      cadence: true,
      nextPaymentDate: true,
      createdAt: true,
    },
  })

  return { plans }
}

export const getFinancingPlan = async (userId, planId) => {
  const plan = await prisma.financingPlan.findFirst({
    where: { id: planId, userId },
    include: {
      payments: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" }, take: 1 },
      order: {
        include: {
          items: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  })

  if (!plan) {
    return { error: "Financing plan not found" }
  }

  const latestContract = plan.contracts?.[0] || null

  return {
    plan: {
      ...plan,
      contract: latestContract,
    },
  }
}

export const createPrincipalPaymentIntent = async ({
  userId,
  planId,
  amountCents,
}) => {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return { success: false, error: "Amount must be a positive integer" }
  }

  if (amountCents < MIN_PRINCIPAL_PAYMENT_CENTS) {
    return {
      success: false,
      error: `Minimum principal payment is ${formatMoney(
        MIN_PRINCIPAL_PAYMENT_CENTS
      )}`,
    }
  }

  const plan = await prisma.financingPlan.findFirst({
    where: { id: planId, userId },
    select: {
      id: true,
      processor: true,
      processorCustomerId: true,
      status: true,
      remainingBalanceCents: true,
    },
  })

  if (!plan) {
    return { success: false, error: "Financing plan not found" }
  }

  if (plan.status !== "ACTIVE") {
    return { success: false, error: "Plan is not active" }
  }

  if (amountCents > plan.remainingBalanceCents) {
    return { success: false, error: "Amount exceeds remaining balance" }
  }

  if (plan.processor !== "STRIPE") {
    return { success: false, error: "Unsupported payment processor" }
  }

  let customerId = plan.processorCustomerId
  if (!customerId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    if (!user?.email) {
      return { success: false, error: "User email is required" }
    }
    customerId = await getOrCreateCustomer(userId, user.email)
    await prisma.financingPlan.update({
      where: { id: plan.id },
      data: { processorCustomerId: customerId },
    })
  }

  const { clientSecret, paymentIntentId } = await createPaymentIntent(
    customerId,
    amountCents
  )

  return { success: true, clientSecret, paymentIntentId }
}

export const recordPrincipalPayment = async ({
  userId,
  planId,
  paymentIntentId,
}) => {
  if (!paymentIntentId || typeof paymentIntentId !== "string") {
    return { success: false, error: "Payment intent ID is required" }
  }

  const plan = await prisma.financingPlan.findFirst({
    where: { id: planId, userId },
  })

  if (!plan) {
    return { success: false, error: "Financing plan not found" }
  }

  if (plan.status !== "ACTIVE") {
    return { success: false, error: "Plan is not active" }
  }

  const { paymentIntent } = await getPaymentIntentSummary(paymentIntentId)

  if (paymentIntent.status !== "succeeded") {
    return { success: false, error: "Payment has not succeeded" }
  }

  const amountCents = paymentIntent.amount
  const newBalance = Math.max(plan.remainingBalanceCents - amountCents, 0)
  const updatedStatus = newBalance === 0 ? "PAID_OFF" : plan.status

  const payment = await prisma.financingPayment.create({
    data: {
      planId: plan.id,
      type: "PRINCIPAL",
      status: "SUCCEEDED",
      amountCents,
      currency: paymentIntent.currency || plan.currency,
      paidAt: new Date(),
      processorPaymentId: paymentIntentId,
    },
  })

  const updatedPlan = await prisma.financingPlan.update({
    where: { id: plan.id },
    data: {
      remainingBalanceCents: newBalance,
      status: updatedStatus,
    },
  })

  return {
    success: true,
    payment,
    plan: updatedPlan,
  }
}

