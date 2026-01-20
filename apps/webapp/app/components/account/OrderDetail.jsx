"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useOrders } from "@/contexts/OrdersContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import CollapsibleSection from "@/components/account/CollapsibleSection"
import RefundForm from "@/components/account/RefundForm"
import {
  AccountSection,
  OrderDetail as StyledOrderDetail,
  OrderDetailSection,
  OrderDetailSectionTitle,
  OrderDetailGrid,
  OrderDetailItem,
  OrderDetailLabel,
  OrderDetailValue,
  RefundStatusBadge,
  RefundStatus,
  RefundStatusMessage,
  RefundsList,
  RefundItem,
  RefundItemHeader,
  RefundAmount,
  RefundDate,
  RefundReason,
  PaymentMethodInfo,
  PaymentMethodDetails,
  PaymentMethodCard,
  PaymentMethodExpiry,
  ProcessorBadge,
  OrderItemsContainer,
  OrderItemsList,
  OrderItemRow,
  OrderItemThumbnail,
  OrderItemImage,
  OrderItemPlaceholder,
  OrderItemDetails,
  OrderItemName,
  OrderItemMeta,
  OrderItemPrice,
  OrderItemQuantity,
  OrderStatus,
  OrderIdValue,
} from "@/components/account/accountStyles"
import { SectionHeader } from "@/components/payment/paymentStyles"
import {
  Card,
  TextSecondary,
  ErrorText,
  ButtonSecondary,
} from "@/components/ui/uiStyles"

const CARD_BRANDS = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  jcb: "JCB",
  diners: "Diners Club",
  unionpay: "UnionPay",
}

const PROCESSOR_NAMES = {
  STRIPE: "Stripe",
  BRAINTREE: "Braintree",
  SQUARE: "Square",
  AUTHORIZE: "Authorize.net",
}

const REFUND_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

