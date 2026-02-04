"use client"

import { useEffect, useRef, useState } from "react"
import PaymentFormWrapper from "@/components/payment/PaymentFormWrapper"
import { usePayment } from "@/contexts/PaymentContext"
import { useAuth } from "@/contexts/AuthContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import { PAYMENT_PROCESSOR } from "@/constants.js"
import {
  PaymentContainer,
  SectionHeader,
  ButtonCheckout,
  UserInfoCard,
  UserInfoNotice,
  UserInfoHeaderButton,
  UserInfoHeaderContent,
  UserInfoHeaderTitle,
  UserInfoHeaderDescription,
  UserInfoHeaderMeta,
  UserInfoSuccessBanner,
  UserInfoBody,
  PaymentOptionCard,
  PaymentOptionHeader,
  PaymentOptionGroup,
  PaymentOptionRow,
  PaymentOptionRadio,
  PaymentOptionInfo,
  PaymentOptionTitle,
  PaymentOptionDescription,
  PaymentOptionControls,
  PaymentOptionSelect,
} from "@/components/payment/paymentStyles"
import UserInfoForm from "@/components/userInfo/UserInfoForm"

export default function PaymentSection() {
  const { user } = useAuth()
  const {
    cart,
    isCheckingOut,
    isFeesLoading,
    isPaymentFormReady,
    checkout,
    getCartTotalCents,
    getCheckoutAmountCents,
    getDownPaymentCents,
    hasService,
    paymentMode,
    setPaymentMode,
    financingCadence,
    setFinancingCadence,
    financingTermCount,
    setFinancingTermCount,
  } = usePayment()
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(true)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const hasToggledRef = useRef(false)

  const totalCents = getCartTotalCents()
  const checkoutAmountCents = getCheckoutAmountCents()
  const downPaymentCents = getDownPaymentCents()
  let canCheckout = false
  const requiresPhoneNumber = hasService()
  const isFinancingSupported = PAYMENT_PROCESSOR === "stripe"
  const canUseFinancing = isFinancingSupported && downPaymentCents > 0
  let financingTerms = [6, 12]
  if (financingCadence === "WEEKLY") {
    financingTerms = [4, 8, 12]
  }

  useEffect(() => {
    if (!canUseFinancing && paymentMode === "financing") {
      setPaymentMode("full")
    }
  }, [canUseFinancing, paymentMode, setPaymentMode])

  const getTrimmedValue = (value) => {
    if (typeof value !== "string") {
      return ""
    }
    return value.trim()
  }

  const hasRequiredUserInfo = () => {
    if (!user) {
      return false
    }

    if (!getTrimmedValue(user.fullName)) {
      return false
    }
    if (!getTrimmedValue(user.billingAddressLine1)) {
      return false
    }
    if (!getTrimmedValue(user.billingCity)) {
      return false
    }
    if (!getTrimmedValue(user.billingRegion)) {
      return false
    }
    if (!getTrimmedValue(user.billingPostalCode)) {
      return false
    }
    if (!getTrimmedValue(user.billingCountry)) {
      return false
    }
    if (requiresPhoneNumber && !getTrimmedValue(user.phoneNumber)) {
      return false
    }

    return true
  }

  const isUserInfoComplete = hasRequiredUserInfo()
  let userInfoMessage = ""

  useEffect(() => {
    if (!hasToggledRef.current) {
      setIsUserInfoOpen(!isUserInfoComplete)
    }
  }, [isUserInfoComplete])

  if (!user) {
    userInfoMessage = "Sign in to add your billing details."
  } else if (!getTrimmedValue(user.fullName)) {
    userInfoMessage = "Add your full name to continue."
  } else if (!getTrimmedValue(user.billingAddressLine1)) {
    userInfoMessage = "Add your billing address to continue."
  } else if (!getTrimmedValue(user.billingCity)) {
    userInfoMessage = "Add your billing city to continue."
  } else if (!getTrimmedValue(user.billingRegion)) {
    userInfoMessage = "Add your billing state or region to continue."
  } else if (!getTrimmedValue(user.billingPostalCode)) {
    userInfoMessage = "Add your billing postal code to continue."
  } else if (!getTrimmedValue(user.billingCountry)) {
    userInfoMessage = "Add your billing country to continue."
  } else if (requiresPhoneNumber && !getTrimmedValue(user.phoneNumber)) {
    userInfoMessage = "Add your phone number to continue."
  }

  const handleToggleUserInfo = () => {
    hasToggledRef.current = true
    setIsUserInfoOpen((prev) => !prev)
  }

  const handleUserInfoSaved = () => {
    setShowSuccessBanner(true)
    setIsUserInfoOpen(false)
    hasToggledRef.current = true

    window.setTimeout(() => {
      setShowSuccessBanner(false)
    }, 3000)
  }

  if (
    cart.length > 0 &&
    totalCents > 0 &&
    !isFeesLoading &&
    isPaymentFormReady &&
    isUserInfoComplete
  ) {
    canCheckout = true
  }

  let checkoutLabel = `Pay ${formatMoney(totalCents)}`
  if (paymentMode === "financing") {
    checkoutLabel = `Pay ${formatMoney(checkoutAmountCents)} down payment`
  }
  if (isFeesLoading) {
    checkoutLabel = "Calculating fees..."
  }
  if (!isPaymentFormReady) {
    checkoutLabel = "Loading payment form..."
  }
  if (isCheckingOut) {
    checkoutLabel = "Processing..."
  }

  return (
    <PaymentContainer>
      <SectionHeader>
        <h2>Payment</h2>
      </SectionHeader>

      <PaymentOptionCard>
        <PaymentOptionHeader>
          <h3>Payment options</h3>
          <p>Select how you want to pay for this order.</p>
        </PaymentOptionHeader>
        <PaymentOptionGroup>
          <PaymentOptionRow>
            <PaymentOptionRadio
              type="radio"
              name="paymentMode"
              checked={paymentMode === "full"}
              onChange={() => setPaymentMode("full")}
            />
            <PaymentOptionInfo>
              <PaymentOptionTitle>Pay in full</PaymentOptionTitle>
              <PaymentOptionDescription>
                Pay the full amount today.
              </PaymentOptionDescription>
            </PaymentOptionInfo>
          </PaymentOptionRow>
          <PaymentOptionRow>
            <PaymentOptionRadio
              type="radio"
              name="paymentMode"
              checked={paymentMode === "financing"}
              onChange={() => setPaymentMode("financing")}
              disabled={!canUseFinancing}
            />
            <PaymentOptionInfo>
              <PaymentOptionTitle>Finance your order</PaymentOptionTitle>
              <PaymentOptionDescription>
                Pay a down payment now and the rest over time.
              </PaymentOptionDescription>
              {paymentMode === "financing" && (
                <PaymentOptionControls>
                  <PaymentOptionSelect
                    value={financingCadence}
                    onChange={(event) =>
                      setFinancingCadence(event.target.value)
                    }
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </PaymentOptionSelect>
                  <PaymentOptionSelect
                    value={String(financingTermCount)}
                    onChange={(event) =>
                      setFinancingTermCount(
                        Number.parseInt(event.target.value, 10)
                      )
                    }
                  >
                    {financingTerms.map((termCount) => (
                      <option key={termCount} value={String(termCount)}>
                        {termCount} payments
                      </option>
                    ))}
                  </PaymentOptionSelect>
                </PaymentOptionControls>
              )}
              {paymentMode === "financing" && (
                <PaymentOptionDescription>
                  Down payment today: {formatMoney(downPaymentCents)}
                </PaymentOptionDescription>
              )}
              {!isFinancingSupported && (
                <PaymentOptionDescription>
                  Financing is only available with Stripe payments.
                </PaymentOptionDescription>
              )}
              {isFinancingSupported && downPaymentCents <= 0 && (
                <PaymentOptionDescription>
                  Financing is unavailable for this total.
                </PaymentOptionDescription>
              )}
            </PaymentOptionInfo>
          </PaymentOptionRow>
        </PaymentOptionGroup>
      </PaymentOptionCard>

      <UserInfoCard>
        <UserInfoHeaderButton type="button" onClick={handleToggleUserInfo}>
          <UserInfoHeaderContent>
            <UserInfoHeaderTitle>Billing details</UserInfoHeaderTitle>
            <UserInfoHeaderDescription>
              These details are saved to your account for faster checkout.
            </UserInfoHeaderDescription>
          </UserInfoHeaderContent>
          <UserInfoHeaderMeta>
            {showSuccessBanner && (
              <UserInfoSuccessBanner>Details saved</UserInfoSuccessBanner>
            )}
            <span>{isUserInfoOpen ? "−" : "+"}</span>
          </UserInfoHeaderMeta>
        </UserInfoHeaderButton>
        {isUserInfoOpen && (
          <UserInfoBody>
            <UserInfoForm
              showHeader={false}
              showSuccessMessage={false}
              isNameRequired
              isAddressRequired
              isPhoneRequired={requiresPhoneNumber}
              submitLabel="Save"
              onSaveSuccess={handleUserInfoSaved}
            />
            {userInfoMessage && (
              <UserInfoNotice>{userInfoMessage}</UserInfoNotice>
            )}
          </UserInfoBody>
        )}
      </UserInfoCard>

      <PaymentFormWrapper />

      <ButtonCheckout
        onClick={checkout}
        disabled={!canCheckout || isCheckingOut}
      >
        {checkoutLabel}
      </ButtonCheckout>
    </PaymentContainer>
  )
}
