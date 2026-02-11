"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import { PageHeader, PageTitle, PageSubtitle } from "@/components/ui/uiStyles"
import { fetchSubscriptions } from "@/gateways/subscriptionsGateway"
import { fetchUserById } from "@/gateways/usersGateway"
import { formatMoney } from "@ballast/shared/src/money.js"
import { formatDate } from "@/utils/date"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import { getTrimmedSearchParamCaseInsensitive } from "@/utils/searchParams"
import {
  SubscriptionsLayout,
  SubscriptionCard,
  SubscriptionsList,
  SubscriptionRow,
  SubscriptionLabel,
  SubscriptionValue,
  SubscriptionLink,
  SubscriptionStatus,
  SubscriptionsFiltersRow,
  SubscriptionsFilterChip,
  SubscriptionsFilterCount,
} from "@/components/subscriptions/subscriptionsStyles"

const SUBSCRIPTION_STATUSES = ["ACTIVE", "CANCELED", "DEFAULTED"]

export default function SubscriptionsPage() {
  const searchParams = useSearchParams()
  const [subscriptions, setSubscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeStatusFilter, setActiveStatusFilter] = useState("ACTIVE")
  const [filteredUserEmail, setFilteredUserEmail] = useState(null)

  const normalizedUserId = useMemo(() => {
    return getTrimmedSearchParamCaseInsensitive(searchParams, "userId")
  }, [searchParams])

  const loadSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchSubscriptions({
        limit: 25,
        offset: 0,
        userId: normalizedUserId || undefined,
        status: "ALL",
      })
      setSubscriptions(
        Array.isArray(data.subscriptions) ? data.subscriptions : []
      )
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }, [normalizedUserId])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  useEffect(() => {
    const loadUserEmail = async () => {
      if (!normalizedUserId) {
        setFilteredUserEmail(null)
        return
      }
      try {
        const data = await fetchUserById(normalizedUserId)
        const email =
          data?.user && typeof data.user.email === "string"
            ? data.user.email
            : null
        setFilteredUserEmail(email)
      } catch {
        setFilteredUserEmail(null)
      }
    }

    loadUserEmail()
  }, [normalizedUserId])

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: subscriptions.length,
    }
    for (const status of SUBSCRIPTION_STATUSES) {
      counts[status] = 0
    }
    for (const subscription of subscriptions) {
      if (counts[subscription.status] !== undefined) {
        counts[subscription.status] += 1
      }
    }
    return counts
  }, [subscriptions])

  const filteredSubscriptions = useMemo(() => {
    if (activeStatusFilter === "ALL") {
      return subscriptions
    }
    return subscriptions.filter(
      (subscription) => subscription.status === activeStatusFilter
    )
  }, [activeStatusFilter, subscriptions])

  let subtitle = "Review service subscriptions."
  if (normalizedUserId) {
    if (filteredUserEmail) {
      subtitle = `Review service subscriptions for ${filteredUserEmail}.`
    } else {
      subtitle = `Review service subscriptions for user ${normalizedUserId}.`
    }
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageTitle>Subscriptions</PageTitle>
        <PageSubtitle>{subtitle}</PageSubtitle>
      </PageHeader>

      <SubscriptionsLayout>
        <SubscriptionsFiltersRow>
          <SubscriptionsFilterChip
            type="button"
            $isActive={activeStatusFilter === "ACTIVE"}
            onClick={() => setActiveStatusFilter("ACTIVE")}
          >
            {formatStatusLabel("ACTIVE")}
            <SubscriptionsFilterCount>
              ({statusCounts.ACTIVE})
            </SubscriptionsFilterCount>
          </SubscriptionsFilterChip>
          <SubscriptionsFilterChip
            type="button"
            $isActive={activeStatusFilter === "CANCELED"}
            onClick={() => setActiveStatusFilter("CANCELED")}
          >
            {formatStatusLabel("CANCELED")}
            <SubscriptionsFilterCount>
              ({statusCounts.CANCELED})
            </SubscriptionsFilterCount>
          </SubscriptionsFilterChip>
          <SubscriptionsFilterChip
            type="button"
            $isActive={activeStatusFilter === "DEFAULTED"}
            onClick={() => setActiveStatusFilter("DEFAULTED")}
          >
            {formatStatusLabel("DEFAULTED")}
            <SubscriptionsFilterCount>
              ({statusCounts.DEFAULTED})
            </SubscriptionsFilterCount>
          </SubscriptionsFilterChip>
          <SubscriptionsFilterChip
            type="button"
            $isActive={activeStatusFilter === "ALL"}
            onClick={() => setActiveStatusFilter("ALL")}
          >
            All
            <SubscriptionsFilterCount>
              ({statusCounts.ALL})
            </SubscriptionsFilterCount>
          </SubscriptionsFilterChip>
        </SubscriptionsFiltersRow>

        {isLoading && <p>Loading subscriptions...</p>}
        {error && <p>{error}</p>}
        {!isLoading && !error && filteredSubscriptions.length === 0 && (
          <p>No subscriptions found.</p>
        )}
        {!isLoading && !error && filteredSubscriptions.length > 0 && (
          <SubscriptionsList>
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id}>
                <SubscriptionRow>
                  <SubscriptionLink href={`/subscriptions/${subscription.id}`}>
                    {subscription.id}
                  </SubscriptionLink>
                  <SubscriptionStatus>{subscription.status}</SubscriptionStatus>
                </SubscriptionRow>
                <SubscriptionRow>
                  <SubscriptionLabel>User</SubscriptionLabel>
                  <SubscriptionValue>
                    {subscription.user?.email || "—"}
                  </SubscriptionValue>
                </SubscriptionRow>
                <SubscriptionRow>
                  <SubscriptionLabel>Service</SubscriptionLabel>
                  <SubscriptionValue>
                    {subscription.service?.name || "—"}
                  </SubscriptionValue>
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
              </SubscriptionCard>
            ))}
          </SubscriptionsList>
        )}
      </SubscriptionsLayout>
    </PageLayout>
  )
}
