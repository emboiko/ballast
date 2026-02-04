"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react"
import { search as searchGateway } from "@/gateways/searchGateway"
import { SEARCH_DEBOUNCE_MS, SEARCH_DROPDOWN_LIMIT } from "@/constants"

const SearchContext = createContext(undefined)

export function SearchProvider({ children }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const debounceRef = useRef(null)

  const performSearch = useCallback(
    async (searchQuery, type = "all", limit = SEARCH_DROPDOWN_LIMIT) => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        setResults(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await searchGateway(searchQuery, { type, limit })
        setResults(data)
      } catch (err) {
        setError(err.message)
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const debouncedSearch = useCallback(
    (searchQuery) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (!searchQuery || searchQuery.trim().length === 0) {
        setResults(null)
        setIsLoading(false)
        setIsDropdownOpen(false)
        return
      }

      setIsLoading(true)
      setIsDropdownOpen(true)

      debounceRef.current = setTimeout(() => {
        performSearch(searchQuery)
      }, SEARCH_DEBOUNCE_MS)
    },
    [performSearch]
  )

  const updateQuery = useCallback(
    (newQuery) => {
      setQuery(newQuery)
      debouncedSearch(newQuery)
    },
    [debouncedSearch]
  )

  const clearSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    setQuery("")
    setResults(null)
    setError(null)
    setIsLoading(false)
    setIsDropdownOpen(false)
  }, [])

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false)
  }, [])

  const openDropdown = useCallback(() => {
    if (query.trim().length > 0) {
      setIsDropdownOpen(true)
    }
  }, [query])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const hasResults =
    results &&
    (results.users?.users?.length > 0 ||
      results.orders?.orders?.length > 0 ||
      results.refunds?.refunds?.length > 0 ||
      results.financing?.plans?.length > 0)

  const hasMore =
    results &&
    (results.users?.hasMore ||
      results.orders?.hasMore ||
      results.refunds?.hasMore ||
      results.financing?.hasMore)

  const value = {
    query,
    results,
    isLoading,
    error,
    isDropdownOpen,
    hasResults,
    hasMore,
    updateQuery,
    clearSearch,
    closeDropdown,
    openDropdown,
    performSearch,
  }

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
