"use client"

import { useEffect } from "react"
import Link from "next/link"
import { formatMoney } from "@ballast/shared/src/money.js"
import { useOrders } from "@/contexts/OrdersContext"
import {
  OrdersList as StyledOrdersList,
  OrderItem,
  OrderHeader,
  OrderIdLink,
  OrderStatus,
  OrderDetails,
  OrderAmount,
  OrderDate,
  EmptyState,
} from "@/components/account/accountStyles"
import {
  TextSecondary,
  ErrorText,
  ButtonPrimary,
  ButtonSecondary,
  LoadMoreContainer,
} from "@/components/ui/uiStyles"

export default function OrdersList() {
  const {
    orders,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    fetchOrders,
    loadMoreOrders,
  } = useOrders()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (isLoading) {
    return <TextSecondary>Loading orders...</TextSecondary>
  }

  if (error) {
    return <ErrorText>Error: {error}</ErrorText>
  }

  if (orders.length === 0) {
    return (
      <EmptyState>
        <TextSecondary>No orders yet.</TextSecondary>
        <ButtonPrimary as={Link} href="/checkout">
          Start Shopping
        </ButtonPrimary>
      </EmptyState>
    )
  }

  return (
    <>
      <StyledOrdersList>
        {orders.map((order) => (
          <OrderItem key={order.id}>
            <OrderHeader>
              <OrderIdLink as={Link} href={`/account/orders/${order.id}`}>
                Order #{order.id}
              </OrderIdLink>
              <OrderStatus $status={order.status}>{order.status}</OrderStatus>
            </OrderHeader>
            <OrderDetails>
              <OrderAmount>{formatMoney(order.amountCents)}</OrderAmount>
              <OrderDate>
                {new Date(order.createdAt).toLocaleDateString()}
              </OrderDate>
            </OrderDetails>
          </OrderItem>
        ))}
      </StyledOrdersList>
      {hasMore && (
        <LoadMoreContainer>
          <ButtonSecondary onClick={loadMoreOrders} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading..." : "Load More"}
          </ButtonSecondary>
        </LoadMoreContainer>
      )}
    </>
  )
}
