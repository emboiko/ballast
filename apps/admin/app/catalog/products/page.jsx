import AuthGuard from "@/components/auth/AuthGuard"
import CatalogProductsPage from "@/components/catalog/CatalogProductsPage"

export default function CatalogProductsRoute() {
  return (
    <AuthGuard>
      <CatalogProductsPage />
    </AuthGuard>
  )
}
