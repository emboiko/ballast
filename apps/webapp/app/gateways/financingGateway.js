import { API_URL } from "@/constants.js"

export const createFinancingPlan = async ({
  paymentIntentId,
  cartItems,
  fees,
  cadence,
  termCount,
}) => {
  const response = await fetch(`${API_URL}/financing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      paymentIntentId,
      cartItems,
      fees,
      cadence,
      termCount,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return { success: false, error: data.error || "Failed to create plan" }
  }

  return { success: true, planId: data.planId, orderId: data.orderId }
}

export const fetchFinancingPlans = async () => {
  const response = await fetch(`${API_URL}/financing`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch financing plans")
  }

  return data
}

export const fetchFinancingPlan = async (planId) => {
  const response = await fetch(`${API_URL}/financing/${planId}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch financing plan")
  }

  return data
}

export const createPrincipalPaymentIntent = async ({ planId, amountCents }) => {
  const response = await fetch(`${API_URL}/financing/${planId}/principal-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ amountCents }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to create payment intent")
  }

  return data
}

export const recordPrincipalPayment = async ({ planId, paymentIntentId }) => {
  const response = await fetch(`${API_URL}/financing/${planId}/principal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ paymentIntentId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to record principal payment")
  }

  return data
}
