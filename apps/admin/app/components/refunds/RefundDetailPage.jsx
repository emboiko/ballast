"use client"

import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import { useToast } from "@/contexts/ToastContext"
import { useRefunds } from "@/contexts/RefundsContext"
import SectionNav from "@/components/ui/SectionNav"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import {
  formatMoney,
  formatMoneyValue,
  parseMoneyValueToCents,
} from "@ballast/shared/src/money.js"
import {
  RefundsContainer,
  RefundDetailGrid,
  RefundCard,
  RefundCardTitle,
  RefundSection,
  RefundMetaList,
  RefundMetaLabel,
  RefundMetaValue,
  RefundReasonValue,
  RefundStatusBadge,
  RefundActions,
  RefundFormRow,
  RefundInput,
  RefundTextarea,
  RefundPrimaryButton,
  RefundDangerButton,
  RefundEmptyState,
  RefundInlineLink,
  RefundExternalLink,
} from "@/components/refunds/refundStyles"

const getStripeCustomerDashboardUrl = (stripeCustomerId) => {
  if (
    typeof stripeCustomerId !== "string" ||
    stripeCustomerId.trim().length === 0
  ) {
    return null
  }

  const normalizedId = stripeCustomerId.trim()

  // Note: Use this pattern when deploying to a production environment.
  // Ballast is a reference implementation and does not create production customers for PPs.
  // Ballast's production setting is closer to a staging environment when deployed.

  // const isTestMode = !IS_PRODUCTION
  //
  // if (isTestMode) {
  //   return `https://dashboard.stripe.com/test/customers/${normalizedId}`
  // }

  return `https://dashboard.stripe.com/test/customers/${normalizedId}`
}

const formatProcessorName = (processor) => {
  if (processor === "STRIPE") {
    return "Stripe"
  }
  if (processor === "BRAINTREE") {
    return "Braintree"
  }
  if (processor === "SQUARE") {
    return "Square"
  }
  if (processor === "AUTHORIZE") {
    return "Authorize.net"
  }
  return processor
}

