import { API_URL } from "@/constants.js"

export const fetchRefunds = async ({ status, limit, offset, userId } = {}) => {
  const params = new URLSearchParams()

  if (typeof status === "string" && status.trim()) {
    params.append("status", status.trim())
  }
  if (typeof userId === "string" && userId.trim()) {
    params.append("userId", userId.trim())
  }
  if (typeof limit === "number") {
    params.append("limit", String(limit))
  }
  if (typeof offset === "number") {
    params.append("offset", String(offset))
  }

  const queryString = params.toString()
  const url = queryString
    ? `${API_URL}/admin/refunds?${queryString}`
    : `${API_URL}/admin/refunds`

  const response = await fetch(url, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch refunds")
  }

  return data
}

export const fetchRefundById = async (refundId) => {
  const response = await fetch(`${API_URL}/admin/refunds/${refundId}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch refund")
  }

  return data
}

export const approveRefund = async ({
  refundId,
  amountCents,
  adminMessage,
}) => {
  const response = await fetch(`${API_URL}/admin/refunds/${refundId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      amountCents,
      adminMessage: typeof adminMessage === "string" ? adminMessage : "",
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to approve refund")
  }

  return data
}

export const denyRefund = async ({ refundId, adminMessage }) => {
  const response = await fetch(`${API_URL}/admin/refunds/${refundId}/deny`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      adminMessage: typeof adminMessage === "string" ? adminMessage : "",
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to deny refund")
  }

  return data
}
