"use client"

import Link from "next/link"
import {
  AppFooter,
  FooterContainer,
  FooterSection,
  FooterText,
  FooterLink,
} from "@/components/ui/uiStyles"

export default function Footer() {
  return (
    <AppFooter>
      <FooterContainer>
        <FooterSection>
          <FooterText>
            © {new Date().getFullYear()} Ballast. All rights reserved.
          </FooterText>
        </FooterSection>
        <FooterSection $isLinks>
          <FooterLink as={Link} href="/terms">
            Terms of Service
          </FooterLink>
          <FooterLink as={Link} href="/privacy">
            Privacy Policy
          </FooterLink>
          <FooterLink as={Link} href="/faq">
            FAQ
          </FooterLink>
          <FooterLink as={Link} href="/about">
            About
          </FooterLink>
          <FooterLink as={Link} href="/contact">
            Contact
          </FooterLink>
        </FooterSection>
      </FooterContainer>
    </AppFooter>
  )
}
