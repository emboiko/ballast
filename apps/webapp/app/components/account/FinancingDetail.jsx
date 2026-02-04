"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { STRIPE_PUBLISHABLE_KEY } from "@/constants.js"
import { useTheme } from "@/contexts/ThemeContext"
import {
  formatMoney,
  formatMoneyValue,
  parseMoneyValueToCents,
} from "@ballast/shared/src/money.js"
import {
  fetchFinancingPlan,
  createPrincipalPaymentIntent,
  recordPrincipalPayment,
} from "@/gateways/financingGateway"
import {
  FinancingDetailCard,
  FinancingDetailRow,
  FinancingDetailLabel,
  FinancingDetailValue,
  FinancingForm,
  FinancingField,
  FinancingInput,
  FinancingInputWrapper,
  FinancingInputPrefix,
  FinancingMessageSlot,
  FinancingErrorText,
  FinancingSuccessText,
  FinancingButtonRow,
  ContractContainer,
} from "@/components/account/accountStyles"
import {
  ButtonPrimary,
  ButtonSecondary,
  ContentOrderedList,
  ContentOrderedListItem,
  FormHelpText,
} from "@/components/ui/uiStyles"

const getCSSVariable = (variableName) => {
  if (typeof window === "undefined") {
    return null
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()
  return value || null
}

const cssVarToHex = (variableName) => {
  const value = getCSSVariable(variableName)
  if (!value) {
    return null
  }

  if (value.startsWith("#")) {
    return value
  }

  if (value.startsWith("rgb")) {
    const match = value.match(/\d+/g)
    if (match && match.length >= 3) {
      const red = parseInt(match[0], 10)
      const green = parseInt(match[1], 10)
      const blue = parseInt(match[2], 10)
      return `#${[red, green, blue]
        .map((channel) => channel.toString(16).padStart(2, "0"))
        .join("")}`
    }
  }

  return null
}

const MIN_PRINCIPAL_PAYMENT_CENTS = 500

const normalizeMoneyInput = (value) => {
  if (!value) {
    return ""
  }

  const sanitizedValue = value.replace(/[^\d.]/g, "")
  let nextValue = sanitizedValue
  const firstDotIndex = sanitizedValue.indexOf(".")
  if (firstDotIndex >= 0) {
    const leftSide = sanitizedValue.slice(0, firstDotIndex)
    let rightSide = sanitizedValue.slice(firstDotIndex + 1).replace(/\./g, "")
    if (rightSide.length > 2) {
      rightSide = rightSide.slice(0, 2)
    }
    nextValue = `${leftSide}.${rightSide}`
  }

  return nextValue
}

function PrincipalPaymentElementForm({ planId, onPaymentRecorded, onCancel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirmPayment = useCallback(async () => {
    if (!stripe || !elements) {
      setError("Payment form is not ready.")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setIsSubmitting(false)
        return
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.href,
          },
          redirect: "if_required",
        })

      if (confirmError) {
        setError(confirmError.message || "Payment confirmation failed.")
        setIsSubmitting(false)
        return
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setError("Payment did not complete.")
        setIsSubmitting(false)
        return
      }

      await recordPrincipalPayment({
        planId,
        paymentIntentId: paymentIntent.id,
      })

      onPaymentRecorded()
    } catch (confirmError) {
      setError(confirmError.message || "Failed to record payment.")
    } finally {
      setIsSubmitting(false)
    }
  }, [elements, onPaymentRecorded, planId, stripe])

  return (
    <>
      <FinancingMessageSlot aria-live="polite">
        {error && <FinancingErrorText>{error}</FinancingErrorText>}
      </FinancingMessageSlot>
      <PaymentElement />
      <FinancingButtonRow>
        <ButtonSecondary type="button" onClick={onCancel}>
          Cancel
        </ButtonSecondary>
        <ButtonPrimary
          as="button"
          type="button"
          onClick={handleConfirmPayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Submit payment"}
        </ButtonPrimary>
      </FinancingButtonRow>
    </>
  )
}

