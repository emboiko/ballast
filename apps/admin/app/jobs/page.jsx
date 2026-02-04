import AuthGuard from "@/components/auth/AuthGuard"
import JobsPage from "@/components/jobs/JobsPage"

export default function JobsPageRoute() {
  return (
    <AuthGuard>
      <JobsPage />
    </AuthGuard>
  )
}
