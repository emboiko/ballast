"use client"

import Link from "next/link"
import { useEffect } from "react"
import { formatMoney } from "@ballast/shared/src/money.js"
import { useCatalog } from "@/contexts/CatalogContext"
import {
  ServicesPage,
  ServiceSection,
  ServiceSectionContent,
  ServiceSectionImage,
  ServiceImageFallback,
  ServiceSectionInfo,
  ServiceSectionTitle,
  ServiceSectionDescription,
  ServiceSectionPrice,
  ServiceSectionScrollIndicator,
  ServiceImage,
} from "@/components/services/serviceStyles"
import { ButtonLarge } from "@/components/ui/uiStyles"

export default function Services() {
  const { services, fetchServices, isLoadingServices } = useCatalog()

  useEffect(() => {
    if (services.length > 0) {
      return
    }

    const loadServices = async () => {
      try {
        await fetchServices()
      } catch {
        // Ignore initial load errors; page will show empty state
      }
    }

    loadServices()
  }, [fetchServices, services.length])

  if (isLoadingServices) {
    return (
      <ServicesPage>
        <ServiceSection>
          <ServiceSectionContent>
            <ServiceSectionInfo>
              <ServiceSectionTitle>Loading services...</ServiceSectionTitle>
            </ServiceSectionInfo>
          </ServiceSectionContent>
        </ServiceSection>
      </ServicesPage>
    )
  }

  if (services.length === 0) {
    return (
      <ServicesPage>
        <ServiceSection>
          <ServiceSectionContent>
            <ServiceSectionInfo>
              <ServiceSectionTitle>No services available</ServiceSectionTitle>
              <ServiceSectionDescription>
                Please check back soon for new offerings.
              </ServiceSectionDescription>
            </ServiceSectionInfo>
          </ServiceSectionContent>
        </ServiceSection>
      </ServicesPage>
    )
  }

  return (
    <ServicesPage>
      {services.map((service, index) => {
        let imageContent = (
          <ServiceImageFallback>
            <span>⚙️</span>
          </ServiceImageFallback>
        )
        const primaryImageUrl = service.primaryImageUrl
        if (primaryImageUrl) {
          imageContent = (
            <ServiceImage src={primaryImageUrl} alt={service.name} fill />
          )
        }

        let scrollIndicator = null
        if (index < services.length - 1) {
          scrollIndicator = (
            <ServiceSectionScrollIndicator>
              <span>↓</span>
            </ServiceSectionScrollIndicator>
          )
        }

        return (
          <ServiceSection key={service.id} id={`service-${index}`}>
            <ServiceSectionContent>
              <ServiceSectionImage>{imageContent}</ServiceSectionImage>
              <ServiceSectionInfo>
                <ServiceSectionTitle>{service.name}</ServiceSectionTitle>
                <ServiceSectionDescription>
                  {service.description}
                </ServiceSectionDescription>
                <ServiceSectionPrice>
                  {formatMoney(service.priceCents)}
                </ServiceSectionPrice>
                <ButtonLarge as={Link} href={`/services/${service.slug}`}>
                  Learn More
                </ButtonLarge>
              </ServiceSectionInfo>
            </ServiceSectionContent>
            {scrollIndicator}
          </ServiceSection>
        )
      })}
    </ServicesPage>
  )
}
