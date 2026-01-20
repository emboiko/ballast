import styled from "styled-components"
import Link from "next/link"

// ============================================================================
// Communications nav
// ============================================================================

export const CommunicationsNavContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1.25rem;
`

export const CommunicationsBreadcrumbs = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`

export const CommunicationsBreadcrumbsSeparator = styled.span`
  margin: 0 0.35rem;
`

export const CommunicationsNavRow = styled.nav`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

export const CommunicationsNavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: var(--bg-secondary);
    border-color: var(--text-secondary);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const CommunicationsNavLinkActive = styled(CommunicationsNavLink)`
  background-color: var(--status-success-bg-strong);
  border-color: var(--status-success-border);
  color: var(--button-primary-bg);
`

// ============================================================================
// Shared layout + panels
// ============================================================================

export const CommunicationsLayout = styled.div`
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 16px;
  align-items: start;
`

export const Panel = styled.div`
  border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 28px var(--shadow-light);
`

export const PanelHeader = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const PanelHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const PanelTitle = styled.div`
  font-weight: 600;
`

export const PanelSubtitle = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`

export const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const FilterButton = styled.button`
  appearance: none;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: var(--bg-primary);
    border-color: var(--text-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  ${(props) => {
    if (!props.$active) {
      return ""
    }
    return `
      background-color: var(--status-success-bg-strong);
      border-color: var(--status-success-border);
      color: var(--button-primary-bg);
      font-weight: 600;
    `
  }}
`

export const ToggleLabel = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
`

export const ToggleButton = styled.button`
  appearance: none;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: var(--bg-primary);
    border-color: var(--text-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  ${(props) => {
    if (!props.$enabled) {
      return ""
    }
    return `
      background-color: var(--button-primary-bg);
      border-color: var(--button-primary-bg);
      color: var(--button-primary-text);

      &:hover {
        background-color: var(--button-primary-hover);
        border-color: var(--button-primary-hover);
      }
    `
  }}
`

export const EmailList = styled.div`
  display: flex;
  flex-direction: column;
`

export const EmailListItemButton = styled.button`
  appearance: none;
  border: none;
  background-color: transparent;
  color: inherit;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--overlay-hover-light);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  ${(props) => {
    if (!props.$active) {
      return ""
    }
    return `
      background-color: var(--status-success-bg);
    `
  }}
`

export const UnreadDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: var(--button-primary-bg);
`

export const EmailSubject = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
`

export const EmailMetaRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-secondary);
`

export const DirectionBadge = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);

  ${(props) => {
    if (props.$direction === "INBOUND") {
      return `
        background-color: var(--status-info-bg);
        border-color: var(--status-info-border);
      `
    }
    return `
      background-color: var(--status-warning-bg);
      border-color: var(--status-warning-border);
    `
  }}
`

export const DetailContainer = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px 14px;
  font-size: 13px;
`

export const DetailLabel = styled.div`
  color: var(--text-secondary);
`

export const DetailValue = styled.div`
  word-break: break-word;
`

export const UserLink = styled(Link)`
  color: var(--link-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
    border-radius: 2px;
  }
`

export const BodyBox = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  background-color: var(--bg-secondary);
`

export const BodyText = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font-mono), monospace;
  font-size: 12px;
`

export const ReplyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const ReplyTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  resize: vertical;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.4;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background-color 0.2s;

  &:focus {
    border-color: var(--button-primary-bg);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ReplyButton = styled.button`
  align-self: flex-start;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--button-primary-bg);
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
    border-color: var(--button-primary-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const SecondaryButton = styled.button`
  align-self: flex-start;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--border-color);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const LoadMoreContainer = styled.div`
  padding: 12px 14px;
  display: flex;
  justify-content: center;
`

export const EmptyState = styled.div`
  padding: 14px;
  color: var(--text-secondary);
  font-size: 13px;
`

// ============================================================================
// Landing page
// ============================================================================

export const LandingGrid = styled.div`
  display: grid;
  gap: 16px;
`

export const LandingPanelBody = styled.div`
  padding: 14px;
`

export const LandingSectionTitle = styled.div`
  font-weight: 700;
  color: var(--text-primary);
`

export const LandingSectionBody = styled.div`
  margin-top: 6px;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.875rem;
`
