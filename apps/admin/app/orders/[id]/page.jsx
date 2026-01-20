import AuthGuard from "@/components/auth/AuthGuard"
import OrderDetailPage from "@/components/orders/OrderDetailPage"

export default function OrderDetailPageRoute() {
  return (
    <AuthGuard>
      <OrderDetailPage />
    </AuthGuard>
  )
}
