"use client"

import { createContext, useContext, useState, useCallback, useRef } from "react"
import {
  fetchOrders as fetchOrdersGateway,
  fetchOrder as fetchOrderGateway,
  requestRefund as requestRefundGateway,
} from "@/gateways/ordersGateway"

const OrdersContext = createContext(undefined)

const ORDERS_PAGE_SIZE = 20

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(null)
  const offsetRef = useRef(0)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    offsetRef.current = 0
    try {
      const data = await fetchOrdersGateway({
        limit: ORDERS_PAGE_SIZE,
        offset: 0,
      })
      const fetchedOrders = data.orders || []
      setOrders(fetchedOrders)
      setHasMore(data.hasMore ?? false)
      offsetRef.current = fetchedOrders.length
      return { success: true, orders: fetchedOrders }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMoreOrders = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return { success: false, error: "Cannot load more" }
    }
    setIsLoadingMore(true)
    setError(null)
    try {
      const data = await fetchOrdersGateway({
        limit: ORDERS_PAGE_SIZE,
        offset: offsetRef.current,
      })
      const fetchedOrders = data.orders || []
      setOrders((prev) => [...prev, ...fetchedOrders])
      setHasMore(data.hasMore ?? false)
      offsetRef.current += fetchedOrders.length
      return { success: true, orders: fetchedOrders }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore])

  const fetchOrder = useCallback(async (orderId) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchOrderGateway(orderId)
      return { success: true, order: data.order }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const requestRefund = useCallback(async (orderId, reason = null) => {
    setError(null)
    try {
      const result = await requestRefundGateway(orderId, reason)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const value = {
    orders,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    fetchOrders,
    loadMoreOrders,
    fetchOrder,
    requestRefund,
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
