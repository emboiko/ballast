"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import SectionNav from "@/components/ui/SectionNav"
import { fetchSubscriptionById } from "@/gateways/subscriptionsGateway"
import { formatMoney } from "@ballast/shared/src/money.js"
import { formatDate } from "@/utils/date"
import {
  SubscriptionsLayout,
  SubscriptionCard,
  SubscriptionRow,
  SubscriptionLabel,
  SubscriptionValue,
  SubscriptionLink,
  SubscriptionSectionTitle,
} from "@/components/subscriptions/subscriptionsStyles"

export default function SubscriptionDetailPage() {
  const params = useParams()
  const subscriptionId = params.id
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
      const data = await fetchSubscriptionById(subscriptionId)
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

  if (isLoading) {
    return (
      <PageLayout>
        <SectionNav
          title="Subscription"
          subtitle={`Subscription ID: ${subscriptionId}`}
        />
        <p>Loading subscription...</p>
      </PageLayout>
    )
  }

  if (!subscription) {
    return (
      <PageLayout>
        <SectionNav title="Subscription" subtitle="Not found" />
        <p>{error || "Subscription not found."}</p>
      </PageLayout>
    )
  }

  let paymentsContent = <p>No payments recorded.</p>
  if (
    Array.isArray(subscription.payments) &&
    subscription.payments.length > 0
  ) {
    paymentsContent = subscription.payments.map((payment) => (
      <SubscriptionRow key={payment.id}>
        <SubscriptionLabel>{payment.status}</SubscriptionLabel>
        <SubscriptionValue>
          {formatMoney(payment.amountCents)} · {formatDate(payment.createdAt)}
        </SubscriptionValue>
      </SubscriptionRow>
    ))
  }

  let serviceLinkContent = subscription.service?.id || "—"
  if (subscription.service?.slug) {
    serviceLinkContent = (
      <SubscriptionLink
        href={`/catalog/services?slug=${subscription.service.slug}`}
      >
        {subscription.service.name || subscription.service.slug}
      </SubscriptionLink>
    )
  }

  let userContent = subscription.user?.email || "—"
  if (subscription.user?.id && subscription.user?.email) {
    userContent = (
      <SubscriptionLink href={`/users/${subscription.user.id}`}>
        {subscription.user.email}
      </SubscriptionLink>
    )
  }

  return (
    <PageLayout>
      <SectionNav
        title="Subscription"
        subtitle={`Subscription ID: ${subscriptionId}`}
      />
      <SubscriptionsLayout>
        <SubscriptionCard>
          <SubscriptionSectionTitle>
            Subscription details
          </SubscriptionSectionTitle>
          <SubscriptionRow>
            <SubscriptionLabel>User</SubscriptionLabel>
            <SubscriptionValue>{userContent}</SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <SubscriptionLabel>Status</SubscriptionLabel>
            <SubscriptionValue>{subscription.status}</SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <SubscriptionLabel>Service</SubscriptionLabel>
            <SubscriptionValue>{serviceLinkContent}</SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <SubscriptionLabel>Interval</SubscriptionLabel>
            <SubscriptionValue>{subscription.interval}</SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <SubscriptionLabel>Price</SubscriptionLabel>
            <SubscriptionValue>
              {formatMoney(subscription.priceCents)}
            </SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <SubscriptionLabel>Next charge</SubscriptionLabel>
            <SubscriptionValue>
              {formatDate(subscription.nextChargeDate)}
            </SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <SubscriptionLabel>Failed attempts</SubscriptionLabel>
            <SubscriptionValue>
              {subscription.failedPaymentAttempts}
            </SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <SubscriptionLabel>Last failed</SubscriptionLabel>
            <SubscriptionValue>
              {formatDate(subscription.lastFailedChargeAt)}
            </SubscriptionValue>
          </SubscriptionRow>
          <SubscriptionRow>
            <SubscriptionLabel>Ended at</SubscriptionLabel>
            <SubscriptionValue>
              {formatDate(subscription.endedAt)}
            </SubscriptionValue>
          </SubscriptionRow>
        </SubscriptionCard>

        <SubscriptionCard>
          <SubscriptionSectionTitle>Payments</SubscriptionSectionTitle>
          {paymentsContent}
        </SubscriptionCard>
      </SubscriptionsLayout>
    </PageLayout>
  )
}
