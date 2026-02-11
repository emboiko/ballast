import { API_URL } from "@/constants.js"
import { z } from "zod"

const idSchema = z.string().trim().min(1)
const statusSchema = z.string().trim().min(1).optional()
const payloadSchema = z.record(z.string(), z.unknown())

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

/**
 * List catalog products (admin).
 * @param {object} [params]
 * @param {string|undefined} [params.status]
 * @returns {Promise<any>}
 */
export const listCatalogProducts = async ({ status } = {}) => {
  const parsedStatus = statusSchema.safeParse(status)
  if (!parsedStatus.success) {
    throw new Error("Invalid status")
  }

  const query = buildQueryString({ status: parsedStatus.data })
  const response = await fetch(`${API_URL}/admin/catalog/products${query}`, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch products")
  }

  return data
}

/**
 * Create a catalog product (admin).
 * @param {Record<string, any>} payload
 * @returns {Promise<any>}
 */
export const createCatalogProduct = async (payload) => {
  const parsedPayload = payloadSchema.safeParse(payload)
  if (!parsedPayload.success) {
    throw new Error("Invalid payload")
  }

  const response = await fetch(`${API_URL}/admin/catalog/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(parsedPayload.data),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to create product")
  }

  return data
}

/**
 * Update a catalog product (admin).
 * @param {string} productId
 * @param {Record<string, any>} payload
 * @returns {Promise<any>}
 */
export const updateCatalogProduct = async (productId, payload) => {
  const parsedProductId = idSchema.safeParse(productId)
  if (!parsedProductId.success) {
    throw new Error("Invalid productId")
  }

  const parsedPayload = payloadSchema.safeParse(payload)
  if (!parsedPayload.success) {
    throw new Error("Invalid payload")
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/products/${parsedProductId.data}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsedPayload.data),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to update product")
  }

  return data
}

/**
 * Delete a catalog product (admin).
 * @param {string} productId
 * @returns {Promise<any>}
 */
export const deleteCatalogProduct = async (productId) => {
  const parsedProductId = idSchema.safeParse(productId)
  if (!parsedProductId.success) {
    throw new Error("Invalid productId")
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/products/${parsedProductId.data}`,
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

/**
 * Upload catalog product images (admin).
 * @param {string} productId
 * @param {File[]} files
 * @returns {Promise<any>}
 */
export const uploadCatalogProductImages = async (productId, files) => {
  const parsedProductId = idSchema.safeParse(productId)
  if (!parsedProductId.success) {
    throw new Error("Invalid productId")
  }

  const parsedFiles = z.array(z.unknown()).min(1).safeParse(files)
  if (!parsedFiles.success) {
    throw new Error("Invalid files")
  }

  const formData = new FormData()
  for (const file of parsedFiles.data) {
    formData.append("images", file)
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/products/${parsedProductId.data}/images`,
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
  const parsedProductId = idSchema.safeParse(productId)
  if (!parsedProductId.success) {
    throw new Error("Invalid productId")
  }

  const parsedPayload = payloadSchema.safeParse(payload)
  if (!parsedPayload.success) {
    throw new Error("Invalid payload")
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/products/${parsedProductId.data}/images`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsedPayload.data),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to update product images")
  }

  return data
}

export const deleteCatalogProductImage = async (productId, imageId) => {
  const parsedProductId = idSchema.safeParse(productId)
  if (!parsedProductId.success) {
    throw new Error("Invalid productId")
  }

  const parsedImageId = idSchema.safeParse(imageId)
  if (!parsedImageId.success) {
    throw new Error("Invalid imageId")
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/products/${parsedProductId.data}/images/${parsedImageId.data}`,
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

/**
 * List catalog services (admin).
 * @param {object} [params]
 * @param {string|undefined} [params.status]
 * @returns {Promise<any>}
 */
export const listCatalogServices = async ({ status } = {}) => {
  const parsedStatus = statusSchema.safeParse(status)
  if (!parsedStatus.success) {
    throw new Error("Invalid status")
  }

  const query = buildQueryString({ status: parsedStatus.data })
  const response = await fetch(`${API_URL}/admin/catalog/services${query}`, {
    credentials: "include",
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch services")
  }

  return data
}

/**
 * Create a catalog service (admin).
 * @param {Record<string, any>} payload
 * @returns {Promise<any>}
 */
export const createCatalogService = async (payload) => {
  const parsedPayload = payloadSchema.safeParse(payload)
  if (!parsedPayload.success) {
    throw new Error("Invalid payload")
  }

  const response = await fetch(`${API_URL}/admin/catalog/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(parsedPayload.data),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to create service")
  }

  return data
}

/**
 * Update a catalog service (admin).
 * @param {string} serviceId
 * @param {Record<string, any>} payload
 * @returns {Promise<any>}
 */
export const updateCatalogService = async (serviceId, payload) => {
  const parsedServiceId = idSchema.safeParse(serviceId)
  if (!parsedServiceId.success) {
    throw new Error("Invalid serviceId")
  }

  const parsedPayload = payloadSchema.safeParse(payload)
  if (!parsedPayload.success) {
    throw new Error("Invalid payload")
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/services/${parsedServiceId.data}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsedPayload.data),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to update service")
  }

  return data
}

/**
 * Delete a catalog service (admin).
 * @param {string} serviceId
 * @returns {Promise<any>}
 */
export const deleteCatalogService = async (serviceId) => {
  const parsedServiceId = idSchema.safeParse(serviceId)
  if (!parsedServiceId.success) {
    throw new Error("Invalid serviceId")
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/services/${parsedServiceId.data}`,
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

/**
 * Upload catalog service images (admin).
 * @param {string} serviceId
 * @param {File[]} files
 * @returns {Promise<any>}
 */
export const uploadCatalogServiceImages = async (serviceId, files) => {
  const parsedServiceId = idSchema.safeParse(serviceId)
  if (!parsedServiceId.success) {
    throw new Error("Invalid serviceId")
  }

  const parsedFiles = z.array(z.unknown()).min(1).safeParse(files)
  if (!parsedFiles.success) {
    throw new Error("Invalid files")
  }

  const formData = new FormData()
  for (const file of parsedFiles.data) {
    formData.append("images", file)
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/services/${parsedServiceId.data}/images`,
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
  const parsedServiceId = idSchema.safeParse(serviceId)
  if (!parsedServiceId.success) {
    throw new Error("Invalid serviceId")
  }

  const parsedPayload = payloadSchema.safeParse(payload)
  if (!parsedPayload.success) {
    throw new Error("Invalid payload")
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/services/${parsedServiceId.data}/images`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsedPayload.data),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Failed to update service images")
  }

  return data
}

export const deleteCatalogServiceImage = async (serviceId, imageId) => {
  const parsedServiceId = idSchema.safeParse(serviceId)
  if (!parsedServiceId.success) {
    throw new Error("Invalid serviceId")
  }

  const parsedImageId = idSchema.safeParse(imageId)
  if (!parsedImageId.success) {
    throw new Error("Invalid imageId")
  }

  const response = await fetch(
    `${API_URL}/admin/catalog/services/${parsedServiceId.data}/images/${parsedImageId.data}`,
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
