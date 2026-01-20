"use client"

import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import SectionNav from "@/components/ui/SectionNav"
import { useOrders } from "@/contexts/OrdersContext"
import { useToast } from "@/contexts/ToastContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import { formatDate } from "@/utils/date"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import {
  OrderDetailContainer,
  DetailSection,
  SectionTitle,
  DetailGrid,
  DetailItem,
  DetailLabel,
  DetailValue,
  DetailValueMono,
  StatusBadgesRow,
  StatusBadge,
  InlineLink,
  EmptyState,
  DetailList,
  DetailListLabel,
  DetailListValue,
} from "@/components/orders/ordersStyles"

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id
  const { fetchOrderById } = useOrders()
  const { showErrorToast } = useToast()

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchOrderById(orderId)
      setOrder(data.order)
    } catch (loadError) {
      setError(loadError.message)
      setOrder(null)
      showErrorToast(loadError.message || "Failed to load order")
    } finally {
      setIsLoading(false)
    }
  }, [fetchOrderById, orderId, showErrorToast])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const refundTotalLabel = useMemo(() => {
    if (!order || typeof order.refundedAmountCents !== "number") {
      return "—"
    }
    return formatMoney(order.refundedAmountCents)
  }, [order])

  if (isLoading) {
    return (
      <PageLayout>
        <SectionNav title="Order Details" subtitle={`Order ID: ${orderId}`} />
        <EmptyState>Loading order details...</EmptyState>
      </PageLayout>
    )
  }

  if (!order) {
    return (
      <PageLayout>
        <SectionNav title="Order Details" subtitle="Not found" />
        <EmptyState>
          {error || "Order not found."}{" "}
          <InlineLink href="/orders">Back to orders</InlineLink>
        </EmptyState>
      </PageLayout>
    )
  }

  const user = order.user
  let orderStatusLabel = "Unknown"
  if (order.status) {
    orderStatusLabel = formatStatusLabel(order.status)
  }

  let orderStatusVariant = "warning"
  if (order.status === "succeeded") {
    orderStatusVariant = "success"
  }
  if (order.status === "failed") {
    orderStatusVariant = "error"
  }

  let refundStatusLabel = "None"
  if (order.refundStatus) {
    refundStatusLabel = formatStatusLabel(order.refundStatus)
  }

  let userBadgesLabel = "—"
  const userBadges = []
  if (user?.bannedAt) {
    userBadges.push("Banned")
  }
  if (user?.archivedAt) {
    userBadges.push("Archived")
  }
  if (userBadges.length > 0) {
    userBadgesLabel = userBadges.join(" • ")
  } else {
    userBadgesLabel = "Active"
  }

  let amountLabel = "—"
  if (typeof order.amountCents === "number") {
    amountLabel = formatMoney(order.amountCents)
  }

  let createdAtLabel = "—"
  if (order.createdAt) {
    createdAtLabel = formatDate(order.createdAt)
  }

  let updatedAtLabel = "—"
  if (order.updatedAt) {
    updatedAtLabel = formatDate(order.updatedAt)
  }

  let itemsContent = <EmptyState>No items found for this order.</EmptyState>
  if (Array.isArray(order.items) && order.items.length > 0) {
    itemsContent = (
      <DetailList>
        {order.items.map((item) => {
          const itemTotal = item.priceCents * item.quantity
          const itemLine = `${item.quantity} × ${formatMoney(
            item.priceCents
          )} = ${formatMoney(itemTotal)}`
          return (
            <Fragment key={item.id}>
              <DetailListLabel>{item.name}</DetailListLabel>
              <DetailListValue>{itemLine}</DetailListValue>
            </Fragment>
          )
        })}
      </DetailList>
    )
  }

  let refundsContent = <EmptyState>No refunds yet.</EmptyState>
  if (Array.isArray(order.refunds) && order.refunds.length > 0) {
    refundsContent = (
      <DetailList>
        {order.refunds.map((refund) => {
          let refundAmountLabel = "—"
          if (typeof refund.amountCents === "number") {
            refundAmountLabel = formatMoney(refund.amountCents)
          }

          let processedByLabel = "Not processed"
          if (refund.processedByUser?.email) {
            processedByLabel = refund.processedByUser.email
          }

          let createdLabel = "—"
          if (refund.createdAt) {
            createdLabel = formatDate(refund.createdAt)
          }

          return (
            <Fragment key={refund.id}>
              <DetailListLabel>
                {formatStatusLabel(refund.status)}
              </DetailListLabel>
              <DetailListValue>
                Refund{" "}
                <InlineLink href={`/refunds/${refund.id}`}>
                  {refund.id}
                </InlineLink>{" "}
                • Amount {refundAmountLabel} • Requested by{" "}
                {refund.requestedByUser?.email || "Unknown user"} • Processed by{" "}
                {processedByLabel} • {createdLabel}
              </DetailListValue>
            </Fragment>
          )
        })}
      </DetailList>
    )
  }

  let userEmailContent = user?.email || "—"
  if (user?.id) {
    userEmailContent = (
      <InlineLink href={`/users/${user.id}`}>{user.email}</InlineLink>
    )
  }

  return (
    <PageLayout>
      <SectionNav title="Order Details" subtitle={`Order ID: ${order.id}`} />

      <OrderDetailContainer>
        <DetailSection>
          <SectionTitle>Order Overview</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <DetailLabel>Status</DetailLabel>
              <StatusBadgesRow>
                <StatusBadge $variant={orderStatusVariant}>
                  {orderStatusLabel}
                </StatusBadge>
                {order.refundStatus && (
                  <StatusBadge $variant="warning">
                    Refunds {refundStatusLabel}
                  </StatusBadge>
                )}
              </StatusBadgesRow>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Amount</DetailLabel>
              <DetailValue>{amountLabel}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Refunded total</DetailLabel>
              <DetailValue>{refundTotalLabel}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Processor</DetailLabel>
              <DetailValue>{order.processor || "—"}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Processor payment ID</DetailLabel>
              <DetailValueMono>
                {order.processorPaymentId || "—"}
              </DetailValueMono>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Created</DetailLabel>
              <DetailValue>{createdAtLabel}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Updated</DetailLabel>
              <DetailValue>{updatedAtLabel}</DetailValue>
            </DetailItem>
          </DetailGrid>
        </DetailSection>

        <DetailSection>
          <SectionTitle>User</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <DetailLabel>Email</DetailLabel>
              <DetailValue>{userEmailContent}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>User ID</DetailLabel>
              <DetailValueMono>{user?.id || "—"}</DetailValueMono>
            </DetailItem>
            <DetailItem>
              <DetailLabel>User Status</DetailLabel>
              <DetailValue>{userBadgesLabel}</DetailValue>
            </DetailItem>
          </DetailGrid>
        </DetailSection>

        <DetailSection>
          <SectionTitle>Items</SectionTitle>
          {itemsContent}
        </DetailSection>

        <DetailSection>
          <SectionTitle>Refunds</SectionTitle>
          {refundsContent}
        </DetailSection>
      </OrderDetailContainer>
    </PageLayout>
  )
}
