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
  CartEmptyItem,
  CartItem,
  CartItemName,
  CartItemLink,
  CartItemNameText,
  CartItemPriceText,
  QuantityControls,
  QuantityButton,
  ButtonRemove,
  CartFooter,
  FeeList,
  FeeRow,
  FeeLabel,
  FeeAmount,
  CartTotal,
  CartActions,
  ButtonPayNow,
} from "@/components/payment/paymentStyles"

export default function Cart() {
  const {
    cart,
    fees,
    isFeesLoading,
    feesError,
    getCartSubtotalCents,
    getCartTotalCents,
    requestCartFees,
    removeFromCart,
    updateQuantity,
    clearCart,
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
        <h2>Cart</h2>
        {cart.length > 0 && (
          <EditCartLink onClick={clearCart}>Clear Cart</EditCartLink>
        )}
      </SectionHeader>
      <CartItemsArea>
        <CartList>
          {cart.length === 0 ? (
            <CartEmptyItem>Cart is empty</CartEmptyItem>
          ) : (
            cart.map((item) => {
              const isService = item.type === "service"
              const itemUrl = isService
                ? `/services/${item.slug}`
                : `/products/${item.slug}`

              return (
                <CartItem key={item.id}>
                  <div>
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
                    {!isService && (
                      <QuantityControls>
                        <QuantityButton
                          onClick={() =>
                            updateQuantity(item.id, (item.quantity || 1) - 1)
                          }
                        >
                          −
                        </QuantityButton>
                        <span>Qty: {item.quantity || 1}</span>
                        <QuantityButton
                          onClick={() =>
                            updateQuantity(item.id, (item.quantity || 1) + 1)
                          }
                        >
                          +
                        </QuantityButton>
                      </QuantityControls>
                    )}
                  </div>
                  <ButtonRemove
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    ×
                  </ButtonRemove>
                </CartItem>
              )
            })
          )}
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
        <CartActions>
          <ButtonPayNow
            onClick={() => {
              if (cart.length > 0) {
                router.push("/checkout")
              }
            }}
            disabled={cart.length === 0}
          >
            Pay Now
          </ButtonPayNow>
        </CartActions>
      </CartFooter>
    </CartContainer>
  )
}
