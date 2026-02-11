"use client"

import Link from "next/link"
import { usePayment } from "@/contexts/PaymentContext"
import { useSubscriptions } from "@/contexts/SubscriptionsContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import { useEffect, useMemo, useState } from "react"
import {
  ServiceDetailPage,
  ServiceDetailBack,
  ServiceDetailContent,
  ServiceDetailImageColumn,
  ServiceDetailImage,
  ServiceImageFallbackLarge,
  ServiceDetailImageAsset,
  ServiceDetailThumbnailButton,
  ServiceDetailThumbnailImage,
  ServiceDetailThumbnailRow,
  ServiceDetailInfo,
  ServiceDetailHeader,
  ServiceDetailName,
  ServiceDetailPrice,
  ServiceDetailPriceSuffix,
  ServiceDetailDescription,
  ServiceDetailLongDescription,
  ServiceDetailActions,
  ServiceDetailError,
  BillingIntervalSection,
  BillingIntervalTitle,
  BillingIntervalList,
  BillingIntervalOption,
  BillingIntervalRadio,
  BillingIntervalOptionPrice,
  ServiceDetailSubscribedNotice,
} from "@/components/services/serviceStyles"
import {
  ButtonPrimary,
  ButtonSuccessLarge,
  ButtonLarge,
} from "@/components/ui/uiStyles"

const formatIntervalLabel = (interval) => {
  if (interval === "MONTHLY") {
    return "Monthly"
  }
  if (interval === "QUARTERLY") {
    return "Quarterly"
  }
  if (interval === "SEMI_ANNUAL") {
    return "6-month"
  }
  if (interval === "ANNUAL") {
    return "12-month"
  }
  return interval
}

