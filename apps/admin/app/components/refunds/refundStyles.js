import styled from "styled-components"
import { scrollbarStyles } from "@/components/ui/scrollbarStyles"
import Link from "next/link"

export const RefundsContainer = styled.div`
  width: 100%;
`

export const RefundsFiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

export const RefundFilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: ${(props) => {
    if (props.$isActive) {
      return "var(--bg-tertiary)"
    }
    return "var(--bg-secondary)"
  }};
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    transform 0.06s;

  &:hover {
    background-color: var(--bg-tertiary);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const RefundFilterCount = styled.span`
  color: var(--text-secondary);
  font-size: 0.8125rem;
`

export const RefundsList = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-secondary);
`

export const RefundsListFooter = styled.div`
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
`

export const RefundRowLink = styled.a`
  display: grid;
  grid-template-columns: 140px 1fr 160px 140px;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  text-decoration: none;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 3px var(--focus-ring);
  }
`

export const RefundInlineLink = styled(Link)`
  color: var(--link-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: var(--link-hover);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
    border-radius: 4px;
  }
`

export const RefundExternalLink = styled.a`
  color: var(--link-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: var(--link-hover);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
    border-radius: 4px;
  }
`

export const RefundRowCell = styled.div`
  min-width: 0;
`

export const RefundRowTitle = styled.div`
  font-weight: 600;
  font-size: 0.9375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const RefundRowSubtext = styled.div`
  margin-top: 0.125rem;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const RefundStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid var(--border-color);
  background-color: ${(props) => {
    if (props.$status === "approved") {
      return "var(--status-success-bg-strong)"
    }
    if (props.$status === "pending") {
      return "var(--status-warning-bg)"
    }
    if (props.$status === "rejected") {
      return "var(--status-error-bg)"
    }
    if (props.$status === "failed") {
      return "var(--status-error-bg-strong)"
    }
    return "var(--bg-primary)"
  }};
  color: var(--text-primary);
`

export const RefundDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

export const RefundCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  padding: 1rem;
`

export const RefundSection = styled.div`
  margin-top: 1rem;
`

export const RefundCardTitle = styled.h2`
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
`

export const RefundMetaList = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 0.5rem 0.75rem;
  font-size: 0.875rem;
`

export const RefundMetaLabel = styled.div`
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
`

export const RefundMetaValue = styled.div`
  color: var(--text-primary);
  word-break: break-word;
`

export const RefundReasonValue = styled(RefundMetaValue)`
  max-height: 160px;
  overflow-y: auto;
  padding-right: 0.25rem;
  white-space: pre-wrap;
  ${scrollbarStyles()}
`

export const RefundActions = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const RefundFormRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 0.5rem 0.75rem;
  align-items: start;
`

export const RefundInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const RefundTextarea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 90px;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const RefundButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 0.875rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    transform 0.06s;

  &:hover:not(:disabled) {
    background-color: var(--bg-primary);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const RefundPrimaryButton = styled(RefundButton)`
  border-color: var(--button-primary-bg);
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);

  &:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
    border-color: var(--button-primary-hover);
  }
`

export const RefundDangerButton = styled(RefundButton)`
  border-color: var(--button-danger-bg);
  background-color: var(--button-danger-bg);
  color: var(--button-primary-text);

  &:hover:not(:disabled) {
    background-color: var(--button-danger-hover);
    border-color: var(--button-danger-hover);
  }
`

export const RefundEmptyState = styled.div`
  padding: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
`
