import styled from "styled-components"
import Link from "next/link"
import { scrollbarStyles } from "@/components/ui/scrollbarStyles"

// ============================================================================
// Users overview page
// ============================================================================

export const UsersOverviewGrid = styled.div`
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

export const StatSubValue = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

// ============================================================================
// Users growth chart
// ============================================================================

export const UserGrowthTooltipCard = styled.div`
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 10px 28px var(--shadow-medium);
  padding: 0.625rem 0.75rem;
`

export const UserGrowthTooltipTitle = styled.div`
  font-weight: 650;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`

export const UserGrowthTooltipRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const UserGrowthTooltipValue = styled.span`
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
`

export const UserGrowthEmptyState = styled.div`
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
  grid-template-columns: minmax(100px, 130px) 1fr;
  align-items: baseline;
  column-gap: 0.75rem;
  justify-items: start;
  min-width: 0;
`

export const OverviewSectionTitle = styled.div`
  font-size: 1rem;
  font-weight: 650;
  min-width: 0;
`

export const SectionCount = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
`

export const SectionChevron = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const SectionBody = styled.div`
  padding: 0.75rem 1rem 1rem;
`

export const ScrollList = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: auto;
  max-height: 340px;
  ${scrollbarStyles({
    trackColor: "var(--bg-secondary)",
    thumbColor: "var(--border-color)",
    hoverColor: "var(--button-primary-bg)",
  })}
`

export const UserRowLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.875rem;
  text-decoration: none;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  min-width: 680px;

  &:hover {
    background-color: var(--bg-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:last-child {
    border-bottom: none;
  }
`

export const UserRowLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`

export const UserRowEmail = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 520px;
`

export const UserRowMeta = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const UserRowRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`

export const LoadMoreRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 0.75rem;
`

export const LoadMoreButton = styled.button`
  height: 36px;
  padding: 0 0.875rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:hover:enabled {
    background-color: var(--bg-primary);
    border-color: var(--text-secondary);
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

export const InlineErrorText = styled.div`
  color: var(--status-error-border);
  font-size: 0.875rem;
  padding: 0.75rem 0;
`

export const EmptyListText = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 0.75rem 0.25rem;
`

// ============================================================================
// User detail page (moved from uiStyles.js)
// ============================================================================

export const UserDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const DetailSection = styled.section`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
`

export const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
`

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
`

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const DetailLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
`

export const DetailValue = styled.span`
  font-size: 0.9375rem;
  color: var(--text-primary);
  word-break: break-word;
`

export const DetailValueMono = styled(DetailValue)`
  font-family: var(--font-mono), monospace;
  font-size: 0.875rem;
`

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;

  ${(props) => {
    if (props.$variant === "success") {
      return `
        background-color: var(--status-success-bg-strong);
        color: var(--button-primary-bg);
      `
    }
    if (props.$variant === "warning") {
      return `
        background-color: var(--status-warning-bg);
        color: var(--button-warning-bg);
      `
    }
    if (props.$variant === "error") {
      return `
        background-color: var(--status-error-bg-strong);
        color: var(--button-danger-bg);
      `
    }
    return `
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
    `
  }}
`

export const StatusBadgesRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
`

export const ToggleTrack = styled.span`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  transition: background-color 0.2s;
  position: relative;

  ${(props) => {
    if (props.$checked) {
      return `
        background-color: var(--button-primary-bg);
      `
    }
    return `
      background-color: var(--border-color);
    `
  }}

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s;

    ${(props) => {
      if (props.$checked) {
        return `
          left: 22px;
        `
      }
      return `
        left: 2px;
      `
    }}
  }
`

export const ToggleLabel = styled.span`
  font-size: 0.9375rem;
  color: var(--text-primary);
`

export const ActionsSection = styled.section`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
`

export const ActionsDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1.5rem 0;
`

export const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const ActionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`

export const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`

export const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`

export const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const ActionButtonSecondary = styled(ActionButton)`
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);

  &:hover:not(:disabled) {
    background-color: var(--border-color);
  }
`

export const ActionButtonPrimary = styled(ActionButton)`
  background-color: var(--button-primary-bg);
  border: 1px solid var(--button-primary-bg);
  color: var(--button-primary-text);

  &:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
    border-color: var(--button-primary-hover);
  }
`

export const ActionButtonWarning = styled(ActionButton)`
  background-color: var(--status-warning-bg);
  border: 1px solid var(--status-warning-border);
  color: var(--button-warning-bg);

  &:hover:not(:disabled) {
    background-color: var(--button-warning-bg);
    color: white;
    border-color: var(--button-warning-bg);
  }
`

export const ActionButtonDanger = styled(ActionButton)`
  background-color: var(--status-error-bg);
  border: 1px solid var(--status-error-border);
  color: var(--button-danger-bg);

  &:hover:not(:disabled) {
    background-color: var(--button-danger-bg);
    color: white;
    border-color: var(--button-danger-bg);
  }
`

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
`

export const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: var(--text-secondary);
`

export const ExternalLink = styled.a`
  color: var(--link-color);
  text-decoration: none;
  font-family: var(--font-mono), monospace;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
    border-radius: 2px;
  }
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

export const ModalHintText = styled.p`
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const ModalPromptText = styled.p`
  margin-top: 1rem;
  color: var(--text-primary);
`

export const DisabledTooltipWrapper = styled.div`
  position: relative;
  display: inline-block;

  &:hover > span:last-child {
    visibility: visible;
    opacity: 1;
  }
`

export const TooltipText = styled.span`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  z-index: 10;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  transition: opacity 0.2s;
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: var(--border-color);
  }
`

export const SelfActionWarning = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
`
