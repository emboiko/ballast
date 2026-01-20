import AuthGuard from "@/components/auth/AuthGuard"
import ContactSubmissionsPage from "@/components/communications/ContactSubmissionsPage"

export default function CommunicationsContactRoute() {
  return (
    <AuthGuard>
      <ContactSubmissionsPage />
    </AuthGuard>
  )
}
