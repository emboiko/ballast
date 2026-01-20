import { API_URL } from "@/constants.js"

export const listCatalogProducts = async () => {
  const response = await fetch(`${API_URL}/catalog/products`, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch products")
  }

  return data
}

export const getCatalogProductBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/catalog/products/${slug}`, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch product")
  }

  return data
}

export const listCatalogServices = async () => {
  const response = await fetch(`${API_URL}/catalog/services`, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch services")
  }

  return data
}

export const getCatalogServiceBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/catalog/services/${slug}`, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch service")
  }

  return data
}
