"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { formatMoney } from "@ballast/shared/src/money.js"
import { fetchSubscription } from "@/gateways/subscriptionsGateway"
import {
  FinancingDetailCard as SubscriptionDetailCard,
  FinancingDetailRow as SubscriptionDetailRow,
  FinancingDetailLabel as SubscriptionDetailLabel,
  FinancingDetailValue as SubscriptionDetailValue,
  OrderIdLink as AccountLink,
  EmptyState,
} from "@/components/account/accountStyles"
import {
  ContentOrderedList,
  ContentOrderedListItem,
} from "@/components/ui/uiStyles"

const getIntervalMonths = (interval) => {
  if (interval === "MONTHLY") {
    return 1
  }
  if (interval === "QUARTERLY") {
    return 3
  }
  if (interval === "SEMI_ANNUAL") {
    return 6
  }
  if (interval === "ANNUAL") {
    return 12
  }
  return null
}

const daysInMonthUtc = (year, monthIndexZeroBased) => {
  return new Date(Date.UTC(year, monthIndexZeroBased + 1, 0)).getUTCDate()
}

const addMonthsClampedUtc = (date, monthsToAdd) => {
  const startYear = date.getUTCFullYear()
  const startMonth = date.getUTCMonth()
  const startDay = date.getUTCDate()

  const startHours = date.getUTCHours()
  const startMinutes = date.getUTCMinutes()
  const startSeconds = date.getUTCSeconds()
  const startMs = date.getUTCMilliseconds()

  const totalMonths = startMonth + monthsToAdd
  const targetYear = startYear + Math.floor(totalMonths / 12)
  const targetMonth = ((totalMonths % 12) + 12) % 12

  const maxDay = daysInMonthUtc(targetYear, targetMonth)
  const targetDay = Math.min(startDay, maxDay)

  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      targetDay,
      startHours,
      startMinutes,
      startSeconds,
      startMs
    )
  )
}

export default function SubscriptionDetail({ subscriptionId }) {
  const [subscription, setSubscription] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSubscription = useCallback(async () => {
    if (!subscriptionId) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchSubscription(subscriptionId)
      setSubscription(data.subscription)
    } catch (loadError) {
      setError(loadError.message)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [subscriptionId])

  useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  const upcomingSchedule = useMemo(() => {
    if (!subscription?.nextChargeDate) {
      return []
    }

    const months = getIntervalMonths(subscription.interval)
    if (!months) {
      return []
    }

    const first = new Date(subscription.nextChargeDate)
    if (Number.isNaN(first.getTime())) {
      return []
    }

    const dates = []
    let current = first
    for (let index = 0; index < 6; index += 1) {
      dates.push(new Date(current))
      current = addMonthsClampedUtc(current, months)
    }

    return dates
  }, [subscription?.interval, subscription?.nextChargeDate])

  if (isLoading) {
    return <p>Loading subscription...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!subscription) {
    return (
      <EmptyState>
        <p>Subscription not found.</p>
      </EmptyState>
    )
  }

  let serviceHref = null
  if (subscription.service?.slug) {
    serviceHref = `/services/${subscription.service.slug}`
  }

  let scheduleContent = <p>No schedule available.</p>
  if (upcomingSchedule.length > 0) {
    scheduleContent = (
      <ContentOrderedList>
        {upcomingSchedule.map((date) => (
          <ContentOrderedListItem key={date.toISOString()}>
            {date.toLocaleDateString()} · {formatMoney(subscription.priceCents)}
          </ContentOrderedListItem>
        ))}
      </ContentOrderedList>
    )
  }

  let paymentsContent = <p>No payments recorded.</p>
  if (
    Array.isArray(subscription.payments) &&
    subscription.payments.length > 0
  ) {
    paymentsContent = (
      <ContentOrderedList>
        {subscription.payments.map((payment) => {
          let paidAtLabel = "—"
          if (payment.paidAt) {
            paidAtLabel = new Date(payment.paidAt).toLocaleDateString()
          }
          return (
            <ContentOrderedListItem key={payment.id}>
              {payment.status} · {paidAtLabel} ·{" "}
              {formatMoney(payment.amountCents)}
            </ContentOrderedListItem>
          )
        })}
      </ContentOrderedList>
    )
  }

  let nextChargeLabel = "—"
  if (subscription.nextChargeDate) {
    nextChargeLabel = new Date(subscription.nextChargeDate).toLocaleDateString()
  }

  return (
    <>
      <SubscriptionDetailCard>
        <SubscriptionDetailRow>
          <SubscriptionDetailLabel>Status</SubscriptionDetailLabel>
          <SubscriptionDetailValue>
            {subscription.status}
          </SubscriptionDetailValue>
        </SubscriptionDetailRow>
        <SubscriptionDetailRow>
          <SubscriptionDetailLabel>Service</SubscriptionDetailLabel>
          <SubscriptionDetailValue>
            {serviceHref && (
              <AccountLink as={Link} href={serviceHref}>
                {subscription.service?.name}
              </AccountLink>
            )}
            {!serviceHref && (subscription.service?.name || "—")}
          </SubscriptionDetailValue>
        </SubscriptionDetailRow>
        <SubscriptionDetailRow>
          <SubscriptionDetailLabel>Interval</SubscriptionDetailLabel>
          <SubscriptionDetailValue>
            {subscription.interval}
          </SubscriptionDetailValue>
        </SubscriptionDetailRow>
        <SubscriptionDetailRow>
          <SubscriptionDetailLabel>Price</SubscriptionDetailLabel>
          <SubscriptionDetailValue>
            {formatMoney(subscription.priceCents)}
          </SubscriptionDetailValue>
        </SubscriptionDetailRow>
        <SubscriptionDetailRow>
          <SubscriptionDetailLabel>Next charge</SubscriptionDetailLabel>
          <SubscriptionDetailValue>{nextChargeLabel}</SubscriptionDetailValue>
        </SubscriptionDetailRow>
      </SubscriptionDetailCard>

      <SubscriptionDetailCard>
        <h3>Upcoming renewals</h3>
        {scheduleContent}
      </SubscriptionDetailCard>

      <SubscriptionDetailCard>
        <h3>Payments</h3>
        {paymentsContent}
      </SubscriptionDetailCard>
    </>
  )
}
