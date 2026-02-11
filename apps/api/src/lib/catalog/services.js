import prisma from "../../../../../packages/shared/src/db/client.js"
import {
  getPrimaryImageUrl,
  serializeCatalogImages,
} from "./images.js"

export const listCatalogServices = async () => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "asc" }],
    include: {
      intervalPrices: {
        where: { isEnabled: true },
        select: {
          interval: true,
          priceCents: true,
          isEnabled: true,
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

export const getCatalogServiceBySlug = async (slug) => {
  if (!slug || typeof slug !== "string") {
    return { success: false, error: "Service slug is required" }
  }

  const service = await prisma.service.findFirst({
    where: { slug, isActive: true },
    include: {
      intervalPrices: {
        where: { isEnabled: true },
        select: {
          interval: true,
          priceCents: true,
          isEnabled: true,
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
