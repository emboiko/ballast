import prisma from "../../../../../packages/shared/src/db/client.js"
import {
  getPrimaryImageUrl,
  serializeCatalogImages,
} from "../catalog/images.js"

const imageSelect = {
  id: true,
  isPrimary: true,
  sortOrder: true,
  filename: true,
  mimeType: true,
  sizeBytes: true,
  createdAt: true,
}

const imageOrderBy = [
  { isPrimary: "desc" },
  { sortOrder: "asc" },
  { createdAt: "asc" },
]

const buildProductResponse = (product) => {
  if (!product) {
    return null
  }
  const { images, ...rest } = product
  return {
    ...rest,
    images: serializeCatalogImages(images),
    primaryImageUrl: getPrimaryImageUrl(images),
  }
}

const buildServiceResponse = (service) => {
  if (!service) {
    return null
  }
  const { images, ...rest } = service
  return {
    ...rest,
    images: serializeCatalogImages(images),
    primaryImageUrl: getPrimaryImageUrl(images),
  }
}

const getNextSortOrder = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return 0
  }
  return Math.max(...images.map((image) => image.sortOrder || 0)) + 1
}

const getPrimaryImageId = (images) => {
  if (!Array.isArray(images)) {
    return null
  }
  const primaryImage = images.find((image) => image.isPrimary)
  if (!primaryImage) {
    return null
  }
  return primaryImage.id
}

const setPrimaryImage = async ({ productId, serviceId, imageId }) => {
  if (!imageId) {
    return
  }
  const where = {}
  if (productId) {
    where.productId = productId
  }
  if (serviceId) {
    where.serviceId = serviceId
  }
  await prisma.catalogImage.updateMany({
    where,
    data: { isPrimary: false },
  })
  await prisma.catalogImage.updateMany({
    where: { id: imageId, ...where },
    data: { isPrimary: true },
  })
}

const updateImageOrder = async ({ productId, serviceId, orderedImageIds }) => {
  if (!Array.isArray(orderedImageIds)) {
    return
  }
  const updates = orderedImageIds.map((imageId, index) => {
    return prisma.catalogImage.updateMany({
      where: {
        id: imageId,
        ...(productId ? { productId } : {}),
        ...(serviceId ? { serviceId } : {}),
      },
      data: { sortOrder: index },
    })
  })
  if (updates.length === 0) {
    return
  }
  await prisma.$transaction(updates)
}

const fetchProductWithImages = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { select: imageSelect, orderBy: imageOrderBy } },
  })
  return buildProductResponse(product)
}

const fetchServiceWithImages = async (serviceId) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { images: { select: imageSelect, orderBy: imageOrderBy } },
  })
  return buildServiceResponse(service)
}

const ensureImageOwnership = async ({ productId, serviceId, imageId }) => {
  if (!imageId) {
    return true
  }
  const where = { id: imageId }
  if (productId) {
    where.productId = productId
  }
  if (serviceId) {
    where.serviceId = serviceId
  }
  const image = await prisma.catalogImage.findFirst({
    where,
    select: { id: true },
  })
  return !!image
}

export const addCatalogProductImages = async (productId, files) => {
  if (!productId) {
    return { success: false, error: "Product ID is required" }
  }
  if (!Array.isArray(files) || files.length === 0) {
    return { success: false, error: "No images provided" }
  }

  const productExists = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })
  if (!productExists) {
    return { success: false, error: "Product not found" }
  }

  const existingImages = await prisma.catalogImage.findMany({
    where: { productId },
    select: { id: true, isPrimary: true, sortOrder: true },
  })
  const baseSortOrder = getNextSortOrder(existingImages)
  const hasPrimary = !!getPrimaryImageId(existingImages)

  const createOperations = files.map((file, index) => {
    let isPrimary = false
    if (!hasPrimary && index === 0) {
      isPrimary = true
    }
    return prisma.catalogImage.create({
      data: {
        productId,
        isPrimary,
        sortOrder: baseSortOrder + index,
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        data: file.buffer,
      },
    })
  })

  await prisma.$transaction(createOperations)
  const product = await fetchProductWithImages(productId)
  return { success: true, product }
}

