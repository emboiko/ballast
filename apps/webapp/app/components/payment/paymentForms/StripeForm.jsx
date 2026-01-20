"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { STRIPE_PUBLISHABLE_KEY } from "@/constants.js"
import { useTheme } from "@/contexts/ThemeContext"
import { usePayment } from "@/contexts/PaymentContext"
import { ErrorText, TextCentered } from "@/components/ui/uiStyles"
import { PaymentCard } from "@/components/payment/paymentStyles"

// Helper to get CSS variable value as hex color
const getCSSVariable = (variableName) => {
  if (typeof window === "undefined") {
    return null
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()
  return value || null
}

// Convert CSS variable (rgb/rgba/hex) to hex format for Stripe
const cssVarToHex = (variableName) => {
  const value = getCSSVariable(variableName)
  if (!value) {
    return null
  }

  // If it's already hex, return it
  if (value.startsWith("#")) {
    return value
  }

  // If it's rgb/rgba, convert to hex
  if (value.startsWith("rgb")) {
    const match = value.match(/\d+/g)
    if (match && match.length >= 3) {
      const r = parseInt(match[0], 10)
      const g = parseInt(match[1], 10)
      const b = parseInt(match[2], 10)
      return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
    }
  }

  return null
}

// Inner form component that has access to Stripe hooks
function StripeCheckoutForm({ onPaymentSuccess, paymentIntentId }) {
  const stripe = useStripe()
  const elements = useElements()
  const { registerCheckoutHandler, cart, confirmStripePayment } = usePayment()

  // Register the checkout handler with PaymentContext
  useEffect(() => {
    if (!stripe || !elements) {
      return
    }

    const handleCheckout = async (amountCents) => {
      if (!stripe || !elements) {
        return { success: false, error: "Payment not initialized" }
      }

      if (!amountCents || amountCents <= 0) {
        return { success: false, error: "Cart is empty" }
      }

      if (!paymentIntentId) {
        return { success: false, error: "Payment intent not available" }
      }

      try {
        // Submit the form to validate
        const { error: submitError } = await elements.submit()
        if (submitError) {
          return { success: false, error: null }
        }

        // Confirm the payment
        const { error: confirmError, paymentIntent } =
          await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}?payment_status=success`,
            },
            redirect: "if_required",
          })

        if (confirmError) {
          if (
            confirmError.type === "card_error" ||
            confirmError.type === "validation_error"
          ) {
            return { success: false, error: null }
          }
          return { success: false, error: confirmError.message }
        }

        if (!paymentIntent) {
          return { success: false, error: "Payment confirmation failed" }
        }

        if (paymentIntent.status === "processing") {
          return {
            success: false,
            error:
              "Payment is still processing. Please wait and check your email.",
          }
        }

        if (paymentIntent.status === "requires_action") {
          return {
            success: false,
            error:
              "Additional authentication required. Please complete the verification.",
          }
        }

        if (paymentIntent.status !== "succeeded") {
          return {
            success: false,
            error: `Payment not completed (status: ${paymentIntent.status})`,
          }
        }

        // Record the order
        const result = await confirmStripePayment(paymentIntent.id, cart)

        if (result.warning) {
          return {
            success: true,
            orderId: result.orderId,
            warning: result.warning,
          }
        }

        if (onPaymentSuccess) {
          onPaymentSuccess()
        }

        return { success: true, orderId: result.orderId }
      } catch (error) {
        console.error("Checkout error:", error)
        return { success: false, error: error.message || "Checkout failed" }
      }
    }

    registerCheckoutHandler(handleCheckout)

    return () => {
      registerCheckoutHandler(null)
    }
  }, [
    stripe,
    elements,
    registerCheckoutHandler,
    onPaymentSuccess,
    paymentIntentId,
    cart,
    confirmStripePayment,
  ])

  return (
    <PaymentElement
      options={{
        layout: "accordion",
        wallets: { applePay: "never", googlePay: "never" },
      }}
    />
  )
}

// Outer component that sets up the Elements provider
export default function StripeForm() {
  const { theme } = useTheme()
  const {
    getCartTotalCents,
    createStripeIntent,
    checkoutResult,
    isFeesLoading,
    feesError,
    hasLoadedFees,
  } = usePayment()
  const pathname = usePathname()
  const [clientSecret, setClientSecret] = useState("")
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Ref to prevent double intent creation from StrictMode
  const isCreatingRef = useRef(false)

  const stripeKey = STRIPE_PUBLISHABLE_KEY
  const isOnCheckoutPage = pathname === "/checkout"

  const stripePromise = useMemo(() => {
    return stripeKey
      ? loadStripe(stripeKey, {
          developerTools: { assistant: { enabled: false } },
        })
      : null
  }, [stripeKey])

  const appearance = useMemo(() => {
    const primaryColor = cssVarToHex("--button-primary-bg") || "#4CAF50"
    const dangerColor = cssVarToHex("--button-danger-bg") || "#ff4444"

    return theme === "dark"
      ? {
          theme: "night",
          variables: {
            colorPrimary: primaryColor,
            colorBackground: cssVarToHex("--bg-primary") || "#1a1a1a",
            colorText: cssVarToHex("--text-primary") || "#ffffff",
            colorDanger: dangerColor,
            borderRadius: "4px",
          },
        }
      : {
          theme: "stripe",
          variables: {
            colorPrimary: primaryColor,
            borderRadius: "4px",
          },
        }
  }, [theme])

  // Create payment intent when on checkout page (lazy creation)
  useEffect(() => {
    if (!isOnCheckoutPage || !stripeKey) {
      return
    }

    // Don't create intent during successful checkout (cart is being cleared)
    if (checkoutResult?.success) {
      return
    }

    // Prevent double creation from StrictMode or re-renders
    if (clientSecret || isCreatingRef.current) {
      return
    }

    if (isFeesLoading || !hasLoadedFees || feesError) {
      return
    }

    const createIntent = async () => {
      isCreatingRef.current = true
      setIsLoading(true)
      setError(null)

      try {
        const totalCents = getCartTotalCents()
        if (totalCents <= 0) {
          setError("Cart is empty")
          setIsLoading(false)
          isCreatingRef.current = false
          return
        }

        const result = await createStripeIntent(totalCents)
        if (!result.success) {
          throw new Error(result.error || "Failed to initialize payment")
        }
        setClientSecret(result.clientSecret)
        setPaymentIntentId(result.paymentIntentId)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
        isCreatingRef.current = false
      }
    }

    createIntent()
  }, [
    isOnCheckoutPage,
    stripeKey,
    clientSecret,
    getCartTotalCents,
    checkoutResult,
    isFeesLoading,
    feesError,
    hasLoadedFees,
  ])

  // Reset when leaving checkout page
  useEffect(() => {
    if (!isOnCheckoutPage) {
      setClientSecret("")
      setPaymentIntentId("")
      setError(null)
      isCreatingRef.current = false
    }
  }, [isOnCheckoutPage])

  useEffect(() => {
    if (feesError) {
      setError(feesError)
    }
  }, [feesError])

  // Handle successful payment - reset for next payment
  const handlePaymentSuccess = useCallback(() => {
    setClientSecret("")
    setPaymentIntentId("")
    isCreatingRef.current = false
  }, [])

  if (!isOnCheckoutPage) {
    return null
  }

  // Don't render during successful checkout (prevents error flash before redirect)
  if (checkoutResult?.success) {
    return null
  }

  if (error) {
    return (
      <PaymentCard>
        <ErrorText>Error: {error}</ErrorText>
      </PaymentCard>
    )
  }

  if (isLoading || !clientSecret) {
    return (
      <PaymentCard>
        <TextCentered>Initializing payment...</TextCentered>
      </PaymentCard>
    )
  }

  return (
    <PaymentCard>
      {clientSecret && paymentIntentId && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance }}
          key={clientSecret}
        >
          <StripeCheckoutForm
            onPaymentSuccess={handlePaymentSuccess}
            paymentIntentId={paymentIntentId}
          />
        </Elements>
      )}
    </PaymentCard>
  )
}
