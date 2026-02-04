"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatMoney } from "@ballast/shared/src/money.js"
import { fetchFinancingPlans } from "@/gateways/financingGateway"
import {
  FinancingList as FinancingListContainer,
  FinancingCard,
  FinancingHeader,
  FinancingTitle,
  FinancingStatus,
  FinancingRow,
  FinancingValue,
  EmptyState,
} from "@/components/account/accountStyles"

export default function FinancingList() {
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchFinancingPlans()
        setPlans(Array.isArray(data.plans) ? data.plans : [])
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlans()
  }, [])

  if (isLoading) {
    return <p>Loading financing plans...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (plans.length === 0) {
    return (
      <EmptyState>
        <p>No financing plans found.</p>
      </EmptyState>
    )
  }

  const getNextPaymentLabel = (plan) => {
    let nextPaymentLabel = "—"
    if (plan.nextPaymentDate) {
      nextPaymentLabel = new Date(plan.nextPaymentDate).toLocaleDateString()
    }
    return nextPaymentLabel
  }

  return (
    <FinancingListContainer>
      {plans.map((plan) => (
        <FinancingCard key={plan.id}>
          <FinancingHeader>
            <FinancingTitle as={Link} href={`/account/financing/${plan.id}`}>
              Plan {plan.id}
            </FinancingTitle>
            <FinancingStatus $status={plan.status}>
              {plan.status}
            </FinancingStatus>
          </FinancingHeader>
          <FinancingRow>
            <span>Total</span>
            <FinancingValue>
              {formatMoney(plan.totalAmountCents)}
            </FinancingValue>
          </FinancingRow>
          <FinancingRow>
            <span>Remaining</span>
            <FinancingValue>
              {formatMoney(plan.remainingBalanceCents)}
            </FinancingValue>
          </FinancingRow>
          <FinancingRow>
            <span>Cadence</span>
            <FinancingValue>{plan.cadence}</FinancingValue>
          </FinancingRow>
          <FinancingRow>
            <span>Next payment</span>
            <FinancingValue>{getNextPaymentLabel(plan)}</FinancingValue>
          </FinancingRow>
        </FinancingCard>
      ))}
    </FinancingListContainer>
  )
}
