import AuthGuard from "@/components/auth/AuthGuard"
import CommunicationsEmailPage from "@/components/communications/CommunicationsEmailPage"

export default function CommunicationsEmailRoute() {
  return (
    <AuthGuard>
      <CommunicationsEmailPage />
    </AuthGuard>
  )
}
