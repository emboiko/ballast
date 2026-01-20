import { z } from "zod"
import prisma from "@ballast/shared/src/db/client.js"
import {
  getPrimaryImageUrl,
  serializeCatalogImages,
} from "@/lib/catalog/images.js"

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }

  return trimmed
}

const productBaseSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priceCents: z.coerce.number().int().nonnegative(),
  category: z.string().trim().min(1),
  subcategory: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

const productCreateSchema = productBaseSchema

const productUpdateSchema = productBaseSchema.partial()

const buildProductCreateData = (payload) => {
  const result = productCreateSchema.safeParse(payload)
  if (!result.success) {
    return { success: false, error: result.error.message }
  }

  const data = result.data
  const normalizedSubcategory = normalizeOptionalString(data.subcategory)

  let isActive = true
  if (data.isActive !== undefined) {
    isActive = data.isActive
  }

  return {
    success: true,
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      priceCents: data.priceCents,
      category: data.category,
      subcategory: normalizedSubcategory,
      isActive,
    },
  }
}

const buildProductUpdateData = (payload) => {
  const result = productUpdateSchema.safeParse(payload)
  if (!result.success) {
    return { success: false, error: result.error.message }
  }

  const data = result.data
  const updateData = {}

  if (Object.prototype.hasOwnProperty.call(data, "slug")) {
    updateData.slug = data.slug
  }
  if (Object.prototype.hasOwnProperty.call(data, "name")) {
    updateData.name = data.name
  }
  if (Object.prototype.hasOwnProperty.call(data, "description")) {
    updateData.description = data.description
  }
  if (Object.prototype.hasOwnProperty.call(data, "priceCents")) {
    updateData.priceCents = data.priceCents
  }
  if (Object.prototype.hasOwnProperty.call(data, "category")) {
    updateData.category = data.category
  }
  if (Object.prototype.hasOwnProperty.call(data, "subcategory")) {
    updateData.subcategory = normalizeOptionalString(data.subcategory)
  }
  if (Object.prototype.hasOwnProperty.call(data, "isActive")) {
    updateData.isActive = data.isActive
  }

  return { success: true, data: updateData }
}

export const listCatalogProductsAdmin = async ({ status }) => {
  let where = {}

  if (status === "active") {
    where = { isActive: true }
  }
  if (status === "inactive") {
    where = { isActive: false }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    include: {
      images: {
        select: {
          id: true,
          isPrimary: true,
          sortOrder: true,
          filename: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
  })

  const serialized = products.map((product) => {
    const { images, ...rest } = product
    return {
      ...rest,
      images: serializeCatalogImages(images),
      primaryImageUrl: getPrimaryImageUrl(images),
    }
  })

  return { success: true, products: serialized }
}

export const createCatalogProduct = async (payload) => {
  const normalized = buildProductCreateData(payload)
  if (!normalized.success) {
    return normalized
  }

  const product = await prisma.product.create({
    data: normalized.data,
    include: {
      images: {
        select: {
          id: true,
          isPrimary: true,
          sortOrder: true,
          filename: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
  })

  const { images, ...rest } = product
  return {
    success: true,
    product: {
      ...rest,
      images: serializeCatalogImages(images),
      primaryImageUrl: getPrimaryImageUrl(images),
    },
  }
}

export const updateCatalogProduct = async (productId, payload) => {
  if (!productId) {
    return { success: false, error: "Product ID is required" }
  }

  const normalized = buildProductUpdateData(payload)
  if (!normalized.success) {
    return normalized
  }

  if (Object.keys(normalized.data).length === 0) {
    return { success: false, error: "No fields provided for update" }
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: normalized.data,
    include: {
      images: {
        select: {
          id: true,
          isPrimary: true,
          sortOrder: true,
          filename: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
  })

  const { images, ...rest } = product
  return {
    success: true,
    product: {
      ...rest,
      images: serializeCatalogImages(images),
      primaryImageUrl: getPrimaryImageUrl(images),
    },
  }
}

export const deleteCatalogProduct = async (productId) => {
  if (!productId) {
    return { success: false, error: "Product ID is required" }
  }

  await prisma.product.delete({
    where: { id: productId },
  })

  return { success: true }
}
