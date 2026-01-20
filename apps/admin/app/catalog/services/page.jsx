import AuthGuard from "@/components/auth/AuthGuard"
import CatalogServicesPage from "@/components/catalog/CatalogServicesPage"

export default function CatalogServicesRoute() {
  return (
    <AuthGuard>
      <CatalogServicesPage />
    </AuthGuard>
  )
}
