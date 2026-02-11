import { z } from "zod"
import prisma from "../../../../../packages/shared/src/db/client.js"
import {
  getPrimaryImageUrl,
  serializeCatalogImages,
} from "../catalog/images.js"

const SUBSCRIPTION_INTERVALS = ["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"]

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

const intervalPriceSchema = z.object({
  interval: z.enum(SUBSCRIPTION_INTERVALS),
  priceCents: z.coerce.number().int().nonnegative(),
  isEnabled: z.boolean(),
})

const intervalPricesSchema = z
  .array(intervalPriceSchema)
  .max(SUBSCRIPTION_INTERVALS.length)
  .optional()
  .superRefine((items, context) => {
    if (!items) {
      return
    }
    const seen = new Set()
    for (const item of items) {
      if (seen.has(item.interval)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate interval in intervalPrices",
        })
        return
      }
      seen.add(item.interval)
    }
  })

const serviceBaseSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  longDescription: z.string().optional().nullable(),
  priceCents: z.coerce.number().int().nonnegative(),
  isActive: z.boolean().optional(),
  intervalPrices: intervalPricesSchema,
})

const serviceCreateSchema = serviceBaseSchema

const serviceUpdateSchema = serviceBaseSchema.partial()

const applyDiscountBasisPoints = (amountCents, discountBasisPoints) => {
  const multiplierBasisPoints = 10000 - discountBasisPoints
  return Math.floor((amountCents * multiplierBasisPoints + 5000) / 10000)
}

const buildDefaultIntervalPrices = ({ monthlyPriceCents }) => {
  const base = monthlyPriceCents

  return [
    { interval: "MONTHLY", priceCents: base, isEnabled: true },
    {
      interval: "QUARTERLY",
      priceCents: applyDiscountBasisPoints(base * 3, 500),
      isEnabled: true,
    },
    {
      interval: "SEMI_ANNUAL",
      priceCents: applyDiscountBasisPoints(base * 6, 1000),
      isEnabled: true,
    },
    {
      interval: "ANNUAL",
      priceCents: applyDiscountBasisPoints(base * 12, 1000),
      isEnabled: true,
    },
  ]
}

const normalizeIntervalPrices = ({ intervalPrices, monthlyPriceCents }) => {
  if (!intervalPrices) {
    return buildDefaultIntervalPrices({ monthlyPriceCents })
  }

  const byInterval = new Map()
  for (const item of intervalPrices) {
    byInterval.set(item.interval, {
      interval: item.interval,
      priceCents: item.priceCents,
      isEnabled: item.isEnabled,
    })
  }

  const normalized = []
  for (const interval of SUBSCRIPTION_INTERVALS) {
    const item = byInterval.get(interval)
    if (item) {
      normalized.push(item)
    }
  }

  return normalized
}

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

  const intervalPrices = normalizeIntervalPrices({
    intervalPrices: data.intervalPrices,
    monthlyPriceCents: data.priceCents,
  })

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
    intervalPrices,
  }
}

const buildServiceUpdateData = (payload) => {
  const result = serviceUpdateSchema.safeParse(payload)
  if (!result.success) {
    return { success: false, error: result.error.message }
  }

  const data = result.data
  const updateData = {}
  let intervalPrices = undefined

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
  if (Object.prototype.hasOwnProperty.call(data, "intervalPrices")) {
    if (data.priceCents === undefined) {
      intervalPrices = data.intervalPrices
    } else {
      intervalPrices = normalizeIntervalPrices({
        intervalPrices: data.intervalPrices,
        monthlyPriceCents: data.priceCents,
      })
    }
  }

  return { success: true, data: updateData, intervalPrices }
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
      intervalPrices: {
        select: {
          id: true,
          interval: true,
          priceCents: true,
          isEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ interval: "asc" }],
      },
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
    const { images, intervalPrices, ...rest } = service
    return {
      ...rest,
      intervalPrices,
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
    data: {
      ...normalized.data,
      intervalPrices: {
        create: normalized.intervalPrices.map((item) => {
          return {
            interval: item.interval,
            priceCents: item.priceCents,
            isEnabled: item.isEnabled,
          }
        }),
      },
    },
    include: {
      intervalPrices: {
        select: {
          id: true,
          interval: true,
          priceCents: true,
          isEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ interval: "asc" }],
      },
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

  const { images, intervalPrices, ...rest } = service
  return {
    success: true,
    service: {
      ...rest,
      intervalPrices,
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

  const hasServiceUpdate = Object.keys(normalized.data).length > 0
  const hasIntervalUpdates = Array.isArray(normalized.intervalPrices)

  if (!hasServiceUpdate && !hasIntervalUpdates) {
    return { success: false, error: "No fields provided for update" }
  }

  await prisma.$transaction(async (transactionClient) => {
    if (hasServiceUpdate) {
      await transactionClient.service.update({
        where: { id: serviceId },
        data: normalized.data,
      })
    }

    if (hasIntervalUpdates) {
      const updates = normalized.intervalPrices
      for (const item of updates) {
        await transactionClient.serviceIntervalPrice.upsert({
          where: {
            serviceId_interval: {
              serviceId,
              interval: item.interval,
            },
          },
          update: {
            priceCents: item.priceCents,
            isEnabled: item.isEnabled,
          },
          create: {
            serviceId,
            interval: item.interval,
            priceCents: item.priceCents,
            isEnabled: item.isEnabled,
          },
        })
      }
    }
  })

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      intervalPrices: {
        select: {
          id: true,
          interval: true,
          priceCents: true,
          isEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ interval: "asc" }],
      },
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

  if (!service) {
    return { success: false, error: "Service not found" }
  }

  const { images, intervalPrices, ...rest } = service
  return {
    success: true,
    service: {
      ...rest,
      intervalPrices,
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
