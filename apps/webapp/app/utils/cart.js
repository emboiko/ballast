import { CART_STORAGE_KEY } from "@/constants"

// This file implements some rudimentary cart functionality for the webapp.
// Ideally, we'll want to move this to a more robust cart service that can be used by the API, jobs, etc.
// If we start storing this in the DB, we can support a leads section in the admin panel as well. 
// For now, this is a simple implementation to improve the user and dev experience.
// This doesn't handle things like:
// - Cart persistence across devices
// - Cart abandonment
// - Carts desynced with items/services updated in the catalog, etc.
// Either way, this won't be our final form as far as handling shopping carts goes.

/**
 * Sanitize a cart item object (removes invalid or incomplete items)
 * @param {Object} rawItem
 * @returns {Object|null}
 */
const sanitizeCartItem = (rawItem) => {
  if (!rawItem || typeof rawItem !== "object") {
    return null
  }

  const { id, slug, name, priceCents, quantity, type } = rawItem

  if (id === undefined || id === null) {
    return null
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    return null
  }

  if (!Number.isInteger(priceCents) || priceCents < 0) {
    return null
  }

  let normalizedQuantity = quantity
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    normalizedQuantity = 1
  }

  let normalizedType = type
  if (normalizedType !== "service" && normalizedType !== "item") {
    normalizedType = "item"
  }

  const sanitizedItem = {
    id,
    name,
    priceCents,
    quantity: normalizedQuantity,
    type: normalizedType,
  }

  if (typeof slug === "string" && slug.trim().length > 0) {
    sanitizedItem.slug = slug
  }

  return sanitizedItem
}

/**
 * Load the cart from browser storage into the store (currently via PaymentContext)
 * @returns {Array}
 */
export const loadCartFromStorage = () => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!storedCart) {
      return []
    }

    const parsedCart = JSON.parse(storedCart)
    if (!Array.isArray(parsedCart)) {
      return []
    }

    const sanitizedCart = parsedCart
      .map((item) => sanitizeCartItem(item))
      .filter((item) => item !== null)

    return sanitizedCart
  } catch (error) {
    console.warn("Unable to read cart from storage:", error)
    return []
  }
}

/**
 * Save the cart from the store (PaymentContext) to browser storage
 * @param {Array} cartItems
 */
export const saveCartToStorage = (cartItems) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  } catch (error) {
    console.warn("Unable to persist cart to storage:", error)
  }
}
