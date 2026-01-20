import AuthGuard from "@/components/auth/AuthGuard"
import RefundDetailPage from "@/components/refunds/RefundDetailPage"

export default function RefundDetailPageRoute() {
  return (
    <AuthGuard>
      <RefundDetailPage />
    </AuthGuard>
  )
}
