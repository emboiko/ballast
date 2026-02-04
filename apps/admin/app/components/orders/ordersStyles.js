import styled from "styled-components"
import Link from "next/link"
import { scrollbarStyles } from "@/components/ui/scrollbarStyles"

export const OrdersOverviewGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

export const StatCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
`

export const StatCard = styled.div`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1rem 1.125rem;
  box-shadow: 0 10px 28px var(--shadow-medium);
`

export const StatLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`

export const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 650;
  color: var(--text-primary);
  line-height: 1.1;
`

export const StatValueCompact = styled.div`
  font-size: 1.25rem;
  font-weight: 650;
  color: var(--text-primary);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
`

export const StatSubValue = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const GrowthTooltipCard = styled.div`
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 10px 28px var(--shadow-medium);
  padding: 0.625rem 0.75rem;
`

export const GrowthTooltipTitle = styled.div`
  font-weight: 650;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`

export const GrowthTooltipRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const GrowthTooltipValue = styled.span`
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
`

export const GrowthEmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  border: 1px dashed var(--border-color);
  border-radius: 10px;
`

export const Card = styled.div`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 10px 28px var(--shadow-medium);
`

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
`

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 650;
  color: var(--text-primary);
`

export const CardBody = styled.div`
  padding: 1rem;
`

export const RangeButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

export const RangeButton = styled.button`
  height: 32px;
  padding: 0 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;

  &:hover {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  ${(props) => {
    if (props.$active) {
      return `
        background-color: var(--bg-primary);
        color: var(--button-primary-bg);
        border-color: var(--button-primary-bg);
        font-weight: 600;
      `
    }
    return ""
  }}
`

export const ChartContainer = styled.div`
  width: 100%;
  height: 260px;
`

export const CollapsibleSection = styled(Card)`
  overflow: hidden;
`

export const SectionHeaderButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  text-align: left;

  &:hover {
    background-color: var(--bg-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const SectionHeaderLeft = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 150px) 1fr;
  align-items: baseline;
  column-gap: 0.75rem;
`

export const OverviewSectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`

export const SectionCount = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const SectionChevron = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const SectionBody = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const ScrollList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 0.25rem;
  ${scrollbarStyles({
    trackColor: "var(--bg-secondary)",
    thumbColor: "var(--border-color)",
    hoverColor: "var(--button-primary-bg)",
  })}
`

export const OrderRowCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.75rem 1rem;

  &:hover {
    border-color: var(--button-primary-bg);
  }
`

export const OrderRowLink = styled(Link)`
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

export const OrderRowLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
`

export const OrderRowTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
`

export const OrderRowMeta = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

export const OrderRowAmount = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
`

export const OrderRowRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

export const LoadMoreRow = styled.div`
  display: flex;
  justify-content: center;
`

export const LoadMoreButton = styled.button`
  background-color: var(--button-secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    border-color: var(--button-primary-bg);
    color: var(--button-primary-bg);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const InlineErrorText = styled.div`
  color: var(--status-error-text);
  font-size: 0.875rem;
`

export const EmptyListText = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  background-color: var(--bg-secondary);

  ${(props) => {
    if (props.$variant === "success") {
      return `
        color: var(--status-success-text);
        border-color: var(--status-success-border);
        background-color: var(--status-success-bg);
      `
    }
    if (props.$variant === "warning") {
      return `
        color: var(--status-warning-text);
        border-color: var(--status-warning-border);
        background-color: var(--status-warning-bg);
      `
    }
    if (props.$variant === "info") {
      return `
        color: var(--text-secondary);
        border-color: var(--status-info-border);
        background-color: var(--status-info-bg);
      `
    }
    if (props.$variant === "error") {
      return `
        color: var(--status-error-text);
        border-color: var(--status-error-border);
        background-color: var(--status-error-bg);
      `
    }
    return ""
  }}
`

export const OrderDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const DetailSection = styled.section`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 10px 28px var(--shadow-medium);
`

export const SectionTitle = styled.h2`
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 650;
  color: var(--text-primary);
`

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem 1.5rem;
`

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

export const DetailLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
`

export const DetailValue = styled.span`
  color: var(--text-primary);
  font-size: 0.95rem;
`

export const DetailValueMono = styled.span`
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: var(--font-mono), monospace;
`

export const StatusBadgesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`

export const InlineLink = styled(Link)`
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

export const EmptyState = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`

export const DetailList = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 220px) 1fr;
  gap: 0.5rem 1rem;
`

export const DetailListLabel = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
`

export const DetailListValue = styled.span`
  font-size: 0.9rem;
  color: var(--text-primary);
`
