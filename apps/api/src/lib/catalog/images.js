import { API_URL } from "../../constants.js"
import prisma from "../../../../../packages/shared/src/db/client.js"

const buildCatalogImageUrl = (imageId) => {
  if (!imageId) {
    return ""
  }
  if (API_URL) {
    return `${API_URL}/catalog/images/${imageId}`
  }
  return `/catalog/images/${imageId}`
}

export const serializeCatalogImage = (image) => {
  if (!image) {
    return null
  }
  return {
    id: image.id,
    isPrimary: image.isPrimary,
    sortOrder: image.sortOrder,
    filename: image.filename,
    mimeType: image.mimeType,
    sizeBytes: image.sizeBytes,
    createdAt: image.createdAt,
    url: buildCatalogImageUrl(image.id),
  }
}

export const serializeCatalogImages = (images = []) => {
  if (!Array.isArray(images)) {
    return []
  }
  return images.map(serializeCatalogImage).filter(Boolean)
}

export const getPrimaryImageUrl = (images = []) => {
  if (!Array.isArray(images)) {
    return null
  }
  const primaryImage = images.find((image) => image.isPrimary)
  if (!primaryImage) {
    return null
  }
  return buildCatalogImageUrl(primaryImage.id)
}

export const getCatalogImageById = async (imageId) => {
  if (!imageId) {
    return { success: false, error: "Image ID is required" }
  }
  const image = await prisma.catalogImage.findUnique({
    where: { id: imageId },
    select: {
      id: true,
      mimeType: true,
      sizeBytes: true,
      data: true,
      updatedAt: true,
    },
  })
  if (!image) {
    return { success: false, error: "Image not found" }
  }
  return { success: true, image }
}
