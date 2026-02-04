"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import SectionNav from "@/components/ui/SectionNav"
import { fetchFinancingPlanById } from "@/gateways/financingGateway"
import { formatMoney } from "@ballast/shared/src/money.js"
import { formatDate } from "@/utils/date"
import {
  FinancingLayout,
  FinancingCard,
  FinancingRow,
  FinancingLabel,
  FinancingValue,
  FinancingLink,
  FinancingSectionTitle,
} from "@/components/financing/financingStyles"

export default function FinancingDetailPage() {
  const params = useParams()
  const planId = params.id
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadPlan = useCallback(async () => {
    if (!planId) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchFinancingPlanById(planId)
      setPlan(data.plan)
    } catch (loadError) {
      setError(loadError.message)
      setPlan(null)
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  if (isLoading) {
    return (
      <PageLayout>
        <SectionNav title="Financing plan" subtitle={`Plan ID: ${planId}`} />
        <p>Loading financing plan...</p>
      </PageLayout>
    )
  }

  if (!plan) {
    return (
      <PageLayout>
        <SectionNav title="Financing plan" subtitle="Not found" />
        <p>{error || "Financing plan not found."}</p>
      </PageLayout>
    )
  }

  let latestContract = null
  if (Array.isArray(plan.contracts) && plan.contracts.length > 0) {
    latestContract = plan.contracts[0]
  }

  let orderLinkContent = "—"
  if (plan.order?.id) {
    orderLinkContent = (
      <FinancingLink href={`/orders/${plan.order.id}`}>
        {plan.order.id}
      </FinancingLink>
    )
  }

  let paymentsContent = <p>No payments recorded.</p>
  if (Array.isArray(plan.payments) && plan.payments.length > 0) {
    paymentsContent = plan.payments.map((payment) => (
      <FinancingRow key={payment.id}>
        <FinancingLabel>{payment.type}</FinancingLabel>
        <FinancingValue>
          {formatMoney(payment.amountCents)} · {formatDate(payment.createdAt)}
        </FinancingValue>
      </FinancingRow>
    ))
  }

  let contractContent = null
  if (latestContract?.html) {
    contractContent = (
      <FinancingCard>
        <FinancingSectionTitle>Contract</FinancingSectionTitle>
        <div dangerouslySetInnerHTML={{ __html: latestContract.html }} />
      </FinancingCard>
    )
  }

  return (
    <PageLayout>
      <SectionNav title="Financing plan" subtitle={`Plan ID: ${planId}`} />
      <FinancingLayout>
        <FinancingCard>
          <FinancingSectionTitle>Plan details</FinancingSectionTitle>
          <FinancingRow>
            <FinancingLabel>User</FinancingLabel>
            <FinancingValue>{plan.user?.email || "—"}</FinancingValue>
          </FinancingRow>
          <FinancingRow>
            <FinancingLabel>Status</FinancingLabel>
            <FinancingValue>{plan.status}</FinancingValue>
          </FinancingRow>
          <FinancingRow>
            <FinancingLabel>Total</FinancingLabel>
            <FinancingValue>{formatMoney(plan.totalAmountCents)}</FinancingValue>
          </FinancingRow>
          <FinancingRow>
            <FinancingLabel>Down payment</FinancingLabel>
            <FinancingValue>{formatMoney(plan.downPaymentCents)}</FinancingValue>
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
            <FinancingLabel>Term</FinancingLabel>
            <FinancingValue>{plan.termCount} payments</FinancingValue>
          </FinancingRow>
          <FinancingRow>
            <FinancingLabel>Next payment</FinancingLabel>
            <FinancingValue>{formatDate(plan.nextPaymentDate)}</FinancingValue>
          </FinancingRow>
          <FinancingRow>
            <FinancingLabel>Order</FinancingLabel>
            <FinancingValue>{orderLinkContent}</FinancingValue>
          </FinancingRow>
        </FinancingCard>

        <FinancingCard>
          <FinancingSectionTitle>Payments</FinancingSectionTitle>
          {paymentsContent}
        </FinancingCard>

        {contractContent}
      </FinancingLayout>
    </PageLayout>
  )
}
