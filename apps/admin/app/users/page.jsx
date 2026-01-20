import AuthGuard from "@/components/auth/AuthGuard"
import UsersPage from "@/components/users/UsersPage"

export default function UsersPageRoute() {
  return (
    <AuthGuard>
      <UsersPage />
    </AuthGuard>
  )
}
