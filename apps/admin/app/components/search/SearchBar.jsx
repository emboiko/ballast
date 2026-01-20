"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useSearch } from "@/contexts/SearchContext"
import {
  UsersSection,
  OrdersSection,
  RefundsSection,
} from "@/components/search/SearchResults"
import {
  SearchContainer,
  SearchInputWrapper,
  SearchIcon,
  SearchInput,
  ClearButton,
  SearchDropdown,
  ViewAllLink,
  LoadingMessage,
  NoResultsMessage,
} from "@/components/search/searchStyles"

export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const {
    query,
    results,
    isLoading,
    isDropdownOpen,
    hasResults,
    hasMore,
    updateQuery,
    clearSearch,
    closeDropdown,
    openDropdown,
  } = useSearch()

  const clearAndBlur = () => {
    clearSearch()
    inputRef.current?.blur()
  }

  useEffect(() => {
    clearAndBlur()
  }, [pathname, searchParamsString, clearSearch])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        closeDropdown()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [closeDropdown])

  const handleInputChange = (event) => {
    updateQuery(event.target.value)
  }

  const handleInputFocus = () => {
    openDropdown()
  }

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      closeDropdown()
      inputRef.current?.blur()
    } else if (event.key === "Enter" && query.trim()) {
      const encodedQuery = encodeURIComponent(query.trim())
      closeDropdown()
      router.push(`/search?q=${encodedQuery}`)
      clearAndBlur()
    }
  }

  const handleResultClick = () => {
    closeDropdown()
    clearAndBlur()
  }

  const handleViewAll = () => {
    closeDropdown()
    setTimeout(() => {
      clearAndBlur()
    }, 0)
  }

  const showDropdown = isDropdownOpen && query.trim().length > 0

  return (
    <SearchContainer ref={containerRef}>
      <SearchInputWrapper>
        <SearchIcon>🔍</SearchIcon>
        <SearchInput
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search users, orders, refunds..."
          aria-label="Search"
        />
        {query && (
          <ClearButton onClick={clearSearch} aria-label="Clear search">
            ×
          </ClearButton>
        )}
      </SearchInputWrapper>

      {showDropdown && (
        <SearchDropdown>
          {isLoading && <LoadingMessage>Searching...</LoadingMessage>}

          {!isLoading && !hasResults && (
            <NoResultsMessage>No results found for "{query}"</NoResultsMessage>
          )}

          {!isLoading && hasResults && (
            <>
              <UsersSection
                users={results?.users?.users}
                total={results?.users?.total}
                onResultClick={handleResultClick}
              />
              <OrdersSection
                orders={results?.orders?.orders}
                total={results?.orders?.total}
                onResultClick={handleResultClick}
              />
              <RefundsSection
                refunds={results?.refunds?.refunds}
                total={results?.refunds?.total}
                onResultClick={handleResultClick}
              />
              {hasMore && (
                <ViewAllLink
                  as={Link}
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={handleViewAll}
                >
                  View all results →
                </ViewAllLink>
              )}
            </>
          )}
        </SearchDropdown>
      )}
    </SearchContainer>
  )
}
