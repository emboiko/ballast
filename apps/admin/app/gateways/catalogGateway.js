import { API_URL } from "@/constants.js"

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  if (!params) {
    return ""
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return
    }
    searchParams.append(key, String(value))
  })

  const queryString = searchParams.toString()
  if (!queryString) {
    return ""
  }
  return `?${queryString}`
}

export const listCatalogProducts = async ({ status } = {}) => {
  const query = buildQueryString({ status })
  const response = await fetch(`${API_URL}/admin/catalog/products${query}`, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch products")
  }

  return data
}

export const createCatalogProduct = async (payload) => {
  const response = await fetch(`${API_URL}/admin/catalog/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to create product")
  }

  return data
}

export const updateCatalogProduct = async (productId, payload) => {
  const response = await fetch(
    `${API_URL}/admin/catalog/products/${productId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to update product")
  }

  return data
}

export const deleteCatalogProduct = async (productId) => {
  const response = await fetch(
    `${API_URL}/admin/catalog/products/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete product")
  }

  return data
}

export const uploadCatalogProductImages = async (productId, files) => {
  const formData = new FormData()
  for (const file of files) {
    formData.append("images", file)
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/products/${productId}/images`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to upload product images")
  }

  return data
}

export const updateCatalogProductImages = async (productId, payload) => {
  const response = await fetch(
    `${API_URL}/admin/catalog/products/${productId}/images`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to update product images")
  }

  return data
}

export const deleteCatalogProductImage = async (productId, imageId) => {
  const response = await fetch(
    `${API_URL}/admin/catalog/products/${productId}/images/${imageId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete product image")
  }

  return data
}

export const listCatalogServices = async ({ status } = {}) => {
  const query = buildQueryString({ status })
  const response = await fetch(`${API_URL}/admin/catalog/services${query}`, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch services")
  }

  return data
}

export const createCatalogService = async (payload) => {
  const response = await fetch(`${API_URL}/admin/catalog/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to create service")
  }

  return data
}

export const updateCatalogService = async (serviceId, payload) => {
  const response = await fetch(
    `${API_URL}/admin/catalog/services/${serviceId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to update service")
  }

  return data
}

export const deleteCatalogService = async (serviceId) => {
  const response = await fetch(
    `${API_URL}/admin/catalog/services/${serviceId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete service")
  }

  return data
}

export const uploadCatalogServiceImages = async (serviceId, files) => {
  const formData = new FormData()
  for (const file of files) {
    formData.append("images", file)
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/services/${serviceId}/images`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to upload service images")
  }

  return data
}

export const updateCatalogServiceImages = async (serviceId, payload) => {
  const response = await fetch(
    `${API_URL}/admin/catalog/services/${serviceId}/images`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to update service images")
  }

  return data
}

export const deleteCatalogServiceImage = async (serviceId, imageId) => {
  const response = await fetch(
    `${API_URL}/admin/catalog/services/${serviceId}/images/${imageId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete service image")
  }

  return data
}
