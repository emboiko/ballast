import styled from "styled-components"

export const JobsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const JobsFiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

export const JobFilterChip = styled.button`
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

export const JobFilterCount = styled.span`
  color: var(--text-secondary);
  font-size: 0.8125rem;
`

export const JobsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const JobCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-secondary);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const JobHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`

export const JobHeaderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const JobTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`

export const JobSubtext = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const JobStatusBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`

export const JobMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const JobMetaItem = styled.span`
  color: inherit;
`

export const JobDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
`

export const JobDetailCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  padding: 0.75rem 1rem;
`

export const JobDetailLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

export const JobDetailValue = styled.div`
  color: var(--text-primary);
  font-weight: 600;
  margin-top: 0.25rem;
`

export const JobDetailJson = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-secondary);
  font-size: 0.8125rem;
`

export const JobDetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const JobDetailHeading = styled.div`
  color: var(--text-primary);
  font-weight: 600;
`

export const JobEmptyState = styled.div`
  color: var(--text-secondary);
  padding: 1rem;
  border-radius: 10px;
  border: 1px dashed var(--border-color);
  background-color: var(--bg-secondary);
`

export const JobButton = styled.button`
  align-self: flex-start;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
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

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`