function PrincipalPaymentForm({
  planId,
  remainingBalanceCents,
  stripePromise,
  onPaymentRecorded,
  appearance,
}) {
  const [principalAmount, setPrincipalAmount] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const isPaymentLocked = Boolean(clientSecret) || isCreatingIntent

  const resetPaymentSession = useCallback(() => {
    setClientSecret("")
  }, [])

  const handleCreateIntent = useCallback(
    async (event) => {
      event.preventDefault()
      setError(null)
      setSuccessMessage("")

      const amountCents = parseMoneyValueToCents(principalAmount)
      if (!amountCents || amountCents <= 0) {
        setError("Enter a valid payment amount.")
        return
      }

      if (amountCents < MIN_PRINCIPAL_PAYMENT_CENTS) {
        setError(
          `Minimum principal payment is ${formatMoney(
            MIN_PRINCIPAL_PAYMENT_CENTS
          )}.`
        )
        return
      }

      if (amountCents > remainingBalanceCents) {
        setError("Amount exceeds the remaining balance.")
        return
      }

      try {
        setIsCreatingIntent(true)
        const data = await createPrincipalPaymentIntent({
          planId,
          amountCents,
        })
        setClientSecret(data.clientSecret)
      } catch (intentError) {
        setError(intentError.message || "Failed to create payment intent.")
      } finally {
        setIsCreatingIntent(false)
      }
    },
    [planId, principalAmount, remainingBalanceCents]
  )

  const handlePaymentRecorded = useCallback(() => {
    setSuccessMessage("Principal payment recorded.")
    resetPaymentSession()
    setPrincipalAmount("")
    onPaymentRecorded()
  }, [onPaymentRecorded, resetPaymentSession])

  return (
    <FinancingForm onSubmit={handleCreateIntent}>
      <FinancingField htmlFor="principalAmount">
        <span>Principal payment amount</span>
        <FinancingInputWrapper>
          <FinancingInputPrefix>$</FinancingInputPrefix>
          <FinancingInput
            id="principalAmount"
            type="text"
            inputMode="decimal"
            placeholder="25.00"
            value={principalAmount}
            disabled={isPaymentLocked}
            onChange={(event) => {
              const normalizedValue = normalizeMoneyInput(event.target.value)
              if (!normalizedValue) {
                setPrincipalAmount("")
                return
              }

              const amountCents = parseMoneyValueToCents(normalizedValue)
              if (
                Number.isInteger(amountCents) &&
                amountCents > remainingBalanceCents
              ) {
                setPrincipalAmount(formatMoneyValue(remainingBalanceCents))
                return
              }

              setPrincipalAmount(normalizedValue)
            }}
          />
        </FinancingInputWrapper>
      </FinancingField>
      <FormHelpText>
        Enter any amount up to {formatMoney(remainingBalanceCents)}. This
        payment does not change your saved plan card. (Minimum $5)
      </FormHelpText>
      <FinancingMessageSlot aria-live="polite">
        {error && <FinancingErrorText>{error}</FinancingErrorText>}
        {!error && successMessage && (
          <FinancingSuccessText>{successMessage}</FinancingSuccessText>
        )}
      </FinancingMessageSlot>
      {!clientSecret && (
        <FinancingButtonRow>
          <ButtonPrimary as="button" type="submit" disabled={isCreatingIntent}>
            {isCreatingIntent ? "Preparing..." : "Continue to payment"}
          </ButtonPrimary>
        </FinancingButtonRow>
      )}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <PrincipalPaymentElementForm
            planId={planId}
            onPaymentRecorded={handlePaymentRecorded}
            onCancel={resetPaymentSession}
          />
        </Elements>
      )}
    </FinancingForm>
  )
}

