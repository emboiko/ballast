import styled from "styled-components"
import Link from "next/link"

export const FinancingLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const FinancingFiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

export const FinancingFilterChip = styled.button`
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

export const FinancingFilterCount = styled.span`
  color: var(--text-secondary);
  font-size: 0.8125rem;
`

export const FinancingCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  padding: 1.25rem;
`

export const FinancingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const FinancingRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`

export const FinancingLabel = styled.span`
  color: var(--text-secondary);
`

export const FinancingValue = styled.span`
  color: var(--text-primary);
  font-weight: 600;
`

export const FinancingLink = styled(Link)`
  color: var(--link-color);
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`

export const FinancingStatus = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
`

export const FinancingSectionTitle = styled.h3`
  margin: 0 0 0.5rem 0;
`
