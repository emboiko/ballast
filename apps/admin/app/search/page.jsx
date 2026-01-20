import AuthGuard from "@/components/auth/AuthGuard"
import SearchResultsPage from "@/components/ui/SearchResultsPage"

export default function SearchPage() {
  return (
    <AuthGuard>
      <SearchResultsPage />
    </AuthGuard>
  )
}
