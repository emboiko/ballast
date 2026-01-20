import prisma from "@ballast/shared/src/db/client.js"
import {
  getPrimaryImageUrl,
  serializeCatalogImages,
} from "@/lib/catalog/images.js"

export const listCatalogProducts = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { createdAt: "asc" }],
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

export const getCatalogProductBySlug = async (slug) => {
  if (!slug || typeof slug !== "string") {
    return { success: false, error: "Product slug is required" }
  }

  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
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

  if (!product) {
    return { success: false, error: "Product not found" }
  }

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