export default function RefundDetailPage() {
  const params = useParams()
  const { showErrorToast, showSuccessToast } = useToast()
  const { fetchRefundById, approveRefund, denyRefund } = useRefunds()

  const refundId = params.id

  const [refund, setRefund] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [amountInput, setAmountInput] = useState("")
  const [adminMessage, setAdminMessage] = useState("")
  const [denyMessage, setDenyMessage] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isDenying, setIsDenying] = useState(false)

  const loadRefund = useCallback(async () => {
    if (!refundId) {
      return
    }

    setIsLoading(true)
    try {
      const data = await fetchRefundById(refundId)
      setRefund(data.refund)
    } catch (error) {
      showErrorToast(error.message || "Failed to load refund request")
      setRefund(null)
    } finally {
      setIsLoading(false)
    }
  }, [refundId, fetchRefundById, showErrorToast])

  useEffect(() => {
    loadRefund()
  }, [loadRefund])

  const remainingRefundableCents = useMemo(() => {
    const cents = refund?.context?.orderRemainingRefundableCents
    if (typeof cents === "number") {
      return cents
    }
    return 0
  }, [refund])

  useEffect(() => {
    if (!refund) {
      return
    }

    if (refund.status !== "pending") {
      return
    }

    const defaultValue = formatMoneyValue(remainingRefundableCents)
    setAmountInput(defaultValue)
  }, [refund, remainingRefundableCents])

  const canProcess = refund && refund.status === "pending"

  const handleApprove = async () => {
    if (!refund) {
      return
    }
    if (!canProcess) {
      return
    }
    if (isApproving) {
      return
    }

    const parsedCents = parseMoneyValueToCents(amountInput)
    if (parsedCents === null) {
      showErrorToast("Enter a valid refund amount")
      return
    }

    if (parsedCents > remainingRefundableCents) {
      showErrorToast("Refund amount exceeds remaining refundable amount")
      return
    }

    setIsApproving(true)
    try {
      await approveRefund({
        refundId: refund.id,
        amountCents: parsedCents,
        adminMessage,
      })
      showSuccessToast("Refund approved")
      setAdminMessage("")
      await loadRefund()
    } catch (error) {
      showErrorToast(error.message || "Failed to process refund")
    } finally {
      setIsApproving(false)
    }
  }

  const handleDeny = async () => {
    if (!refund) {
      return
    }
    if (!canProcess) {
      return
    }
    if (isDenying) {
      return
    }

    setIsDenying(true)
    try {
      await denyRefund({
        refundId: refund.id,
        adminMessage: denyMessage,
      })
      showSuccessToast("Refund request denied")
      setDenyMessage("")
      await loadRefund()
    } catch (error) {
      showErrorToast(error.message || "Failed to deny refund request")
    } finally {
      setIsDenying(false)
    }
  }

  let subtitle = ""
  if (refund) {
    subtitle = `Refund request ${refund.id}`
  }

  if (isLoading) {
    return (
      <PageLayout>
        <RefundsContainer>
          <SectionNav title="Refund" subtitle="Loading refund request..." />
          <RefundEmptyState>Loading refund request...</RefundEmptyState>
        </RefundsContainer>
      </PageLayout>
    )
  }

  if (!refund) {
    return (
      <PageLayout>
        <RefundsContainer>
          <SectionNav title="Refund" subtitle="Not found" />
          <RefundEmptyState>
            Refund request not found.{" "}
            <RefundInlineLink href="/refunds">Back to refunds</RefundInlineLink>
          </RefundEmptyState>
        </RefundsContainer>
      </PageLayout>
    )
  }

  const order = refund.order
  const user = refund.requestedByUser

  let orderAmountLabel = ""
  if (typeof order?.amountCents === "number") {
    orderAmountLabel = formatMoney(order.amountCents)
  }

  let refundedSoFarLabel = ""
  if (typeof order?.refundedAmountCents === "number") {
    refundedSoFarLabel = formatMoney(order.refundedAmountCents)
  }

  const remainingLabel = formatMoney(remainingRefundableCents)

  const userBadges = []
  if (user?.bannedAt) {
    userBadges.push("Banned")
  }
  if (user?.archivedAt) {
    userBadges.push("Archived")
  }

  let userBadgesLabel = ""
  if (userBadges.length > 0) {
    userBadgesLabel = userBadges.join(" • ")
  }

  let userOrdersTotal = 0
  if (typeof refund.context?.userOrdersTotal === "number") {
    userOrdersTotal = refund.context.userOrdersTotal
  }

  let userRefundsTotal = 0
  if (typeof refund.context?.userRefundsTotal === "number") {
    userRefundsTotal = refund.context.userRefundsTotal
  }

  let orderRefundsContent = (
    <RefundEmptyState>No other refunds for this order.</RefundEmptyState>
  )
  if (
    Array.isArray(refund.context?.orderRefunds) &&
    refund.context.orderRefunds.length > 0
  ) {
    const otherOrderRefunds = refund.context.orderRefunds.filter((r) => {
      return r?.id && r.id !== refund.id
    })

    orderRefundsContent = (
      <>
        {otherOrderRefunds.length === 0 && (
          <RefundEmptyState>No other refunds for this order.</RefundEmptyState>
        )}

        {otherOrderRefunds.length > 0 && (
          <RefundMetaList>
            {otherOrderRefunds.map((r) => {
              let amountLabel = "—"
              if (typeof r.amountCents === "number") {
                amountLabel = formatMoney(r.amountCents)
              }

              let createdAtLabel = "—"
              if (r.createdAt) {
                createdAtLabel = new Date(r.createdAt).toLocaleDateString()
              }

              return (
                <Fragment key={r.id}>
                  <RefundMetaLabel>
                    {formatStatusLabel(r.status)}
                  </RefundMetaLabel>
                  <RefundMetaValue>
                    Order:{" "}
                    <RefundInlineLink href={`/orders/${order.id}`}>
                      {order.id}
                    </RefundInlineLink>{" "}
                    • Refund:{" "}
                    <RefundInlineLink href={`/refunds/${r.id}`}>
                      {r.id}
                    </RefundInlineLink>{" "}
                    • Amount: {amountLabel} • {createdAtLabel}
                  </RefundMetaValue>
                </Fragment>
              )
            })}
          </RefundMetaList>
        )}
      </>
    )
  }

  let userRefundsContent = (
    <RefundEmptyState>No refunds found for this user.</RefundEmptyState>
  )

  const userRefundsOther = refund.context?.userRefundsOther || []

  const otherUserRefunds = userRefundsOther.filter((r) => {
    return r?.id && r.id !== refund.id
  })

  if (otherUserRefunds.length > 0) {
    userRefundsContent = (
      <RefundMetaList>
        {otherUserRefunds.map((r) => {
          let amountLabel = "—"
          if (typeof r.amountCents === "number") {
            amountLabel = formatMoney(r.amountCents)
          }

          const orderIdValue = r.order?.id || r.orderId
          let createdAtLabel = "—"
          if (r.createdAt) {
            createdAtLabel = new Date(r.createdAt).toLocaleDateString()
          }

          return (
            <Fragment key={r.id}>
              <RefundMetaLabel>{formatStatusLabel(r.status)}</RefundMetaLabel>
              <RefundMetaValue>
                Order:{" "}
                {orderIdValue ? (
                  <RefundInlineLink href={`/orders/${orderIdValue}`}>
                    {orderIdValue}
                  </RefundInlineLink>
                ) : (
                  "—"
                )}{" "}
                • Refund:{" "}
                <RefundInlineLink href={`/refunds/${r.id}`}>
                  {r.id}
                </RefundInlineLink>{" "}
                • Amount: {amountLabel} • {createdAtLabel}
              </RefundMetaValue>
            </Fragment>
          )
        })}
      </RefundMetaList>
    )
  }

  let orderItemsContent = (
    <RefundEmptyState>No items found for this order.</RefundEmptyState>
  )
  if (Array.isArray(order.items) && order.items.length > 0) {
    orderItemsContent = (
      <RefundMetaList>
        {order.items.map((orderItem) => {
          const itemTotalCents = orderItem.priceCents * orderItem.quantity
          const itemLine = `${orderItem.quantity} × ${formatMoney(
            orderItem.priceCents
          )} = ${formatMoney(itemTotalCents)}`

          return (
            <Fragment key={orderItem.id}>
              <RefundMetaLabel>{orderItem.name}</RefundMetaLabel>
              <RefundMetaValue>{itemLine}</RefundMetaValue>
            </Fragment>
          )
        })}
      </RefundMetaList>
    )
  }

  return (
    <PageLayout>
      <RefundsContainer>
        <SectionNav title="Refund" subtitle={subtitle} />

        <RefundDetailGrid>
          <RefundCard>
            <RefundCardTitle>Request</RefundCardTitle>
            <RefundMetaList>
              <RefundMetaLabel>Status</RefundMetaLabel>
              <RefundMetaValue>
                <RefundStatusBadge $status={refund.status}>
                  {formatStatusLabel(refund.status)}
                </RefundStatusBadge>
              </RefundMetaValue>

              <RefundMetaLabel>Created</RefundMetaLabel>
              <RefundMetaValue>
                {new Date(refund.createdAt).toLocaleString()}
              </RefundMetaValue>

              <RefundMetaLabel>Reason</RefundMetaLabel>
              <RefundReasonValue>{refund.reason || "—"}</RefundReasonValue>
            </RefundMetaList>
          </RefundCard>

          <RefundCard>
            <RefundCardTitle>Order</RefundCardTitle>
            <RefundMetaList>
              <RefundMetaLabel>Order ID</RefundMetaLabel>
              <RefundMetaValue>
                <RefundInlineLink href={`/orders/${order.id}`}>
                  {order.id}
                </RefundInlineLink>
              </RefundMetaValue>

              <RefundMetaLabel>Processor</RefundMetaLabel>
              <RefundMetaValue>
                {formatProcessorName(order.processor)}
              </RefundMetaValue>

              <RefundMetaLabel>Processor payment ID</RefundMetaLabel>
              <RefundMetaValue>{order.processorPaymentId}</RefundMetaValue>

              <RefundMetaLabel>Order amount</RefundMetaLabel>
              <RefundMetaValue>{orderAmountLabel}</RefundMetaValue>

              <RefundMetaLabel>Refunded so far</RefundMetaLabel>
              <RefundMetaValue>{refundedSoFarLabel}</RefundMetaValue>

              <RefundMetaLabel>Remaining refundable</RefundMetaLabel>
              <RefundMetaValue>{remainingLabel}</RefundMetaValue>
            </RefundMetaList>
          </RefundCard>

          <RefundCard>
            <RefundCardTitle>User</RefundCardTitle>
            <RefundMetaList>
              <RefundMetaLabel>Email</RefundMetaLabel>
              <RefundMetaValue>
                <RefundInlineLink href={`/users/${user.id}`}>
                  {user.email}
                </RefundInlineLink>
              </RefundMetaValue>

              <RefundMetaLabel>User ID</RefundMetaLabel>
              <RefundMetaValue>{user.id}</RefundMetaValue>

              <RefundMetaLabel>Badges</RefundMetaLabel>
              <RefundMetaValue>{userBadgesLabel || "—"}</RefundMetaValue>

              <RefundMetaLabel>Orders</RefundMetaLabel>
              <RefundMetaValue>{userOrdersTotal}</RefundMetaValue>

              <RefundMetaLabel>Refund requests</RefundMetaLabel>
              <RefundMetaValue>{userRefundsTotal}</RefundMetaValue>

              <RefundMetaLabel>Stripe customer ID</RefundMetaLabel>
              <RefundMetaValue>
                {user.stripeCustomerId ? (
                  <RefundExternalLink
                    href={getStripeCustomerDashboardUrl(user.stripeCustomerId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.stripeCustomerId}
                  </RefundExternalLink>
                ) : (
                  "—"
                )}
              </RefundMetaValue>

              <RefundMetaLabel>Braintree customer ID</RefundMetaLabel>
              <RefundMetaValue>
                {user.braintreeCustomerId || "—"}
              </RefundMetaValue>

              <RefundMetaLabel>Square customer ID</RefundMetaLabel>
              <RefundMetaValue>{user.squareCustomerId || "—"}</RefundMetaValue>

              <RefundMetaLabel>Authorize customer ID</RefundMetaLabel>
              <RefundMetaValue>
                {user.authorizeCustomerId || "—"}
              </RefundMetaValue>
            </RefundMetaList>
          </RefundCard>

          <RefundCard>
            <RefundCardTitle>Actions</RefundCardTitle>

            {!canProcess && (
              <RefundEmptyState>
                This refund request is no longer pending and cannot be actioned
                from here.
              </RefundEmptyState>
            )}

            {canProcess && (
              <RefundActions>
                <RefundFormRow>
                  <RefundMetaLabel>Refund amount:</RefundMetaLabel>
                  <RefundInput
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                    disabled={isApproving || isDenying}
                  />
                </RefundFormRow>

                <RefundFormRow>
                  <RefundMetaLabel>
                    Approval message:
                    <RefundPrimaryButton
                      type="button"
                      onClick={handleApprove}
                      disabled={isApproving || isDenying}
                    >
                      {isApproving ? "Processing..." : "Approve & process"}
                    </RefundPrimaryButton>
                  </RefundMetaLabel>
                  <RefundTextarea
                    value={adminMessage}
                    onChange={(event) => setAdminMessage(event.target.value)}
                    placeholder="Optional note to include in the approval email to the user"
                    disabled={isApproving || isDenying}
                  />
                </RefundFormRow>

                <RefundFormRow>
                  <RefundMetaLabel>
                    Denial message:
                    <RefundDangerButton
                      type="button"
                      onClick={handleDeny}
                      disabled={isApproving || isDenying}
                    >
                      {isDenying ? "Denying..." : "Deny request"}
                    </RefundDangerButton>
                  </RefundMetaLabel>
                  <RefundTextarea
                    value={denyMessage}
                    onChange={(event) => setDenyMessage(event.target.value)}
                    placeholder="Optional note to include in the denial email to the user"
                    disabled={isApproving || isDenying}
                  />
                </RefundFormRow>
              </RefundActions>
            )}
          </RefundCard>
        </RefundDetailGrid>

        <RefundSection>
          <RefundCard>
            <RefundCardTitle>Order items</RefundCardTitle>
            {orderItemsContent}
          </RefundCard>
        </RefundSection>

        <RefundSection>
          <RefundCard>
            <RefundCardTitle>Other refunds for this order</RefundCardTitle>
            {orderRefundsContent}
          </RefundCard>
        </RefundSection>

        <RefundSection>
          <RefundCard>
            <RefundCardTitle>Other refunds for this user</RefundCardTitle>
            {userRefundsContent}
          </RefundCard>
        </RefundSection>
      </RefundsContainer>
    </PageLayout>
  )
}
