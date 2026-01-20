"use client"

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from "react"
import {
  listCatalogProducts as listCatalogProductsGateway,
  createCatalogProduct as createCatalogProductGateway,
  updateCatalogProduct as updateCatalogProductGateway,
  deleteCatalogProduct as deleteCatalogProductGateway,
  uploadCatalogProductImages as uploadCatalogProductImagesGateway,
  updateCatalogProductImages as updateCatalogProductImagesGateway,
  deleteCatalogProductImage as deleteCatalogProductImageGateway,
  listCatalogServices as listCatalogServicesGateway,
  createCatalogService as createCatalogServiceGateway,
  updateCatalogService as updateCatalogServiceGateway,
  deleteCatalogService as deleteCatalogServiceGateway,
  uploadCatalogServiceImages as uploadCatalogServiceImagesGateway,
  updateCatalogServiceImages as updateCatalogServiceImagesGateway,
  deleteCatalogServiceImage as deleteCatalogServiceImageGateway,
} from "@/gateways/catalogGateway"

const CatalogContext = createContext(undefined)

const replaceById = (items, nextItem) => {
  return items.map((item) => {
    if (item.id === nextItem.id) {
      return nextItem
    }
    return item
  })
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async ({ status } = {}) => {
    try {
      setIsLoadingProducts(true)
      setError(null)
      const data = await listCatalogProductsGateway({ status })
      let items = []
      if (Array.isArray(data.products)) {
        items = data.products
      }
      setProducts(items)
      return { success: true, products: items }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  const fetchServices = useCallback(async ({ status } = {}) => {
    try {
      setIsLoadingServices(true)
      setError(null)
      const data = await listCatalogServicesGateway({ status })
      let items = []
      if (Array.isArray(data.services)) {
        items = data.services
      }
      setServices(items)
      return { success: true, services: items }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoadingServices(false)
    }
  }, [])

  const createProduct = useCallback(async (payload) => {
    const data = await createCatalogProductGateway(payload)
    setProducts((current) => [data.product, ...current])
    return data
  }, [])

  const updateProduct = useCallback(async (productId, payload) => {
    const data = await updateCatalogProductGateway(productId, payload)
    setProducts((current) => replaceById(current, data.product))
    return data
  }, [])

  const deleteProduct = useCallback(async (productId) => {
    const data = await deleteCatalogProductGateway(productId)
    setProducts((current) => current.filter((item) => item.id !== productId))
    return data
  }, [])

  const createService = useCallback(async (payload) => {
    const data = await createCatalogServiceGateway(payload)
    setServices((current) => [data.service, ...current])
    return data
  }, [])

  const uploadProductImages = useCallback(async (productId, files) => {
    const data = await uploadCatalogProductImagesGateway(productId, files)
    setProducts((current) => replaceById(current, data.product))
    return data
  }, [])

  const updateProductImages = useCallback(async (productId, payload) => {
    const data = await updateCatalogProductImagesGateway(productId, payload)
    setProducts((current) => replaceById(current, data.product))
    return data
  }, [])

  const deleteProductImage = useCallback(async (productId, imageId) => {
    const data = await deleteCatalogProductImageGateway(productId, imageId)
    setProducts((current) => replaceById(current, data.product))
    return data
  }, [])

  const updateService = useCallback(async (serviceId, payload) => {
    const data = await updateCatalogServiceGateway(serviceId, payload)
    setServices((current) => replaceById(current, data.service))
    return data
  }, [])

  const deleteService = useCallback(async (serviceId) => {
    const data = await deleteCatalogServiceGateway(serviceId)
    setServices((current) => current.filter((item) => item.id !== serviceId))
    return data
  }, [])

  const uploadServiceImages = useCallback(async (serviceId, files) => {
    const data = await uploadCatalogServiceImagesGateway(serviceId, files)
    setServices((current) => replaceById(current, data.service))
    return data
  }, [])

  const updateServiceImages = useCallback(async (serviceId, payload) => {
    const data = await updateCatalogServiceImagesGateway(serviceId, payload)
    setServices((current) => replaceById(current, data.service))
    return data
  }, [])

  const deleteServiceImage = useCallback(async (serviceId, imageId) => {
    const data = await deleteCatalogServiceImageGateway(serviceId, imageId)
    setServices((current) => replaceById(current, data.service))
    return data
  }, [])

  const value = useMemo(() => {
    return {
      products,
      services,
      isLoadingProducts,
      isLoadingServices,
      error,
      fetchProducts,
      fetchServices,
      createProduct,
      uploadProductImages,
      updateProductImages,
      deleteProductImage,
      updateProduct,
      deleteProduct,
      createService,
      uploadServiceImages,
      updateServiceImages,
      deleteServiceImage,
      updateService,
      deleteService,
    }
  }, [
    products,
    services,
    isLoadingProducts,
    isLoadingServices,
    error,
    fetchProducts,
    fetchServices,
    createProduct,
    uploadProductImages,
    updateProductImages,
    deleteProductImage,
    updateProduct,
    deleteProduct,
    createService,
    uploadServiceImages,
    updateServiceImages,
    deleteServiceImage,
    updateService,
    deleteService,
  ])

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  )
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (context === undefined) {
    throw new Error("useCatalog must be used within a CatalogProvider")
  }
  return context
}
