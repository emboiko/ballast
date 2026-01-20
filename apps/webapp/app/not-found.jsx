"use client"

import Link from "next/link"
import PageLayout from "@/components/ui/PageLayout"
import {
  Landing as StyledLanding,
  LandingTitle,
  LandingDescription,
  LandingActions,
  ButtonLarge,
} from "@/components/ui/uiStyles"

export default function NotFound() {
  return (
    <PageLayout>
      <StyledLanding>
        <LandingTitle>Page not found</LandingTitle>
        <LandingDescription>
          We couldn&apos;t find that page. Try heading back to the homepage or
          browsing products and services.
        </LandingDescription>

        <LandingActions>
          <ButtonLarge as={Link} href="/">
            Home
          </ButtonLarge>
          <ButtonLarge as={Link} href="/products">
            Products
          </ButtonLarge>
          <ButtonLarge as={Link} href="/services">
            Services
          </ButtonLarge>
        </LandingActions>
      </StyledLanding>
    </PageLayout>
  )
}