export default function ServiceDetail({ service, isLoading = false }) {
  const { cart, addToCart } = usePayment()
  const { getActiveSubscriptionForServiceId, isLoadingSubscriptions } =
    useSubscriptions()
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedInterval, setSelectedInterval] = useState(null)

  const cartItem = cart.find((item) => item.id === service?.id)
  const isInCart = !!cartItem
  const activeSubscription = getActiveSubscriptionForServiceId(service?.id)
  const isAlreadySubscribed = Boolean(activeSubscription)

  const images = Array.isArray(service?.images) ? service.images : []
  let primaryImageIndex = 0
  if (images.length > 0) {
    const primaryIndex = images.findIndex((image) => image.isPrimary)
    if (primaryIndex >= 0) {
      primaryImageIndex = primaryIndex
    }
  }

  useEffect(() => {
    if (images.length === 0) {
      setActiveImageIndex(0)
      return
    }
    setActiveImageIndex(primaryImageIndex)
  }, [images.length, primaryImageIndex])

  const enabledIntervals = useMemo(() => {
    const intervalPrices = service?.intervalPrices
    if (!Array.isArray(intervalPrices)) {
      return []
    }

    return intervalPrices
      .filter((item) => item && item.isEnabled === true)
      .filter((item) => typeof item.interval === "string")
      .filter(
        (item) => Number.isInteger(item.priceCents) && item.priceCents > 0
      )
  }, [service?.intervalPrices])

  useEffect(() => {
    if (!service) {
      setSelectedInterval(null)
      return
    }

    if (enabledIntervals.length === 0) {
      setSelectedInterval("MONTHLY")
      return
    }

    const existingSelection = enabledIntervals.find(
      (item) => item.interval === selectedInterval
    )
    if (existingSelection) {
      return
    }

    const monthlyOption = enabledIntervals.find(
      (item) => item.interval === "MONTHLY"
    )
    if (monthlyOption) {
      setSelectedInterval("MONTHLY")
      return
    }

    setSelectedInterval(enabledIntervals[0].interval)
  }, [enabledIntervals, selectedInterval, service])

  if (isLoading) {
    return (
      <ServiceDetailError>
        <h1>Loading service...</h1>
        <p>Please wait while we fetch the latest details.</p>
      </ServiceDetailError>
    )
  }

  if (!service) {
    return (
      <ServiceDetailError>
        <h1>Service Not Found</h1>
        <p>The service you're looking for doesn't exist.</p>
        <ButtonPrimary as={Link} href="/services">
          Back to Services
        </ButtonPrimary>
      </ServiceDetailError>
    )
  }

  const handleAddToCart = () => {
    if (isInCart) {
      return // Service already in cart, don't add again
    }

    let interval = selectedInterval
    if (!interval) {
      interval = "MONTHLY"
    }

    let priceCents = service.priceCents
    const intervalMatch = enabledIntervals.find(
      (item) => item.interval === interval
    )
    if (intervalMatch) {
      priceCents = intervalMatch.priceCents
    }

    const intervalLabel = formatIntervalLabel(interval)
    addToCart({
      id: service.id,
      slug: service.slug,
      name: `${service.name} (${intervalLabel})`,
      priceCents,
      quantity: 1,
      type: "service",
      subscriptionInterval: interval,
    })
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
    }, 3000)
  }

  let imageContent = (
    <ServiceImageFallbackLarge>
      <span>⚙️</span>
    </ServiceImageFallbackLarge>
  )
  const activeImage = images[activeImageIndex]
  if (activeImage?.url) {
    imageContent = (
      <ServiceDetailImageAsset
        src={activeImage.url}
        alt={service.name}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    )
  }

  let actionButton = null
  if (addedToCart) {
    actionButton = (
      <ButtonSuccessLarge disabled>✓ Added to Cart</ButtonSuccessLarge>
    )
  } else if (isInCart) {
    actionButton = (
      <ButtonSuccessLarge disabled>✓ Already in Cart</ButtonSuccessLarge>
    )
  } else if (isAlreadySubscribed) {
    actionButton = (
      <>
        <ServiceDetailSubscribedNotice>
          You’re already subscribed to this service.
        </ServiceDetailSubscribedNotice>
        <ButtonSuccessLarge disabled>✓ Already subscribed</ButtonSuccessLarge>
      </>
    )
  } else {
    actionButton = (
      <>
        {enabledIntervals.length > 0 && (
          <BillingIntervalSection>
            <BillingIntervalTitle>Billing interval</BillingIntervalTitle>
            <BillingIntervalList>
              {enabledIntervals.map((option) => {
                const isSelected = option.interval === selectedInterval
                return (
                  <BillingIntervalOption key={option.interval}>
                    <BillingIntervalRadio
                      type="radio"
                      name="subscriptionInterval"
                      value={option.interval}
                      checked={isSelected}
                      onChange={() => setSelectedInterval(option.interval)}
                    />
                    <span>{formatIntervalLabel(option.interval)}</span>
                    <BillingIntervalOptionPrice>
                      {formatMoney(option.priceCents)}
                    </BillingIntervalOptionPrice>
                  </BillingIntervalOption>
                )
              })}
            </BillingIntervalList>
          </BillingIntervalSection>
        )}
        <ButtonLarge as="button" onClick={handleAddToCart}>
          Add to Cart
        </ButtonLarge>
        {isLoadingSubscriptions && (
          <ServiceDetailSubscribedNotice>
            Checking subscription…
          </ServiceDetailSubscribedNotice>
        )}
      </>
    )
  }

  let displayPriceCents = service.priceCents
  if (selectedInterval) {
    const match = enabledIntervals.find(
      (item) => item.interval === selectedInterval
    )
    if (match) {
      displayPriceCents = match.priceCents
    }
  }

  return (
    <ServiceDetailPage>
      <ServiceDetailBack as={Link} href="/services">
        ← Back to Services
      </ServiceDetailBack>

      <ServiceDetailContent>
        <ServiceDetailImageColumn>
          <ServiceDetailImage>{imageContent}</ServiceDetailImage>
          {images.length > 1 && (
            <ServiceDetailThumbnailRow>
              {images.map((image, index) => {
                const isActive = index === activeImageIndex
                return (
                  <ServiceDetailThumbnailButton
                    key={image.id}
                    type="button"
                    $isActive={isActive}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <ServiceDetailThumbnailImage
                      src={image.url}
                      alt={image.filename || service.name}
                      fill
                    />
                  </ServiceDetailThumbnailButton>
                )
              })}
            </ServiceDetailThumbnailRow>
          )}
        </ServiceDetailImageColumn>

        <ServiceDetailInfo>
          <ServiceDetailHeader>
            <ServiceDetailName>{service.name}</ServiceDetailName>
            <ServiceDetailPrice>
              {formatMoney(displayPriceCents)}
              {selectedInterval === "MONTHLY" && (
                <ServiceDetailPriceSuffix>/month</ServiceDetailPriceSuffix>
              )}
            </ServiceDetailPrice>
          </ServiceDetailHeader>

          <ServiceDetailDescription>
            <h2>Overview</h2>
            <p>{service.description}</p>
          </ServiceDetailDescription>

          {service.longDescription && (
            <ServiceDetailLongDescription>
              <h2>Details</h2>
              <p>{service.longDescription}</p>
            </ServiceDetailLongDescription>
          )}

          <ServiceDetailActions>{actionButton}</ServiceDetailActions>
        </ServiceDetailInfo>
      </ServiceDetailContent>
    </ServiceDetailPage>
  )
}
