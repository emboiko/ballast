import styled from "styled-components"
import { scrollbarStyles } from "@/components/ui/scrollbarStyles"

// ============================================================================
// Search Bar
// ============================================================================

export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`

export const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

export const SearchIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  font-size: 1rem;
  color: var(--text-secondary);
  pointer-events: none;
`

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--button-primary-bg);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

export const ClearButton = styled.button`
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  transition:
    color 0.2s,
    background-color 0.2s;

  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

// ============================================================================
// Dropdown
// ============================================================================

export const SearchDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  ${scrollbarStyles()}
`

export const SearchSection = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`

export const SearchSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
`

export const SearchSectionCount = styled.span`
  font-weight: 400;
`

export const SearchResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

export const SearchResultItem = styled.li`
  display: block;
`

export const SearchResultLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg-primary);
  }

  &:focus-visible {
    outline: none;
    background-color: var(--bg-primary);
    box-shadow: inset 0 0 0 2px var(--focus-ring);
  }
`

export const ResultIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`

export const ResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`

export const ResultTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ResultSubtitle = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ResultBadge = styled.span`
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  flex-shrink: 0;
  background-color: ${(props) => {
    if (props.$status === "succeeded") {
      return "var(--status-success-bg-strong)"
    }
    if (props.$status === "pending") {
      return "var(--status-warning-bg)"
    }
    if (props.$status === "approved") {
      return "var(--status-success-bg-strong)"
    }
    if (props.$status === "processed") {
      return "var(--status-success-bg-strong)"
    }
    if (props.$status === "rejected") {
      return "var(--status-error-bg-strong)"
    }
    if (props.$status === "failed") {
      return "var(--status-error-bg-strong)"
    }
    return "var(--bg-primary)"
  }};
  color: ${(props) => {
    if (props.$status === "succeeded") {
      return "var(--button-primary-bg)"
    }
    if (props.$status === "pending") {
      return "var(--button-warning-bg)"
    }
    if (props.$status === "approved") {
      return "var(--button-primary-bg)"
    }
    if (props.$status === "processed") {
      return "var(--button-primary-bg)"
    }
    if (props.$status === "rejected") {
      return "var(--button-danger-bg)"
    }
    if (props.$status === "failed") {
      return "var(--button-danger-bg)"
    }
    return "var(--text-secondary)"
  }};
`

export const ViewAllLink = styled.a`
  display: block;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--button-primary-bg);
  text-decoration: none;
  border-top: 1px solid var(--border-color);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg-primary);
  }

  &:focus-visible {
    outline: none;
    background-color: var(--bg-primary);
    box-shadow: inset 0 0 0 2px var(--focus-ring);
  }
`

export const LoadingMessage = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const NoResultsMessage = styled.div`
  padding: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

// ============================================================================
// Search Results Page
// ============================================================================

export const SearchPageContainer = styled.div`
  width: 100%;
  max-width: 100%;
`

export const SearchPageHeader = styled.div`
  margin-bottom: 1.5rem;
`

export const SearchPageFilters = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0 2rem;
`

export const SearchPageFilterButton = styled.button`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.75rem 0.9rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
  cursor: pointer;

  ${(props) => {
    if (props.$active) {
      return `
        background-color: var(--bg-primary);
        color: var(--text-primary);
        border-color: var(--button-primary-bg);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      `
    }
    return ""
  }}

  &:hover {
    border-color: var(--button-primary-bg);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const SearchPageFilterLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: inherit;
`

export const SearchPageFilterCount = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
`

export const SearchPageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`

export const SearchPageSubtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`

export const SearchPageSection = styled.div`
  margin-bottom: 2rem;
`

export const SearchPageSectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const SearchPageResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const SearchPageResultItem = styled.li`
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  overflow: hidden;
`

export const SearchPageResultLink = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--focus-ring);
  }
`

export const LoadMoreButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--button-primary-bg);
  background-color: transparent;
  border: 1px solid var(--button-primary-bg);
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--button-primary-bg);
    color: var(--button-primary-text);
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
