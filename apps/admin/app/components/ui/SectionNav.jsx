"use client"

import {
  SectionNavContainer,
  SectionNavHeaderRow,
  SectionNavLink,
  SectionNavLinkActive,
  SectionNavRow,
  SectionNavTitle,
  SectionNavSubtitle,
  SectionNavTitleBlock,
} from "@/components/ui/uiStyles"

export default function SectionNav({ title, subtitle, links }) {
  const normalizedLinks = Array.isArray(links) ? links : []

  const renderLink = ({ href, title, isActive }) => {
    if (isActive) {
      return (
        <SectionNavLinkActive key={href} href={href}>
          {title}
        </SectionNavLinkActive>
      )
    }
    return (
      <SectionNavLink key={href} href={href}>
        {title}
      </SectionNavLink>
    )
  }

  return (
    <SectionNavContainer>
      <SectionNavHeaderRow>
        {title || subtitle ? (
          <SectionNavTitleBlock>
            {title && <SectionNavTitle>{title}</SectionNavTitle>}
            {subtitle && <SectionNavSubtitle>{subtitle}</SectionNavSubtitle>}
          </SectionNavTitleBlock>
        ) : (
          <div />
        )}

        {normalizedLinks.length > 0 ? (
          <SectionNavRow aria-label="Section navigation">
            {normalizedLinks.map((link) => renderLink(link))}
          </SectionNavRow>
        ) : null}
      </SectionNavHeaderRow>
    </SectionNavContainer>
  )
}
