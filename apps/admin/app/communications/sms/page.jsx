import AuthGuard from "@/components/auth/AuthGuard"
import CommunicationsSmsPage from "@/components/communications/CommunicationsSmsPage"

export default function CommunicationsSmsRoute() {
  return (
    <AuthGuard>
      <CommunicationsSmsPage />
    </AuthGuard>
  )
}
