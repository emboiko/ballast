import styled from "styled-components"
import { scrollbarStyles } from "@/components/ui/scrollbarStyles"

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1.5rem;
`

export const LiveFeedCard = styled.section`
  grid-column: span 12;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  overflow: hidden;
`

export const LiveFeedHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
`

export const LiveFeedHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

export const LiveFeedTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
`

export const LiveFeedSubtitle = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
`

export const LiveFeedActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const LiveFeedRefreshStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
`

export const LiveFeedButton = styled.button`
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    background-color 0.2s;

  &:hover {
    border-color: var(--text-secondary);
    background-color: var(--bg-secondary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const LiveFeedRefreshMeta = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`

export const LiveFeedList = styled.div`
  height: calc(100vh - 300px);
  overflow-y: auto;
  ${scrollbarStyles()};
`

export const LiveFeedItem = styled.article`
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:last-child {
    border-bottom: none;
  }
`

export const LiveFeedItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`

export const LiveFeedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  ${(props) => getBadgeStyles(props.$variant)}
`

export const LiveFeedTimestamp = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
`

export const LiveFeedItemTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`

export const LiveFeedItemDescription = styled.div`
  font-size: 0.95rem;
  color: var(--text-secondary);
`

export const LiveFeedInlineBadges = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: 0.5rem;
`

export const LiveFeedAuthBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`

export const LiveFeedItemMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
`

export const LiveFeedMetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
`

export const LiveFeedLoadMore = styled.div`
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-primary);
`

export const LiveFeedEmptyState = styled.div`
  padding: 2.5rem 2rem;
  text-align: center;
  color: var(--text-secondary);
`

export const LiveFeedErrorText = styled.p`
  margin: 0;
  color: var(--danger);
  font-size: 0.9rem;
`

const getBadgeStyles = (variant) => {
  if (variant === "user") {
    return `
      background-color: var(--status-info-bg);
      border-color: var(--status-info-border);
      color: var(--text-secondary);
    `
  }

  if (variant === "order") {
    return `
      background-color: var(--status-success-bg);
      border-color: var(--status-success-border);
      color: var(--button-primary-bg);
    `
  }

  if (variant === "refund") {
    return `
      background-color: var(--status-warning-bg);
      border-color: var(--status-warning-border);
      color: var(--button-warning-bg);
    `
  }

  if (variant === "email") {
    return `
      background-color: var(--status-info-bg);
      border-color: var(--status-info-border);
      color: var(--text-secondary);
    `
  }

  return `
    background-color: var(--status-info-bg);
    border-color: var(--status-info-border);
    color: var(--text-secondary);
  `
}
