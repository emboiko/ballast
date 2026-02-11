"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useAuth } from "@/contexts/AuthContext"
import { fetchSubscriptions as fetchSubscriptionsGateway } from "@/gateways/subscriptionsGateway"

const SubscriptionsContext = createContext(undefined)

export function SubscriptionsProvider({ children }) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false)
  const [subscriptionsError, setSubscriptionsError] = useState(null)

  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([])
      setSubscriptionsError(null)
      return { success: true, subscriptions: [] }
    }

    try {
      setIsLoadingSubscriptions(true)
      setSubscriptionsError(null)
      const data = await fetchSubscriptionsGateway()
      const items = Array.isArray(data.subscriptions) ? data.subscriptions : []
      setSubscriptions(items)
      return { success: true, subscriptions: items }
    } catch (error) {
      setSubscriptionsError(error.message)
      return { success: false, error: error.message }
    } finally {
      setIsLoadingSubscriptions(false)
    }
  }, [user])

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!user) {
      setSubscriptions([])
      setSubscriptionsError(null)
      return
    }

    fetchSubscriptions().catch(() => {})
  }, [fetchSubscriptions, isAuthLoading, user])

  const getActiveSubscriptionForServiceId = useCallback(
    (serviceId) => {
      if (!serviceId) {
        return null
      }
      return (
        subscriptions.find(
          (subscription) =>
            subscription.status === "ACTIVE" &&
            subscription.serviceId === serviceId
        ) || null
      )
    },
    [subscriptions]
  )

  const value = useMemo(() => {
    return {
      subscriptions,
      isLoadingSubscriptions,
      subscriptionsError,
      fetchSubscriptions,
      getActiveSubscriptionForServiceId,
    }
  }, [
    subscriptions,
    isLoadingSubscriptions,
    subscriptionsError,
    fetchSubscriptions,
    getActiveSubscriptionForServiceId,
  ])

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext)
  if (context === undefined) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider"
    )
  }
  return context
}
