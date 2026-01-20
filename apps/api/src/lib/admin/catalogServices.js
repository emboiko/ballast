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

const serviceBaseSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  longDescription: z.string().optional().nullable(),
  priceCents: z.coerce.number().int().nonnegative(),
  isActive: z.boolean().optional(),
})

const serviceCreateSchema = serviceBaseSchema

const serviceUpdateSchema = serviceBaseSchema.partial()

const buildServiceCreateData = (payload) => {
  const result = serviceCreateSchema.safeParse(payload)
  if (!result.success) {
    return { success: false, error: result.error.message }
  }

  const data = result.data
  const normalizedLongDescription = normalizeOptionalString(
    data.longDescription
  )

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
      longDescription: normalizedLongDescription,
      priceCents: data.priceCents,
      isActive,
    },
  }
}

const buildServiceUpdateData = (payload) => {
  const result = serviceUpdateSchema.safeParse(payload)
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
  if (Object.prototype.hasOwnProperty.call(data, "longDescription")) {
    updateData.longDescription = normalizeOptionalString(data.longDescription)
  }
  if (Object.prototype.hasOwnProperty.call(data, "priceCents")) {
    updateData.priceCents = data.priceCents
  }
  if (Object.prototype.hasOwnProperty.call(data, "isActive")) {
    updateData.isActive = data.isActive
  }

  return { success: true, data: updateData }
}

export const listCatalogServicesAdmin = async ({ status }) => {
  let where = {}

  if (status === "active") {
    where = { isActive: true }
  }
  if (status === "inactive") {
    where = { isActive: false }
  }

  const services = await prisma.service.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
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

  const serialized = services.map((service) => {
    const { images, ...rest } = service
    return {
      ...rest,
      images: serializeCatalogImages(images),
      primaryImageUrl: getPrimaryImageUrl(images),
    }
  })

  return { success: true, services: serialized }
}

export const createCatalogService = async (payload) => {
  const normalized = buildServiceCreateData(payload)
  if (!normalized.success) {
    return normalized
  }

  const service = await prisma.service.create({
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

  const { images, ...rest } = service
  return {
    success: true,
    service: {
      ...rest,
      images: serializeCatalogImages(images),
      primaryImageUrl: getPrimaryImageUrl(images),
    },
  }
}

export const updateCatalogService = async (serviceId, payload) => {
  if (!serviceId) {
    return { success: false, error: "Service ID is required" }
  }

  const normalized = buildServiceUpdateData(payload)
  if (!normalized.success) {
    return normalized
  }

  if (Object.keys(normalized.data).length === 0) {
    return { success: false, error: "No fields provided for update" }
  }

  const service = await prisma.service.update({
    where: { id: serviceId },
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

  const { images, ...rest } = service
  return {
    success: true,
    service: {
      ...rest,
      images: serializeCatalogImages(images),
      primaryImageUrl: getPrimaryImageUrl(images),
    },
  }
}

export const deleteCatalogService = async (serviceId) => {
  if (!serviceId) {
    return { success: false, error: "Service ID is required" }
  }

  await prisma.service.delete({
    where: { id: serviceId },
  })

  return { success: true }
}
