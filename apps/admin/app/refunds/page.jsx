import AuthGuard from "@/components/auth/AuthGuard"
import RefundsPage from "@/components/refunds/RefundsPage"

export default function RefundsPageRoute() {
  return (
    <AuthGuard>
      <RefundsPage />
    </AuthGuard>
  )
}
