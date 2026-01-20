"use client"

import { createContext, useCallback, useContext } from "react"
import {
  fetchRefunds as fetchRefundsGateway,
  fetchRefundById as fetchRefundByIdGateway,
  approveRefund as approveRefundGateway,
  denyRefund as denyRefundGateway,
} from "@/gateways/refundsGateway"

const RefundsContext = createContext(undefined)

export function RefundsProvider({ children }) {
  const fetchRefunds = useCallback(
    async ({ status, limit, offset, userId } = {}) => {
      return fetchRefundsGateway({ status, limit, offset, userId })
    },
    []
  )

  const fetchRefundById = useCallback(async (refundId) => {
    return fetchRefundByIdGateway(refundId)
  }, [])

  const approveRefund = useCallback(
    async ({ refundId, amountCents, adminMessage }) => {
      return approveRefundGateway({ refundId, amountCents, adminMessage })
    },
    []
  )

  const denyRefund = useCallback(async ({ refundId, adminMessage }) => {
    return denyRefundGateway({ refundId, adminMessage })
  }, [])

  const value = {
    fetchRefunds,
    fetchRefundById,
    approveRefund,
    denyRefund,
  }

  return (
    <RefundsContext.Provider value={value}>{children}</RefundsContext.Provider>
  )
}

export function useRefunds() {
  const context = useContext(RefundsContext)
  if (context === undefined) {
    throw new Error("useRefunds must be used within a RefundsProvider")
  }
  return context
}
