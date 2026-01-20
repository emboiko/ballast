"use client"

import Link from "next/link"
import { usePayment } from "@/contexts/PaymentContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import { useEffect, useState } from "react"
import {
  ProductDetailPage,
  ProductDetailBack,
  ProductDetailContent,
  ProductDetailImageColumn,
  ProductDetailImage,
  ProductImageFallbackLarge,
  ProductDetailImageAsset,
  ProductDetailThumbnailButton,
  ProductDetailThumbnailImage,
  ProductDetailThumbnailRow,
  ProductDetailInfo,
  ProductDetailHeader,
  ProductDetailCategory,
  ProductDetailName,
  ProductDetailPrice,
  ProductDetailDescription,
  ProductDetailActions,
  ProductDetailQuantity,
  QuantityLabel,
  QuantitySelect,
  ProductDetailError,
} from "@/components/products/productStyles"
import {
  ButtonPrimary,
  ButtonSuccessLarge,
  ButtonLarge,
} from "@/components/ui/uiStyles"

export default function ProductDetail({ product, isLoading = false }) {
  const { cart, addToCart, updateQuantity } = usePayment()
  const [addedToCart, setAddedToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const cartItem = cart.find((item) => item.id === product?.id)
  const currentQuantity = cartItem?.quantity || 0

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity)
    } else {
      setQuantity(1)
    }
  }, [cartItem])

  const images = Array.isArray(product?.images) ? product.images : []
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
      <ProductDetailError>
        <h1>Loading product...</h1>
        <p>Please wait while we fetch the latest details.</p>
      </ProductDetailError>
    )
  }

  if (!product) {
    return (
      <ProductDetailError>
        <h1>Product Not Found</h1>
        <p>The product you're looking for doesn't exist.</p>
        <ButtonPrimary as={Link} href="/products">
          Back to Products
        </ButtonPrimary>
      </ProductDetailError>
    )
  }

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10)
    setQuantity(newQuantity)
  }

  const handleAddToCart = () => {
    if (cartItem) {
      updateQuantity(product.id, quantity)
    } else {
      addToCart({
        id: product.id,
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        quantity: quantity,
        type: "item",
      })
    }
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
    }, 3000)
  }

  let imageContent = (
    <ProductImageFallbackLarge>
      <span>📦</span>
    </ProductImageFallbackLarge>
  )
  const activeImage = images[activeImageIndex]
  if (activeImage?.url) {
    imageContent = (
      <ProductDetailImageAsset
        src={activeImage.url}
        alt={product.name}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 520px"
      />
    )
  }

  let categoryLabel = product.category
  if (product.subcategory) {
    categoryLabel = `${product.category} / ${product.subcategory}`
  }

  let actionButton = null
  if (addedToCart) {
    actionButton = (
      <ButtonSuccessLarge disabled>✓ Added to Cart</ButtonSuccessLarge>
    )
  } else {
    let buttonLabel = "Add to Cart"
    if (currentQuantity > 0) {
      buttonLabel = `Update Cart (${currentQuantity} in cart)`
    }
    actionButton = (
      <ButtonLarge as="button" onClick={handleAddToCart}>
        {buttonLabel}
      </ButtonLarge>
    )
  }

  return (
    <ProductDetailPage>
      <ProductDetailBack as={Link} href="/products">
        ← Back to Products
      </ProductDetailBack>

      <ProductDetailContent>
        <ProductDetailImageColumn>
          <ProductDetailImage>{imageContent}</ProductDetailImage>
          {images.length > 1 && (
            <ProductDetailThumbnailRow>
              {images.map((image, index) => {
                const isActive = index === activeImageIndex
                return (
                  <ProductDetailThumbnailButton
                    key={image.id}
                    type="button"
                    $isActive={isActive}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <ProductDetailThumbnailImage
                      src={image.url}
                      alt={image.filename || product.name}
                      fill
                    />
                  </ProductDetailThumbnailButton>
                )
              })}
            </ProductDetailThumbnailRow>
          )}
        </ProductDetailImageColumn>

        <ProductDetailInfo>
          <ProductDetailHeader>
            <ProductDetailCategory>{categoryLabel}</ProductDetailCategory>
            <ProductDetailName>{product.name}</ProductDetailName>
            <ProductDetailPrice>
              {formatMoney(product.priceCents)}
            </ProductDetailPrice>
          </ProductDetailHeader>

          <ProductDetailDescription>
            <h2>Description</h2>
            <p>{product.description}</p>
          </ProductDetailDescription>

          <ProductDetailActions>
            <ProductDetailQuantity>
              <QuantityLabel htmlFor="product-quantity">
                Quantity:
              </QuantityLabel>
              <QuantitySelect
                id="product-quantity"
                value={quantity}
                onChange={handleQuantityChange}
              >
                {Array.from({ length: 20 }, (_, index) => index + 1).map(
                  (num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  )
                )}
              </QuantitySelect>
            </ProductDetailQuantity>
            {actionButton}
          </ProductDetailActions>
        </ProductDetailInfo>
      </ProductDetailContent>
    </ProductDetailPage>
  )
}
