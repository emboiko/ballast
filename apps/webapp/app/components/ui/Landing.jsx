"use client"

import Link from "next/link"
import {
  Landing as StyledLanding,
  LandingTitle,
  LandingDescription,
  LandingActions,
  LandingFeatures,
  FeatureCard,
  ButtonLarge,
} from "@/components/ui/uiStyles"

export default function Landing() {
  return (
    <StyledLanding>
      <LandingTitle>Welcome to Ballast</LandingTitle>
      <LandingDescription>
        Ballast is a reference implementation for transactional systems,
        financing workflows, and recurring service models, structured around a
        retroencabulation product catalog.
      </LandingDescription>

      <LandingActions>
        <ButtonLarge as={Link} href="/products">
          Products
        </ButtonLarge>
        <ButtonLarge as={Link} href="/services">
          Services
        </ButtonLarge>
      </LandingActions>

      <LandingFeatures>
        <FeatureCard>
          <h3>🔧 Complete Product Range</h3>
          <p>
            From turbo retroencabulators to replacement marzelvanes and
            prefamulated amulite bases, we offer everything you need for your
            retroencabulation infrastructure.
          </p>
        </FeatureCard>
        <FeatureCard>
          <h3>📅 Flexible Financing</h3>
          <p>
            Split your retroencabulator purchases into easily manageable payment
            plans. Choose from 6, 12, or 24-month terms to fit your budget.
          </p>
        </FeatureCard>
        <FeatureCard>
          <h3>🔄 Subscription Services</h3>
          <p>
            Subscribe to our preventive maintenance programs for regular
            inspections, priority support, and discounted parts to keep your
            systems running smoothly.
          </p>
        </FeatureCard>
      </LandingFeatures>
    </StyledLanding>
  )
}
