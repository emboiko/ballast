"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatMoney } from "@ballast/shared/src/money.js"
import { fetchSubscriptions } from "@/gateways/subscriptionsGateway"
import {
  FinancingList as SubscriptionsListContainer,
  FinancingCard as SubscriptionCard,
  FinancingHeader as SubscriptionHeader,
  FinancingTitle as SubscriptionTitle,
  FinancingStatus as SubscriptionStatus,
  FinancingRow as SubscriptionRow,
  FinancingValue as SubscriptionValue,
  EmptyState,
} from "@/components/account/accountStyles"

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchSubscriptions()
        setSubscriptions(
          Array.isArray(data.subscriptions) ? data.subscriptions : []
        )
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscriptions()
  }, [])

  if (isLoading) {
    return <p>Loading subscriptions...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (subscriptions.length === 0) {
    return (
      <EmptyState>
        <p>No subscriptions found.</p>
      </EmptyState>
    )
  }

  const getNextChargeLabel = (subscription) => {
    let nextChargeLabel = "—"
    if (subscription.nextChargeDate) {
      nextChargeLabel = new Date(
        subscription.nextChargeDate
      ).toLocaleDateString()
    }
    return nextChargeLabel
  }

  return (
    <SubscriptionsListContainer>
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id}>
          <SubscriptionHeader>
            <SubscriptionTitle
              as={Link}
              href={`/account/subscriptions/${subscription.id}`}
            >
              {subscription.service?.name || "Subscription"} ·{" "}
              {subscription.interval}
            </SubscriptionTitle>
            <SubscriptionStatus $status={subscription.status}>
              {subscription.status}
            </SubscriptionStatus>
          </SubscriptionHeader>
          <SubscriptionRow>
            <span>Price</span>
            <SubscriptionValue>
              {formatMoney(subscription.priceCents)}
            </SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <span>Next charge</span>
            <SubscriptionValue>
              {getNextChargeLabel(subscription)}
            </SubscriptionValue>
          </SubscriptionRow>
        </SubscriptionCard>
      ))}
    </SubscriptionsListContainer>
  )
}
