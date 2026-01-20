import AuthGuard from "@/components/auth/AuthGuard"
import UserDetailPage from "@/components/users/UserDetailPage"

export default function UserDetailPageRoute() {
  return (
    <AuthGuard>
      <UserDetailPage />
    </AuthGuard>
  )
}
