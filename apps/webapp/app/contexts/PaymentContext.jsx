"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react"
import { useRouter } from "next/navigation"
import {
  createStripeIntent as createStripeIntentGateway,
  confirmStripePayment as confirmStripePaymentGateway,
  cancelStripeIntent as cancelStripeIntentGateway,
} from "@/gateways/paymentsGateway"
import { createFinancingPlan as createFinancingPlanGateway } from "@/gateways/financingGateway"
import { fetchCartFees as fetchCartFeesGateway } from "@/gateways/feesGateway"
import { loadCartFromStorage, saveCartToStorage } from "@/utils/cart"
import { percentOfMoney } from "@ballast/shared/src/money.js"

const PaymentContext = createContext(undefined)

export function PaymentProvider({ children }) {
  const router = useRouter()
  const DOWN_PAYMENT_PERCENT = 20
  const [cart, setCart] = useState([])
  const [fees, setFees] = useState([])
  const [isFeesLoading, setIsFeesLoading] = useState(false)
  const [feesError, setFeesError] = useState(null)
  const [hasLoadedFees, setHasLoadedFees] = useState(false)
  const [isPaymentFormReady, setIsPaymentFormReady] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState("stripe")
  const [paymentMode, setPaymentMode] = useState("full")
  const [financingCadence, setFinancingCadence] = useState("MONTHLY")
  const [financingTermCount, setFinancingTermCount] = useState(6)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutResult, setCheckoutResult] = useState(null)

  // Ref to hold the processor-specific checkout handler
  const checkoutHandlerRef = useRef(null)
  const hasLoadedCartRef = useRef(false)
  const lastFeesSignatureRef = useRef(null)

  useEffect(() => {
    const storedCart = loadCartFromStorage()
    if (storedCart.length > 0) {
      setCart(storedCart)
    }
    hasLoadedCartRef.current = true
  }, [])

  useEffect(() => {
    if (!hasLoadedCartRef.current) {
      return
    }
    saveCartToStorage(cart)
  }, [cart])

  useEffect(() => {
    if (checkoutResult?.success && cart.length > 0) {
      setCheckoutResult(null)
    }
  }, [checkoutResult, cart])

  useEffect(() => {
    if (cart.length === 0) {
      setFees([])
      setFeesError(null)
      setHasLoadedFees(true)
      lastFeesSignatureRef.current = null
      return
    }
    setHasLoadedFees(false)
  }, [cart])

  const buildCartSignature = useCallback((cartItems) => {
    const signatureItems = cartItems.map((item) => {
      return {
        id: item.id,
        priceCents: item.priceCents,
        quantity: item.quantity || 1,
        type: item.type,
        subscriptionInterval: item.subscriptionInterval,
      }
    })
    return JSON.stringify(signatureItems)
  }, [])

  const addToCart = useCallback((item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id)

      // Cart prices are locked at add-to-cart for consistency.
      // If we raised the price, good for the customer
      // If we lowered the price, good for the business

      // Services can only be added once (no duplicates)
      if (item.type === "service" && existingItem) {
        return prevCart // Don't add duplicate services
      }

      // Products can have multiple quantities
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        )
      }
      return [...prevCart, { ...item, quantity: item.quantity || 1 }]
    })
  }, [])

  const removeFromCart = useCallback((itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }, [])

  const updateQuantity = useCallback(
    (itemId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(itemId)
        return
      }
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      )
    },
    [removeFromCart]
  )

  const clearCart = useCallback(() => {
    setCart([])
    setFees([])
    setFeesError(null)
    setHasLoadedFees(true)
    lastFeesSignatureRef.current = null
  }, [])

  const hasService = useCallback(() => {
    return cart.some((item) => item.type === "service")
  }, [cart])

  // Returns subtotal in cents (integer)
  const getCartSubtotalCents = useCallback(() => {
    return cart.reduce(
      (sum, item) => sum + (item.priceCents || 0) * (item.quantity || 1),
      0
    )
  }, [cart])

  // Returns fees total in cents (integer)
  const getFeesTotalCents = useCallback(() => {
    return fees.reduce((sum, fee) => sum + (fee.amountCents || 0), 0)
  }, [fees])

  // Returns total in cents (integer)
  const getCartTotalCents = useCallback(() => {
    return getCartSubtotalCents() + getFeesTotalCents()
  }, [getCartSubtotalCents, getFeesTotalCents])

  const getDownPaymentCents = useCallback(() => {
    const totalCents = getCartTotalCents()
    if (totalCents <= 0) {
      return 0
    }
    return percentOfMoney(totalCents, DOWN_PAYMENT_PERCENT)
  }, [getCartTotalCents, DOWN_PAYMENT_PERCENT])

  const getCheckoutAmountCents = useCallback(() => {
    if (paymentMode === "financing") {
      return getDownPaymentCents()
    }
    return getCartTotalCents()
  }, [getCartTotalCents, getDownPaymentCents, paymentMode])

  const requestCartFees = useCallback(
    async (cartItemsOverride = null) => {
      let cartItems = cart
      if (Array.isArray(cartItemsOverride)) {
        cartItems = cartItemsOverride
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        setFees([])
        setFeesError(null)
        setHasLoadedFees(true)
        lastFeesSignatureRef.current = null
        return { success: false, error: "Cart is empty" }
      }

      const signature = buildCartSignature(cartItems)
      if (lastFeesSignatureRef.current === signature && fees.length > 0) {
        return { success: true, fees }
      }

      setIsFeesLoading(true)
      setFeesError(null)

      let userAgent = undefined
      if (typeof navigator !== "undefined") {
        userAgent = navigator.userAgent
      }

      try {
        const data = await fetchCartFeesGateway(cartItems, userAgent)
        let fetchedFees = []
        if (Array.isArray(data.fees)) {
          fetchedFees = data.fees
        }
        setFees(fetchedFees)
        setHasLoadedFees(true)
        lastFeesSignatureRef.current = signature
        return { success: true, fees: fetchedFees }
      } catch (error) {
        setFeesError(error.message)
        setHasLoadedFees(false)
        return { success: false, error: error.message }
      } finally {
        setIsFeesLoading(false)
      }
    },
    [cart, fees, buildCartSignature]
  )

  // Called by payment form components to register their checkout handler
  const registerCheckoutHandler = useCallback(
    (handler) => {
      checkoutHandlerRef.current = handler
      const isReady = typeof handler === "function"
      setIsPaymentFormReady(isReady)
      if (isReady && checkoutResult?.error === "Payment form not ready") {
        setCheckoutResult(null)
      }
    },
    [checkoutResult]
  )

  // Main checkout function - delegates to the registered processor handler
  const checkout = useCallback(async () => {
    const totalCents = getCartTotalCents()
    const checkoutAmountCents = getCheckoutAmountCents()

    if (totalCents <= 0) {
      setCheckoutResult({ success: false, error: "Cart is empty" })
      return
    }

    if (!checkoutHandlerRef.current) {
      setCheckoutResult({ success: false, error: "Payment form not ready" })
      return
    }

    setIsCheckingOut(true)
    setCheckoutResult(null)

    try {
      const result = await checkoutHandlerRef.current(checkoutAmountCents)

      if (result.success && paymentMode === "financing") {
        if (!result.paymentIntentId) {
          setCheckoutResult({
            success: false,
            error: "Payment method confirmation failed",
          })
          return
        }

        const financingResult = await createFinancingPlanGateway({
          paymentIntentId: result.paymentIntentId,
          cartItems: cart,
          fees,
          cadence: financingCadence,
          termCount: financingTermCount,
        })

        if (!financingResult.success) {
          setCheckoutResult({
            success: false,
            error: financingResult.error || "Failed to create financing plan",
          })
          return
        }

        setCart([])
        setFees([])
        setFeesError(null)
        setHasLoadedFees(true)
        lastFeesSignatureRef.current = null
        setCheckoutResult({
          success: true,
          orderId: financingResult.orderId,
          planId: financingResult.planId,
          message: "Financing plan created successfully!",
        })
        router.push(`/account/financing/${financingResult.planId}`)
      } else if (result.success) {
        setCart([])
        setFees([])
        setFeesError(null)
        setHasLoadedFees(true)
        lastFeesSignatureRef.current = null
        setCheckoutResult({
          success: true,
          orderId: result.orderId,
          message: "Payment successful!",
        })
        router.push("/order-success")
      } else if (result.error) {
        setCheckoutResult({
          success: false,
          error: result.error,
        })
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setCheckoutResult({
        success: false,
        error: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }, [
    cart,
    fees,
    financingCadence,
    financingTermCount,
    getCartTotalCents,
    getCheckoutAmountCents,
    paymentMode,
    router,
  ])

  // Clear the checkout result
  const clearCheckoutResult = useCallback(() => {
    setCheckoutResult(null)
  }, [])

  // Create a Stripe payment intent
  const createStripeIntent = useCallback(async (amountCents) => {
    try {
      const data = await createStripeIntentGateway(amountCents)
      return { success: true, ...data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // Confirm a Stripe payment and create order record
  const confirmStripePayment = useCallback(
    async (paymentIntentId, cartItems) => {
      try {
        const result = await confirmStripePaymentGateway(
          paymentIntentId,
          cartItems
        )
        return result
      } catch (err) {
        console.error("Payment confirmation error:", err)
        return {
          success: false,
          error: err.message || "Failed to confirm payment",
        }
      }
    },
    []
  )

  const cancelStripeIntent = useCallback(async (paymentIntentId) => {
    if (!paymentIntentId) {
      return { success: false, error: "Payment intent ID is required" }
    }
    try {
      await cancelStripeIntentGateway(paymentIntentId)
      return { success: true }
    } catch (err) {
      console.error("Cancel intent error:", err)
      return { success: false, error: err.message || "Failed to cancel intent" }
    }
  }, [])

  const value = {
    cart,
    fees,
    isFeesLoading,
    feesError,
    hasLoadedFees,
    isPaymentFormReady,
    paymentProvider,
    paymentMode,
    financingCadence,
    financingTermCount,
    isCheckingOut,
    checkoutResult,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    hasService,
    getCartSubtotalCents,
    getFeesTotalCents,
    getCartTotalCents,
    getDownPaymentCents,
    getCheckoutAmountCents,
    requestCartFees,
    checkout,
    clearCheckoutResult,
    setPaymentProvider,
    setPaymentMode,
    setFinancingCadence,
    setFinancingTermCount,
    registerCheckoutHandler,
    createStripeIntent,
    confirmStripePayment,
    cancelStripeIntent,
  }

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider")
  }
  return context
}
