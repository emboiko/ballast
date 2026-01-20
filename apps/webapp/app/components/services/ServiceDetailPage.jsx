"use client"

import { use, useEffect, useState } from "react"
import PageLayout from "@/components/ui/PageLayout"
import ServiceDetail from "@/components/services/ServiceDetail"
import { useCatalog } from "@/contexts/CatalogContext"

export default function ServiceDetailPage({ params }) {
  const { slug } = use(params)
  const { fetchServiceBySlug } = useCatalog()
  const [service, setService] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadService = async () => {
      try {
        setIsLoading(true)
        const result = await fetchServiceBySlug(slug)
        if (isActive) {
          setService(result)
        }
      } catch {
        if (isActive) {
          setService(null)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadService()

    return () => {
      isActive = false
    }
  }, [fetchServiceBySlug, slug])

  return (
    <PageLayout>
      <ServiceDetail service={service} isLoading={isLoading} />
    </PageLayout>
  )
}
