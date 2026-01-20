import { Router } from "express"
import {
  listCatalogProducts,
  getCatalogProductBySlug,
} from "../lib/catalog/products.js"
import {
  listCatalogServices,
  getCatalogServiceBySlug,
} from "../lib/catalog/services.js"
import { getCatalogImageById } from "../lib/catalog/images.js"

const router = Router()

router.get("/products", async (req, res) => {
  try {
    const result = await listCatalogProducts()
    res.json({ products: result.products })
  } catch (error) {
    console.error("List catalog products error:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

router.get("/products/:slug", async (req, res) => {
  try {
    const result = await getCatalogProductBySlug(req.params.slug)
    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ product: result.product })
  } catch (error) {
    console.error("Get catalog product error:", error)
    res.status(500).json({ error: "Failed to fetch product" })
  }
})

router.get("/services", async (req, res) => {
  try {
    const result = await listCatalogServices()
    res.json({ services: result.services })
  } catch (error) {
    console.error("List catalog services error:", error)
    res.status(500).json({ error: "Failed to fetch services" })
  }
})

router.get("/services/:slug", async (req, res) => {
  try {
    const result = await getCatalogServiceBySlug(req.params.slug)
    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ service: result.service })
  } catch (error) {
    console.error("Get catalog service error:", error)
    res.status(500).json({ error: "Failed to fetch service" })
  }
})

router.get("/images/:imageId", async (req, res) => {
  try {
    const result = await getCatalogImageById(req.params.imageId)
    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.set("Content-Type", result.image.mimeType)
    res.set("Content-Length", String(result.image.sizeBytes))
    res.set("Cache-Control", "public, max-age=3600")
    res.status(200).send(result.image.data)
  } catch (error) {
    console.error("Get catalog image error:", error)
    res.status(500).json({ error: "Failed to fetch image" })
  }
})

export default router
