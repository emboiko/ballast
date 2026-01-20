import AuthGuard from "@/components/auth/AuthGuard"
import OrdersPage from "@/components/orders/OrdersPage"

export default function OrdersPageRoute() {
  return (
    <AuthGuard>
      <OrdersPage />
    </AuthGuard>
  )
}