export const addCatalogServiceImages = async (serviceId, files) => {
  if (!serviceId) {
    return { success: false, error: "Service ID is required" }
  }
  if (!Array.isArray(files) || files.length === 0) {
    return { success: false, error: "No images provided" }
  }

  const serviceExists = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true },
  })
  if (!serviceExists) {
    return { success: false, error: "Service not found" }
  }

  const existingImages = await prisma.catalogImage.findMany({
    where: { serviceId },
    select: { id: true, isPrimary: true, sortOrder: true },
  })
  const baseSortOrder = getNextSortOrder(existingImages)
  const hasPrimary = !!getPrimaryImageId(existingImages)

  const createOperations = files.map((file, index) => {
    let isPrimary = false
    if (!hasPrimary && index === 0) {
      isPrimary = true
    }
    return prisma.catalogImage.create({
      data: {
        serviceId,
        isPrimary,
        sortOrder: baseSortOrder + index,
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        data: file.buffer,
      },
    })
  })

  await prisma.$transaction(createOperations)
  const service = await fetchServiceWithImages(serviceId)
  return { success: true, service }
}

export const updateCatalogProductImages = async (
  productId,
  { primaryImageId, orderedImageIds }
) => {
  if (!productId) {
    return { success: false, error: "Product ID is required" }
  }

  if (primaryImageId) {
    const ownsImage = await ensureImageOwnership({
      productId,
      imageId: primaryImageId,
    })
    if (!ownsImage) {
      return { success: false, error: "Primary image not found" }
    }
    await setPrimaryImage({ productId, imageId: primaryImageId })
  }
  if (Array.isArray(orderedImageIds)) {
    await updateImageOrder({ productId, orderedImageIds })
  }

  const product = await fetchProductWithImages(productId)
  return { success: true, product }
}

export const updateCatalogServiceImages = async (
  serviceId,
  { primaryImageId, orderedImageIds }
) => {
  if (!serviceId) {
    return { success: false, error: "Service ID is required" }
  }

  if (primaryImageId) {
    const ownsImage = await ensureImageOwnership({
      serviceId,
      imageId: primaryImageId,
    })
    if (!ownsImage) {
      return { success: false, error: "Primary image not found" }
    }
    await setPrimaryImage({ serviceId, imageId: primaryImageId })
  }
  if (Array.isArray(orderedImageIds)) {
    await updateImageOrder({ serviceId, orderedImageIds })
  }

  const service = await fetchServiceWithImages(serviceId)
  return { success: true, service }
}

export const deleteCatalogProductImage = async (productId, imageId) => {
  if (!productId) {
    return { success: false, error: "Product ID is required" }
  }
  if (!imageId) {
    return { success: false, error: "Image ID is required" }
  }

  const image = await prisma.catalogImage.findFirst({
    where: { id: imageId, productId },
    select: { id: true, isPrimary: true },
  })
  if (!image) {
    return { success: false, error: "Image not found" }
  }

  await prisma.catalogImage.delete({ where: { id: imageId } })

  if (image.isPrimary) {
    const nextImage = await prisma.catalogImage.findFirst({
      where: { productId },
      orderBy: imageOrderBy,
      select: { id: true },
    })
    if (nextImage) {
      await setPrimaryImage({ productId, imageId: nextImage.id })
    }
  }

  const product = await fetchProductWithImages(productId)
  return { success: true, product }
}

export const deleteCatalogServiceImage = async (serviceId, imageId) => {
  if (!serviceId) {
    return { success: false, error: "Service ID is required" }
  }
  if (!imageId) {
    return { success: false, error: "Image ID is required" }
  }

  const image = await prisma.catalogImage.findFirst({
    where: { id: imageId, serviceId },
    select: { id: true, isPrimary: true },
  })
  if (!image) {
    return { success: false, error: "Image not found" }
  }

  await prisma.catalogImage.delete({ where: { id: imageId } })

  if (image.isPrimary) {
    const nextImage = await prisma.catalogImage.findFirst({
      where: { serviceId },
      orderBy: imageOrderBy,
      select: { id: true },
    })
    if (nextImage) {
      await setPrimaryImage({ serviceId, imageId: nextImage.id })
    }
  }

  const service = await fetchServiceWithImages(serviceId)
  return { success: true, service }
}