export default function OrderDetail({ orderId }) {
  const router = useRouter()
  const { setSuccessMessage } = useAuth()
  const { fetchOrder } = useOrders()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refundSectionOpen, setRefundSectionOpen] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true)
      setError(null)
      const result = await fetchOrder(orderId)
      if (result.success) {
        setOrder(result.order)
      } else {
        setError(result.error)
      }
      setIsLoading(false)
    }

    loadOrder()
  }, [orderId, fetchOrder])

  const handleRefundSuccess = async (message) => {
    setRefundSectionOpen(false)
    setSuccessMessage(message)
    // Refresh order data
    const result = await fetchOrder(orderId)
    if (result.success) {
      setOrder(result.order)
    }
  }

  const formatCardBrand = (brand) => {
    const normalized = brand?.toLowerCase()
    return CARD_BRANDS[normalized] || brand || "Card"
  }

  const formatExpiry = (month, year) => {
    if (!month || !year) {
      return ""
    }
    const monthStr = String(month).padStart(2, "0")
    const yearStr = String(year).slice(-2)
    return `${monthStr}/${yearStr}`
  }

  const isRefundable = () => {
    if (!order) {
      return false
    }
    if (order.status !== "succeeded") {
      return false
    }
    if (order.refundStatus === "pending") {
      return false
    }
    if (order.refundedAmountCents >= order.amountCents) {
      return false
    }
    return true
  }

  const approvedRefunds =
    order?.refunds?.filter((refund) => refund.status === "approved") || []

  if (isLoading) {
    return (
      <AccountSection>
        <SectionHeader>
          <h2>Order Details</h2>
        </SectionHeader>
        <Card>
          <TextSecondary>Loading order...</TextSecondary>
        </Card>
      </AccountSection>
    )
  }

  if (error) {
    return (
      <AccountSection>
        <SectionHeader>
          <h2>Order Details</h2>
        </SectionHeader>
        <Card>
          <ErrorText>Error: {error}</ErrorText>
          <ButtonSecondary onClick={() => router.push("/account")}>
            Back to Orders
          </ButtonSecondary>
        </Card>
      </AccountSection>
    )
  }

  if (!order) {
    return null
  }

  return (
    <AccountSection>
      <SectionHeader>
        <h2>Order Details</h2>
      </SectionHeader>
      <Card>
        <StyledOrderDetail>
          <OrderDetailSection>
            <OrderDetailSectionTitle>Order Information</OrderDetailSectionTitle>
            <OrderDetailGrid>
              <OrderDetailItem>
                <OrderDetailLabel>Order ID</OrderDetailLabel>
                <OrderIdValue>{order.id}</OrderIdValue>
              </OrderDetailItem>
              <OrderDetailItem>
                <OrderDetailLabel>Date</OrderDetailLabel>
                <OrderDetailValue>
                  {new Date(order.createdAt).toLocaleDateString()}
                </OrderDetailValue>
              </OrderDetailItem>
              <OrderDetailItem>
                <OrderDetailLabel>Amount</OrderDetailLabel>
                <OrderDetailValue>
                  {formatMoney(order.amountCents)}
                </OrderDetailValue>
              </OrderDetailItem>
              <OrderDetailItem>
                <OrderDetailLabel>Status</OrderDetailLabel>
                <OrderStatus $status={order.status}>{order.status}</OrderStatus>
              </OrderDetailItem>
            </OrderDetailGrid>
          </OrderDetailSection>

          {order.refundStatus && (
            <OrderDetailSection>
              <OrderDetailSectionTitle>Refund Status</OrderDetailSectionTitle>
              <RefundStatusBadge>
                <RefundStatus $status={order.refundStatus}>
                  {REFUND_STATUS_LABELS[order.refundStatus] ||
                    order.refundStatus}
                </RefundStatus>
                {order.refundStatus === "pending" && (
                  <RefundStatusMessage>
                    Refund request pending review. Our team will process it
                    shortly.
                  </RefundStatusMessage>
                )}
              </RefundStatusBadge>
            </OrderDetailSection>
          )}

          {order.items && order.items.length > 0 && (
            <OrderDetailSection>
              <OrderDetailSectionTitle>Order Items</OrderDetailSectionTitle>
              <OrderItemsContainer>
                <OrderItemsList>
                  {order.items.map((item) => (
                    <OrderItemRow key={item.id}>
                      <OrderItemThumbnail>
                        {item.thumbnailUrl ? (
                          <OrderItemImage
                            src={item.thumbnailUrl}
                            alt={item.name}
                          />
                        ) : (
                          <OrderItemPlaceholder>
                            {item.type === "service" ? "🔧" : "📦"}
                          </OrderItemPlaceholder>
                        )}
                      </OrderItemThumbnail>
                      <OrderItemDetails>
                        <OrderItemName>{item.name}</OrderItemName>
                        <OrderItemMeta>
                          <OrderItemPrice>
                            {formatMoney(item.priceCents)} each
                          </OrderItemPrice>
                          {item.quantity > 1 && (
                            <>
                              <OrderItemQuantity>
                                × {item.quantity}
                              </OrderItemQuantity>
                              <span>
                                = {formatMoney(item.priceCents * item.quantity)}
                              </span>
                            </>
                          )}
                        </OrderItemMeta>
                      </OrderItemDetails>
                    </OrderItemRow>
                  ))}
                </OrderItemsList>
              </OrderItemsContainer>
            </OrderDetailSection>
          )}

          {order.paymentMethod && (
            <OrderDetailSection>
              <OrderDetailSectionTitle>Payment Method</OrderDetailSectionTitle>
              <PaymentMethodInfo>
                <PaymentMethodDetails>
                  <PaymentMethodCard>
                    {formatCardBrand(order.paymentMethod.brand)} ••••{" "}
                    {order.paymentMethod.last4}
                  </PaymentMethodCard>
                  {order.paymentMethod.expMonth &&
                    order.paymentMethod.expYear && (
                      <PaymentMethodExpiry>
                        (expires{" "}
                        {formatExpiry(
                          order.paymentMethod.expMonth,
                          order.paymentMethod.expYear
                        )}
                        )
                      </PaymentMethodExpiry>
                    )}
                </PaymentMethodDetails>
                <ProcessorBadge>
                  {PROCESSOR_NAMES[order.processor] || order.processor}
                </ProcessorBadge>
              </PaymentMethodInfo>
            </OrderDetailSection>
          )}

          {approvedRefunds.length > 0 && (
            <OrderDetailSection>
              <OrderDetailSectionTitle>Refund History</OrderDetailSectionTitle>
              <RefundsList>
                {approvedRefunds.map((refund) => (
                  <RefundItem key={refund.id}>
                    <RefundItemHeader>
                      <RefundAmount>
                        {formatMoney(refund.amountCents)}
                      </RefundAmount>
                      <RefundDate>
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </RefundDate>
                    </RefundItemHeader>
                    {refund.reason && (
                      <RefundReason>{refund.reason}</RefundReason>
                    )}
                  </RefundItem>
                ))}
              </RefundsList>
            </OrderDetailSection>
          )}

          {isRefundable() && (
            <OrderDetailSection>
              <CollapsibleSection
                title="Request Refund"
                description="Submit a refund request for this order"
                isOpen={refundSectionOpen}
                onToggle={() => setRefundSectionOpen(!refundSectionOpen)}
              >
                <RefundForm
                  orderId={order.id}
                  onSuccess={handleRefundSuccess}
                />
              </CollapsibleSection>
            </OrderDetailSection>
          )}
        </StyledOrderDetail>
      </Card>
    </AccountSection>
  )
}
