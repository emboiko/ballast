"use client"

import Link from "next/link"
import { usePayment } from "@/contexts/PaymentContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import { useEffect, useState } from "react"
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
  ServiceDetailDescription,
  ServiceDetailLongDescription,
  ServiceDetailActions,
  ServiceDetailError,
} from "@/components/services/serviceStyles"
import {
  ButtonPrimary,
  ButtonSuccessLarge,
  ButtonLarge,
} from "@/components/ui/uiStyles"

export default function ServiceDetail({ service, isLoading = false }) {
  const { cart, addToCart } = usePayment()
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const cartItem = cart.find((item) => item.id === service?.id)
  const isInCart = !!cartItem

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
    addToCart({
      id: service.id,
      slug: service.slug,
      name: service.name,
      priceCents: service.priceCents,
      quantity: 1,
      type: "service",
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
  } else {
    actionButton = (
      <ButtonLarge as="button" onClick={handleAddToCart}>
        Add to Cart
      </ButtonLarge>
    )
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
              {formatMoney(service.priceCents)}
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