export default function FinancingDetail({ planId }) {
  const { theme } = useTheme()
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const appearance = useMemo(() => {
    const primaryColor = cssVarToHex("--button-primary-bg") || "#4CAF50"
    const dangerColor = cssVarToHex("--button-danger-bg") || "#ff4444"

    if (theme === "dark") {
      return {
        theme: "night",
        variables: {
          colorPrimary: primaryColor,
          colorBackground: cssVarToHex("--bg-primary") || "#1a1a1a",
          colorText: cssVarToHex("--text-primary") || "#ffffff",
          colorDanger: dangerColor,
          borderRadius: "4px",
        },
      }
    }

    return {
      theme: "stripe",
      variables: {
        colorPrimary: primaryColor,
        borderRadius: "4px",
      },
    }
  }, [theme])

  const stripePromise = useMemo(() => {
    return STRIPE_PUBLISHABLE_KEY
      ? loadStripe(STRIPE_PUBLISHABLE_KEY, {
          developerTools: { assistant: { enabled: false } },
        })
      : null
  }, [])

  const loadPlan = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchFinancingPlan(planId)
      setPlan(data.plan)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    if (!planId) {
      return
    }
    loadPlan()
  }, [loadPlan, planId])

  if (isLoading) {
    return <p>Loading financing plan...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!plan) {
    return <p>Plan not found.</p>
  }

  let schedule = []
  if (Array.isArray(plan.scheduleJson?.installments)) {
    schedule = plan.scheduleJson.installments
  }
  const paymentMethod = plan.processorPaymentMethod
  let paymentMethodLabel = "Card on file"
  if (paymentMethod?.last4) {
    let brandLabel = "CARD"
    if (paymentMethod.brand) {
      brandLabel = paymentMethod.brand.toUpperCase()
    }
    paymentMethodLabel = `${brandLabel} •••• ${paymentMethod.last4}`
  }

  let scheduleContent = <p>No schedule available.</p>
  if (schedule.length > 0) {
    scheduleContent = (
      <ContentOrderedList>
        {schedule.map((installment) => (
          <ContentOrderedListItem key={installment.sequence}>
            {new Date(installment.dueDate).toLocaleDateString()} ·{" "}
            {formatMoney(installment.amountCents)}
          </ContentOrderedListItem>
        ))}
      </ContentOrderedList>
    )
  }

  let paymentsContent = <p>No payments recorded yet.</p>
  if (plan.payments?.length) {
    paymentsContent = (
      <ContentOrderedList>
        {plan.payments.map((payment) => (
          <ContentOrderedListItem key={payment.id}>
            {new Date(payment.createdAt).toLocaleDateString()} · {payment.type}{" "}
            · {formatMoney(payment.amountCents)}
          </ContentOrderedListItem>
        ))}
      </ContentOrderedList>
    )
  }

  let principalPaymentContent = <p>Stripe is not configured.</p>
  if (stripePromise) {
    principalPaymentContent = (
      <PrincipalPaymentForm
        planId={plan.id}
        remainingBalanceCents={plan.remainingBalanceCents}
        stripePromise={stripePromise}
        appearance={appearance}
        onPaymentRecorded={loadPlan}
      />
    )
  }

  let contractContent = null
  if (plan.contract?.html) {
    contractContent = (
      <FinancingDetailCard>
        <h3>Contract</h3>
        <ContractContainer
          dangerouslySetInnerHTML={{ __html: plan.contract.html }}
        />
      </FinancingDetailCard>
    )
  }

  return (
    <>
      <FinancingDetailCard>
        <FinancingDetailRow>
          <FinancingDetailLabel>Status</FinancingDetailLabel>
          <FinancingDetailValue>{plan.status}</FinancingDetailValue>
        </FinancingDetailRow>
        <FinancingDetailRow>
          <FinancingDetailLabel>Total</FinancingDetailLabel>
          <FinancingDetailValue>
            {formatMoney(plan.totalAmountCents)}
          </FinancingDetailValue>
        </FinancingDetailRow>
        <FinancingDetailRow>
          <FinancingDetailLabel>Down payment</FinancingDetailLabel>
          <FinancingDetailValue>
            {formatMoney(plan.downPaymentCents)}
          </FinancingDetailValue>
        </FinancingDetailRow>
        <FinancingDetailRow>
          <FinancingDetailLabel>Remaining balance</FinancingDetailLabel>
          <FinancingDetailValue>
            {formatMoney(plan.remainingBalanceCents)}
          </FinancingDetailValue>
        </FinancingDetailRow>
        <FinancingDetailRow>
          <FinancingDetailLabel>Cadence</FinancingDetailLabel>
          <FinancingDetailValue>{plan.cadence}</FinancingDetailValue>
        </FinancingDetailRow>
        <FinancingDetailRow>
          <FinancingDetailLabel>Payments</FinancingDetailLabel>
          <FinancingDetailValue>{plan.termCount}</FinancingDetailValue>
        </FinancingDetailRow>
        <FinancingDetailRow>
          <FinancingDetailLabel>Plan card</FinancingDetailLabel>
          <FinancingDetailValue>{paymentMethodLabel}</FinancingDetailValue>
        </FinancingDetailRow>
      </FinancingDetailCard>

      <FinancingDetailCard>
        <h3>Payment schedule</h3>
        {scheduleContent}
      </FinancingDetailCard>

      <FinancingDetailCard>
        <h3>Payment history</h3>
        {paymentsContent}
      </FinancingDetailCard>

      <FinancingDetailCard>
        <h3>Make a principal payment</h3>
        {principalPaymentContent}
      </FinancingDetailCard>

      {contractContent}
    </>
  )
}
