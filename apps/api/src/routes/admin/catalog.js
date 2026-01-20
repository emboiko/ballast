import { Router } from "express"
import multer from "multer"
import {
  CATALOG_IMAGE_ALLOWED_MIME_TYPES,
  CATALOG_IMAGE_MAX_COUNT,
  CATALOG_IMAGE_MAX_SIZE_BYTES,
} from "../../constants.js"
import { requireAdmin } from "../../middleware/admin.js"
import {
  listCatalogProductsAdmin,
  createCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
  listCatalogServicesAdmin,
  createCatalogService,
  updateCatalogService,
  deleteCatalogService,
  addCatalogProductImages,
  addCatalogServiceImages,
  updateCatalogProductImages,
  updateCatalogServiceImages,
  deleteCatalogProductImage,
  deleteCatalogServiceImage,
} from "../../lib/admin/index.js"

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: CATALOG_IMAGE_MAX_SIZE_BYTES,
    files: CATALOG_IMAGE_MAX_COUNT,
  },
  fileFilter: (req, file, callback) => {
    if (CATALOG_IMAGE_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true)
      return
    }
    callback(new Error("Unsupported image type"))
  },
})

const handleImageUpload = (req, res, next) => {
  const handler = upload.array("images", CATALOG_IMAGE_MAX_COUNT)
  handler(req, res, (error) => {
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    return next()
  })
}

const normalizeStatusParam = (status) => {
  if (status === "active") {
    return "active"
  }
  if (status === "inactive") {
    return "inactive"
  }
  return "all"
}

router.get("/products", requireAdmin, async (req, res) => {
  try {
    const status = normalizeStatusParam(req.query.status)
    const result = await listCatalogProductsAdmin({ status })
    res.json({ products: result.products })
  } catch (error) {
    console.error("List catalog products error:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

router.post("/products", requireAdmin, async (req, res) => {
  try {
    const result = await createCatalogProduct(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json({ product: result.product })
  } catch (error) {
    console.error("Create catalog product error:", error)
    res.status(500).json({ error: "Failed to create product" })
  }
})

router.patch("/products/:id", requireAdmin, async (req, res) => {
  try {
    const result = await updateCatalogProduct(req.params.id, req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ product: result.product })
  } catch (error) {
    console.error("Update catalog product error:", error)
    res.status(500).json({ error: "Failed to update product" })
  }
})

router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    const result = await deleteCatalogProduct(req.params.id)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ success: true })
  } catch (error) {
    console.error("Delete catalog product error:", error)
    res.status(500).json({ error: "Failed to delete product" })
  }
})

router.post(
  "/products/:id/images",
  requireAdmin,
  handleImageUpload,
  async (req, res) => {
    try {
      const result = await addCatalogProductImages(req.params.id, req.files)
      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.status(201).json({ product: result.product })
    } catch (error) {
      console.error("Add product images error:", error)
      res.status(500).json({ error: "Failed to upload product images" })
    }
  }
)

router.patch("/products/:id/images", requireAdmin, async (req, res) => {
  try {
    const result = await updateCatalogProductImages(req.params.id, req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ product: result.product })
  } catch (error) {
    console.error("Update product images error:", error)
    res.status(500).json({ error: "Failed to update product images" })
  }
})

router.delete(
  "/products/:id/images/:imageId",
  requireAdmin,
  async (req, res) => {
    try {
      const result = await deleteCatalogProductImage(
        req.params.id,
        req.params.imageId
      )
      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.json({ product: result.product })
    } catch (error) {
      console.error("Delete product image error:", error)
      res.status(500).json({ error: "Failed to delete product image" })
    }
  }
)

router.get("/services", requireAdmin, async (req, res) => {
  try {
    const status = normalizeStatusParam(req.query.status)
    const result = await listCatalogServicesAdmin({ status })
    res.json({ services: result.services })
  } catch (error) {
    console.error("List catalog services error:", error)
    res.status(500).json({ error: "Failed to fetch services" })
  }
})

router.post("/services", requireAdmin, async (req, res) => {
  try {
    const result = await createCatalogService(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json({ service: result.service })
  } catch (error) {
    console.error("Create catalog service error:", error)
    res.status(500).json({ error: "Failed to create service" })
  }
})

router.patch("/services/:id", requireAdmin, async (req, res) => {
  try {
    const result = await updateCatalogService(req.params.id, req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ service: result.service })
  } catch (error) {
    console.error("Update catalog service error:", error)
    res.status(500).json({ error: "Failed to update service" })
  }
})

router.delete("/services/:id", requireAdmin, async (req, res) => {
  try {
    const result = await deleteCatalogService(req.params.id)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ success: true })
  } catch (error) {
    console.error("Delete catalog service error:", error)
    res.status(500).json({ error: "Failed to delete service" })
  }
})

router.post(
  "/services/:id/images",
  requireAdmin,
  handleImageUpload,
  async (req, res) => {
    try {
      const result = await addCatalogServiceImages(req.params.id, req.files)
      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.status(201).json({ service: result.service })
    } catch (error) {
      console.error("Add service images error:", error)
      res.status(500).json({ error: "Failed to upload service images" })
    }
  }
)

router.patch("/services/:id/images", requireAdmin, async (req, res) => {
  try {
    const result = await updateCatalogServiceImages(req.params.id, req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ service: result.service })
  } catch (error) {
    console.error("Update service images error:", error)
    res.status(500).json({ error: "Failed to update service images" })
  }
})

router.delete(
  "/services/:id/images/:imageId",
  requireAdmin,
  async (req, res) => {
    try {
      const result = await deleteCatalogServiceImage(
        req.params.id,
        req.params.imageId
      )
      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }

      res.json({ service: result.service })
    } catch (error) {
      console.error("Delete service image error:", error)
      res.status(500).json({ error: "Failed to delete service image" })
    }
  }
)

export default router
