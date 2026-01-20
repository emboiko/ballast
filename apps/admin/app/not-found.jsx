"use client"

import AuthGuard from "@/components/auth/AuthGuard"
import PageLayout from "@/components/ui/PageLayout"
import {
  PageHeader,
  PageTitle,
  PageSubtitle,
  SectionNavRow,
  SectionNavLink,
} from "@/components/ui/uiStyles"

export default function NotFound() {
  return (
    <AuthGuard>
      <PageLayout>
        <PageHeader>
          <PageTitle>Page not found</PageTitle>
          <PageSubtitle>
            This route doesn&apos;t exist in the admin dashboard.
          </PageSubtitle>
        </PageHeader>

        <SectionNavRow aria-label="Not found actions">
          <SectionNavLink href="/">Dashboard</SectionNavLink>
          <SectionNavLink href="/orders">Orders</SectionNavLink>
          <SectionNavLink href="/search">Search</SectionNavLink>
        </SectionNavRow>
      </PageLayout>
    </AuthGuard>
  )
}

