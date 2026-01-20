"use client"

import { use, useEffect, useState } from "react"
import PageLayout from "@/components/ui/PageLayout"
import ProductDetail from "@/components/products/ProductDetail"
import { useCatalog } from "@/contexts/CatalogContext"

export default function ProductDetailPage({ params }) {
  const { slug } = use(params)
  const { fetchProductBySlug } = useCatalog()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadProduct = async () => {
      try {
        setIsLoading(true)
        const result = await fetchProductBySlug(slug)
        if (isActive) {
          setProduct(result)
        }
      } catch {
        if (isActive) {
          setProduct(null)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isActive = false
    }
  }, [fetchProductBySlug, slug])

  return (
    <PageLayout>
      <ProductDetail product={product} isLoading={isLoading} />
    </PageLayout>
  )
}
