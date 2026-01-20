"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import {
  listCatalogProducts as listCatalogProductsGateway,
  getCatalogProductBySlug as getCatalogProductBySlugGateway,
  listCatalogServices as listCatalogServicesGateway,
  getCatalogServiceBySlug as getCatalogServiceBySlugGateway,
} from "@/gateways/catalogGateway"

const CatalogContext = createContext(undefined)

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true)
      setError(null)
      const data = await listCatalogProductsGateway()
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

  const fetchServices = useCallback(async () => {
    try {
      setIsLoadingServices(true)
      setError(null)
      const data = await listCatalogServicesGateway()
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

  const fetchProductBySlug = useCallback(async (slug) => {
    const data = await getCatalogProductBySlugGateway(slug)
    return data.product
  }, [])

  const fetchServiceBySlug = useCallback(async (slug) => {
    const data = await getCatalogServiceBySlugGateway(slug)
    return data.service
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
      fetchProductBySlug,
      fetchServiceBySlug,
    }
  }, [
    products,
    services,
    isLoadingProducts,
    isLoadingServices,
    error,
    fetchProducts,
    fetchServices,
    fetchProductBySlug,
    fetchServiceBySlug,
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
