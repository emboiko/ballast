"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import { PageHeader, PageTitle, PageSubtitle } from "@/components/ui/uiStyles"
import { fetchFinancingPlans } from "@/gateways/financingGateway"
import { formatMoney } from "@ballast/shared/src/money.js"
import { formatDate } from "@/utils/date"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import { getTrimmedSearchParamCaseInsensitive } from "@/utils/searchParams"
import {
  FinancingLayout,
  FinancingCard,
  FinancingList,
  FinancingRow,
  FinancingLabel,
  FinancingValue,
  FinancingLink,
  FinancingStatus,
  FinancingFiltersRow,
  FinancingFilterChip,
  FinancingFilterCount,
} from "@/components/financing/financingStyles"

const FINANCING_STATUSES = [
  "ACTIVE",
  "PAID_OFF",
  "PAUSED",
  "CANCELED",
  "DEFAULTED",
]

export default function FinancingPage() {
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeStatusFilter, setActiveStatusFilter] = useState("ACTIVE")

  const normalizedUserId = useMemo(() => {
    return getTrimmedSearchParamCaseInsensitive(searchParams, "userId")
  }, [searchParams])

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchFinancingPlans({
        limit: 25,
        offset: 0,
        userId: normalizedUserId || undefined,
      })
      setPlans(Array.isArray(data.plans) ? data.plans : [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }, [normalizedUserId])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: plans.length,
    }
    for (const status of FINANCING_STATUSES) {
      counts[status] = 0
    }
    for (const plan of plans) {
      if (counts[plan.status] !== undefined) {
        counts[plan.status] += 1
      }
    }
    return counts
  }, [plans])

  const filteredPlans = useMemo(() => {
    if (activeStatusFilter === "ALL") {
      return plans
    }
    return plans.filter((plan) => plan.status === activeStatusFilter)
  }, [activeStatusFilter, plans])

  return (
    <PageLayout>
      <PageHeader>
        <PageTitle>Financing</PageTitle>
        <PageSubtitle>
          Review active financing plans and contracts.
        </PageSubtitle>
      </PageHeader>

      <FinancingLayout>
        <FinancingFiltersRow>
          <FinancingFilterChip
            type="button"
            $isActive={activeStatusFilter === "ACTIVE"}
            onClick={() => setActiveStatusFilter("ACTIVE")}
          >
            {formatStatusLabel("ACTIVE")}
            <FinancingFilterCount>({statusCounts.ACTIVE})</FinancingFilterCount>
          </FinancingFilterChip>
          <FinancingFilterChip
            type="button"
            $isActive={activeStatusFilter === "PAID_OFF"}
            onClick={() => setActiveStatusFilter("PAID_OFF")}
          >
            {formatStatusLabel("PAID_OFF")}
            <FinancingFilterCount>
              ({statusCounts.PAID_OFF})
            </FinancingFilterCount>
          </FinancingFilterChip>
          <FinancingFilterChip
            type="button"
            $isActive={activeStatusFilter === "PAUSED"}
            onClick={() => setActiveStatusFilter("PAUSED")}
          >
            {formatStatusLabel("PAUSED")}
            <FinancingFilterCount>({statusCounts.PAUSED})</FinancingFilterCount>
          </FinancingFilterChip>
          <FinancingFilterChip
            type="button"
            $isActive={activeStatusFilter === "CANCELED"}
            onClick={() => setActiveStatusFilter("CANCELED")}
          >
            {formatStatusLabel("CANCELED")}
            <FinancingFilterCount>
              ({statusCounts.CANCELED})
            </FinancingFilterCount>
          </FinancingFilterChip>
          <FinancingFilterChip
            type="button"
            $isActive={activeStatusFilter === "DEFAULTED"}
            onClick={() => setActiveStatusFilter("DEFAULTED")}
          >
            {formatStatusLabel("DEFAULTED")}
            <FinancingFilterCount>
              ({statusCounts.DEFAULTED})
            </FinancingFilterCount>
          </FinancingFilterChip>
          <FinancingFilterChip
            type="button"
            $isActive={activeStatusFilter === "ALL"}
            onClick={() => setActiveStatusFilter("ALL")}
          >
            All
            <FinancingFilterCount>({statusCounts.ALL})</FinancingFilterCount>
          </FinancingFilterChip>
        </FinancingFiltersRow>
        {isLoading && <p>Loading financing plans...</p>}
        {error && <p>{error}</p>}
        {!isLoading && !error && filteredPlans.length === 0 && (
          <p>No financing plans found.</p>
        )}
        {!isLoading && !error && filteredPlans.length > 0 && (
          <FinancingList>
            {filteredPlans.map((plan) => (
              <FinancingCard key={plan.id}>
                <FinancingRow>
                  <FinancingLink href={`/financing/${plan.id}`}>
                    {plan.id}
                  </FinancingLink>
                  <FinancingStatus>{plan.status}</FinancingStatus>
                </FinancingRow>
                <FinancingRow>
                  <FinancingLabel>User</FinancingLabel>
                  <FinancingValue>{plan.user?.email || "—"}</FinancingValue>
                </FinancingRow>
                <FinancingRow>
                  <FinancingLabel>Total</FinancingLabel>
                  <FinancingValue>
                    {formatMoney(plan.totalAmountCents)}
                  </FinancingValue>
                </FinancingRow>
                <FinancingRow>
                  <FinancingLabel>Remaining</FinancingLabel>
                  <FinancingValue>
                    {formatMoney(plan.remainingBalanceCents)}
                  </FinancingValue>
                </FinancingRow>
                <FinancingRow>
                  <FinancingLabel>Cadence</FinancingLabel>
                  <FinancingValue>{plan.cadence}</FinancingValue>
                </FinancingRow>
                <FinancingRow>
                  <FinancingLabel>Next payment</FinancingLabel>
                  <FinancingValue>
                    {formatDate(plan.nextPaymentDate)}
                  </FinancingValue>
                </FinancingRow>
              </FinancingCard>
            ))}
          </FinancingList>
        )}
      </FinancingLayout>
    </PageLayout>
  )
}
