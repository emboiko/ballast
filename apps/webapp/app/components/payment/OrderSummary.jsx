"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePayment } from "@/contexts/PaymentContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import {
  CartContainer,
  SectionHeader,
  EditCartLink,
  CartItemsArea,
  CartList,
  CartItemSummary,
  CartItemName,
  CartItemLink,
  CartItemNameText,
  CartItemPriceText,
  CartFooter,
  FeeList,
  FeeRow,
  FeeLabel,
  FeeAmount,
  CartTotal,
} from "@/components/payment/paymentStyles"

export default function OrderSummary() {
  const {
    cart,
    fees,
    isFeesLoading,
    feesError,
    getCartSubtotalCents,
    getCartTotalCents,
    requestCartFees,
  } = usePayment()
  const router = useRouter()

  const getItemTotalCents = (item) => {
    return (item.priceCents || 0) * (item.quantity || 1)
  }

  useEffect(() => {
    if (cart.length === 0) {
      return
    }
    requestCartFees()
  }, [cart, requestCartFees])

  let feeRows = null
  if (isFeesLoading) {
    feeRows = (
      <FeeRow>
        <FeeLabel>Loading fees...</FeeLabel>
        <FeeAmount>—</FeeAmount>
      </FeeRow>
    )
  } else if (feesError) {
    feeRows = (
      <FeeRow>
        <FeeLabel>Fees unavailable</FeeLabel>
        <FeeAmount>—</FeeAmount>
      </FeeRow>
    )
  } else if (fees.length > 0) {
    feeRows = fees.map((fee) => {
      return (
        <FeeRow key={fee.id}>
          <FeeLabel>{fee.label}</FeeLabel>
          <FeeAmount>{formatMoney(fee.amountCents)}</FeeAmount>
        </FeeRow>
      )
    })
  }

  return (
    <CartContainer>
      <SectionHeader>
        <h2>Order Summary</h2>
        <EditCartLink onClick={() => router.push("/cart")}>
          Edit Cart
        </EditCartLink>
      </SectionHeader>
      <CartItemsArea>
        <CartList>
          {cart.map((item) => {
            const isService = item.type === "service"
            const itemUrl = isService
              ? `/services/${item.slug}`
              : `/products/${item.slug}`

            return (
              <CartItemSummary key={item.id}>
                <CartItemName>
                  <CartItemLink
                    href={itemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CartItemNameText>{item.name}</CartItemNameText>
                  </CartItemLink>
                  <CartItemPriceText>
                    {" - "}
                    {formatMoney(item.priceCents)}
                    {!isService &&
                      item.quantity > 1 &&
                      ` × ${item.quantity} = ${formatMoney(getItemTotalCents(item))}`}
                  </CartItemPriceText>
                </CartItemName>
              </CartItemSummary>
            )
          })}
        </CartList>
      </CartItemsArea>
      <CartFooter>
        {cart.length > 0 && (
          <FeeList>
            <FeeRow>
              <FeeLabel>Subtotal</FeeLabel>
              <FeeAmount>{formatMoney(getCartSubtotalCents())}</FeeAmount>
            </FeeRow>
            {feeRows}
          </FeeList>
        )}
        <CartTotal>Total: {formatMoney(getCartTotalCents())}</CartTotal>
      </CartFooter>
    </CartContainer>
  )
}
