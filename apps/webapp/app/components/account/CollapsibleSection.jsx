"use client"

import {
  CollapsibleSection as StyledCollapsibleSection,
  CollapsibleHeader,
  CollapsibleHeaderInfo,
  CollapsibleTitle,
  CollapsibleDescription,
  CollapsibleIcon,
  CollapsibleContentWrapper,
  CollapsibleContent,
  CollapsibleContentInner,
} from "@/components/account/accountStyles"

export default function CollapsibleSection({
  title,
  description,
  children,
  isOpen,
  onToggle,
}) {
  return (
    <StyledCollapsibleSection>
      <CollapsibleHeader
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <CollapsibleHeaderInfo>
          <CollapsibleTitle>{title}</CollapsibleTitle>
          {description && (
            <CollapsibleDescription>{description}</CollapsibleDescription>
          )}
        </CollapsibleHeaderInfo>
        <CollapsibleIcon>{isOpen ? "−" : "+"}</CollapsibleIcon>
      </CollapsibleHeader>
      <CollapsibleContentWrapper $isOpen={isOpen}>
        <CollapsibleContent>
          <CollapsibleContentInner>{children}</CollapsibleContentInner>
        </CollapsibleContent>
      </CollapsibleContentWrapper>
    </StyledCollapsibleSection>
  )
}
