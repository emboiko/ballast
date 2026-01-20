"use client"

import { createContext, useCallback, useContext } from "react"
import {
  fetchOrders as fetchOrdersGateway,
  fetchOrderById as fetchOrderByIdGateway,
  fetchOrderStats as fetchOrderStatsGateway,
  fetchOrderGrowth as fetchOrderGrowthGateway,
} from "@/gateways/ordersGateway"

const OrdersContext = createContext(undefined)

export function OrdersProvider({ children }) {
  const fetchOrders = useCallback(async ({ limit, offset, userId } = {}) => {
    return fetchOrdersGateway({ limit, offset, userId })
  }, [])

  const fetchOrderById = useCallback(async (orderId) => {
    return fetchOrderByIdGateway(orderId)
  }, [])

  const fetchOrderStats = useCallback(async ({ userId } = {}) => {
    return fetchOrderStatsGateway({ userId })
  }, [])

  const fetchOrderGrowth = useCallback(async ({ range, userId } = {}) => {
    return fetchOrderGrowthGateway({ range, userId })
  }, [])

  const value = {
    fetchOrders,
    fetchOrderById,
    fetchOrderStats,
    fetchOrderGrowth,
  }

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}
