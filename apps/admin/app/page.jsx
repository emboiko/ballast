import AuthGuard from "@/components/auth/AuthGuard"
import DashboardPage from "@/components/dashboard/DashboardPage"

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  )
}
