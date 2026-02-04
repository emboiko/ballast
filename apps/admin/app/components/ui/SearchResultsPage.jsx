"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatMoney } from "@ballast/shared/src/money.js"
import { search as searchGateway } from "@/gateways/searchGateway"
import { SEARCH_PAGE_LIMIT } from "@/constants"
import { useSearch } from "@/contexts/SearchContext"
import PageLayout from "@/components/ui/PageLayout"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import {
  SearchPageContainer,
  SearchPageHeader,
  SearchPageTitle,
  SearchPageSubtitle,
  SearchPageFilters,
  SearchPageFilterButton,
  SearchPageFilterLabel,
  SearchPageFilterCount,
  SearchPageSection,
  SearchPageSectionTitle,
  SearchPageResultsList,
  SearchPageResultItem,
  SearchPageResultLink,
  ResultIcon,
  ResultInfo,
  ResultTitle,
  ResultSubtitle,
  ResultBadge,
  LoadMoreButton,
  LoadingMessage,
  NoResultsMessage,
} from "@/components/search/searchStyles"

const formatPlural = (count, singular, plural) => {
  if (count === 1) {
    return `${count} ${singular}`
  }

  return `${count} ${plural}`
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const { clearSearch } = useSearch()

  const [usersData, setUsersData] = useState(null)
  const [ordersData, setOrdersData] = useState(null)
  const [refundsData, setRefundsData] = useState(null)
  const [financingData, setFinancingData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false)
  const [isLoadingMoreOrders, setIsLoadingMoreOrders] = useState(false)
  const [isLoadingMoreRefunds, setIsLoadingMoreRefunds] = useState(false)
  const [isLoadingMoreFinancing, setIsLoadingMoreFinancing] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    if (query.trim()) {
      clearSearch()
    }
  }, [query, clearSearch])

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setUsersData(null)
      setOrdersData(null)
      setRefundsData(null)
      setFinancingData(null)
      return
    }

    setIsLoading(true)
    try {
      const results = await searchGateway(query, {
        type: "all",
        limit: SEARCH_PAGE_LIMIT,
      })
      setUsersData(results.users)
      setOrdersData(results.orders)
      setRefundsData(results.refunds)
      setFinancingData(results.financing)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  const loadMoreUsers = async () => {
    if (!usersData) {
      return
    }
    if (isLoadingMoreUsers) {
      return
    }

    setIsLoadingMoreUsers(true)
    try {
      const results = await searchGateway(query, {
        type: "users",
        limit: SEARCH_PAGE_LIMIT,
        offset: usersData.users.length,
      })

      setUsersData((prevUsersData) => {
        return {
          ...results.users,
          users: [...prevUsersData.users, ...results.users.users],
        }
      })

      clearSearch()
    } catch (error) {
      console.error("Load more users error:", error)
    } finally {
      setIsLoadingMoreUsers(false)
    }
  }

  const loadMoreOrders = async () => {
    if (!ordersData) {
      return
    }
    if (isLoadingMoreOrders) {
      return
    }

    setIsLoadingMoreOrders(true)
    try {
      const results = await searchGateway(query, {
        type: "orders",
        limit: SEARCH_PAGE_LIMIT,
        offset: ordersData.orders.length,
      })

      setOrdersData((prevOrdersData) => {
        return {
          ...results.orders,
          orders: [...prevOrdersData.orders, ...results.orders.orders],
        }
      })

      clearSearch()
    } catch (error) {
      console.error("Load more orders error:", error)
    } finally {
      setIsLoadingMoreOrders(false)
    }
  }

  const loadMoreRefunds = async () => {
    if (!refundsData) {
      return
    }
    if (isLoadingMoreRefunds) {
      return
    }

    setIsLoadingMoreRefunds(true)
    try {
      const results = await searchGateway(query, {
        type: "refunds",
        limit: SEARCH_PAGE_LIMIT,
        offset: refundsData.refunds.length,
      })

      setRefundsData((prevRefundsData) => {
        return {
          ...results.refunds,
          refunds: [...prevRefundsData.refunds, ...results.refunds.refunds],
        }
      })

      clearSearch()
    } catch (error) {
      console.error("Load more refunds error:", error)
    } finally {
      setIsLoadingMoreRefunds(false)
    }
  }

  const loadMoreFinancing = async () => {
    if (!financingData) {
      return
    }
    if (isLoadingMoreFinancing) {
      return
    }

    setIsLoadingMoreFinancing(true)
    try {
      const results = await searchGateway(query, {
        type: "financing",
        limit: SEARCH_PAGE_LIMIT,
        offset: financingData.plans.length,
      })

      setFinancingData((prevFinancingData) => {
        return {
          ...results.financing,
          plans: [...prevFinancingData.plans, ...results.financing.plans],
        }
      })

      clearSearch()
    } catch (error) {
      console.error("Load more financing error:", error)
    } finally {
      setIsLoadingMoreFinancing(false)
    }
  }

  const usersTotal = usersData?.total || 0
  const ordersTotal = ordersData?.total || 0
  const refundsTotal = refundsData?.total || 0
  const financingTotal = financingData?.total || 0
  const totalResults =
    usersTotal + ordersTotal + refundsTotal + financingTotal

  let filteredTotal = totalResults
  if (activeFilter === "users") {
    filteredTotal = usersTotal
  } else if (activeFilter === "orders") {
    filteredTotal = ordersTotal
  } else if (activeFilter === "refunds") {
    filteredTotal = refundsTotal
  } else if (activeFilter === "financing") {
    filteredTotal = financingTotal
  }

  let subtitleText = ""
  if (query) {
    if (isLoading) {
      subtitleText = "Searching..."
    } else {
      let labelSingular = "result"
      let labelPlural = "results"

      if (activeFilter === "users") {
        labelSingular = "user"
        labelPlural = "users"
      } else if (activeFilter === "orders") {
        labelSingular = "order"
        labelPlural = "orders"
      } else if (activeFilter === "refunds") {
        labelSingular = "refund"
        labelPlural = "refunds"
      } else if (activeFilter === "financing") {
        labelSingular = "financing plan"
        labelPlural = "financing plans"
      }

      const resultsLabel = formatPlural(
        filteredTotal,
        labelSingular,
        labelPlural
      )
      subtitleText = `${resultsLabel} for "${query}"`
    }
  }

  const showNoQueryMessage = !query
  const showEmptyResultsMessage = !isLoading && query && filteredTotal === 0

  let showUsersSection = !isLoading && usersData?.users?.length > 0
  let showOrdersSection = !isLoading && ordersData?.orders?.length > 0
  let showRefundsSection = !isLoading && refundsData?.refunds?.length > 0
  let showFinancingSection =
    !isLoading && financingData?.plans?.length > 0

  if (activeFilter !== "all" && activeFilter !== "users") {
    showUsersSection = false
  }
  if (activeFilter !== "all" && activeFilter !== "orders") {
    showOrdersSection = false
  }
  if (activeFilter !== "all" && activeFilter !== "refunds") {
    showRefundsSection = false
  }
  if (activeFilter !== "all" && activeFilter !== "financing") {
    showFinancingSection = false
  }

  let loadMoreUsersLabel = "Load more users"
  if (isLoadingMoreUsers) {
    loadMoreUsersLabel = "Loading..."
  }

  let loadMoreOrdersLabel = "Load more orders"
  if (isLoadingMoreOrders) {
    loadMoreOrdersLabel = "Loading..."
  }

  let loadMoreRefundsLabel = "Load more refunds"
  if (isLoadingMoreRefunds) {
    loadMoreRefundsLabel = "Loading..."
  }

  let loadMoreFinancingLabel = "Load more financing plans"
  if (isLoadingMoreFinancing) {
    loadMoreFinancingLabel = "Loading..."
  }

  let emptyResultsMessage = `No results found for "${query}"`
  if (activeFilter === "users") {
    emptyResultsMessage = `No users found for "${query}"`
  } else if (activeFilter === "orders") {
    emptyResultsMessage = `No orders found for "${query}"`
  } else if (activeFilter === "refunds") {
    emptyResultsMessage = `No refunds found for "${query}"`
  } else if (activeFilter === "financing") {
    emptyResultsMessage = `No financing plans found for "${query}"`
  }

  return (
    <PageLayout>
      <SearchPageContainer>
        <SearchPageHeader>
          <SearchPageTitle>Search Results</SearchPageTitle>
          {subtitleText && (
            <SearchPageSubtitle>{subtitleText}</SearchPageSubtitle>
          )}
          <SearchPageFilters>
            <SearchPageFilterButton
              type="button"
              $active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            >
              <SearchPageFilterLabel>All results</SearchPageFilterLabel>
              <SearchPageFilterCount>
                {totalResults} total
              </SearchPageFilterCount>
            </SearchPageFilterButton>
            <SearchPageFilterButton
              type="button"
              $active={activeFilter === "users"}
              onClick={() => setActiveFilter("users")}
            >
              <SearchPageFilterLabel>Users</SearchPageFilterLabel>
              <SearchPageFilterCount>{usersTotal} found</SearchPageFilterCount>
            </SearchPageFilterButton>
            <SearchPageFilterButton
              type="button"
              $active={activeFilter === "orders"}
              onClick={() => setActiveFilter("orders")}
            >
              <SearchPageFilterLabel>Orders</SearchPageFilterLabel>
              <SearchPageFilterCount>{ordersTotal} found</SearchPageFilterCount>
            </SearchPageFilterButton>
            <SearchPageFilterButton
              type="button"
              $active={activeFilter === "refunds"}
              onClick={() => setActiveFilter("refunds")}
            >
              <SearchPageFilterLabel>Refunds</SearchPageFilterLabel>
              <SearchPageFilterCount>
                {refundsTotal} found
              </SearchPageFilterCount>
            </SearchPageFilterButton>
            <SearchPageFilterButton
              type="button"
              $active={activeFilter === "financing"}
              onClick={() => setActiveFilter("financing")}
            >
              <SearchPageFilterLabel>Financing</SearchPageFilterLabel>
              <SearchPageFilterCount>
                {financingTotal} found
              </SearchPageFilterCount>
            </SearchPageFilterButton>
          </SearchPageFilters>
        </SearchPageHeader>

        {showNoQueryMessage && (
          <NoResultsMessage>
            Enter a search term to find users, orders, refunds, and financing.
          </NoResultsMessage>
        )}

        {isLoading && <LoadingMessage>Searching...</LoadingMessage>}

        {showEmptyResultsMessage && (
          <NoResultsMessage>{emptyResultsMessage}</NoResultsMessage>
        )}

        {showUsersSection && (
          <SearchPageSection>
            <SearchPageSectionTitle>
              👥 Users ({usersData.total})
            </SearchPageSectionTitle>
            <SearchPageResultsList>
              {usersData.users.map((user) => {
                const ordersLabel = formatPlural(
                  user.orderCount,
                  "order",
                  "orders"
                )

                let adminLabel = ""
                if (user.isAdmin) {
                  adminLabel = " • Admin"
                }

                const joinedDate = new Date(user.createdAt).toLocaleDateString()

                return (
                  <SearchPageResultItem key={user.id}>
                    <SearchPageResultLink as={Link} href={`/users/${user.id}`}>
                      <ResultIcon>👤</ResultIcon>
                      <ResultInfo>
                        <ResultTitle>{user.email}</ResultTitle>
                        <ResultSubtitle>
                          ID: {user.id} • {ordersLabel}
                          {adminLabel} • Joined {joinedDate}
                        </ResultSubtitle>
                      </ResultInfo>
                      {!user.emailVerified && (
                        <ResultBadge $status="pending">Unverified</ResultBadge>
                      )}
                    </SearchPageResultLink>
                  </SearchPageResultItem>
                )
              })}
            </SearchPageResultsList>
            {usersData.hasMore && (
              <LoadMoreButton
                onClick={loadMoreUsers}
                disabled={isLoadingMoreUsers}
              >
                {loadMoreUsersLabel}
              </LoadMoreButton>
            )}
          </SearchPageSection>
        )}

        {showOrdersSection && (
          <SearchPageSection>
            <SearchPageSectionTitle>
              📦 Orders ({ordersData.total})
            </SearchPageSectionTitle>
            <SearchPageResultsList>
              {ordersData.orders.map((order) => {
                const formattedAmount = formatMoney(
                  order.amountCents,
                  order.currency
                )
                const formattedDate = new Date(
                  order.createdAt
                ).toLocaleDateString()

                return (
                  <SearchPageResultItem key={order.id}>
                    <SearchPageResultLink
                      as={Link}
                      href={`/orders/${order.id}`}
                    >
                      <ResultIcon>📦</ResultIcon>
                      <ResultInfo>
                        <ResultTitle>{order.id}</ResultTitle>
                        <ResultSubtitle>
                          {order.user.email} • {formattedAmount} •{" "}
                          {formattedDate}
                        </ResultSubtitle>
                      </ResultInfo>
                      <ResultBadge $status={order.status}>
                        {order.status}
                      </ResultBadge>
                    </SearchPageResultLink>
                  </SearchPageResultItem>
                )
              })}
            </SearchPageResultsList>
            {ordersData.hasMore && (
              <LoadMoreButton
                onClick={loadMoreOrders}
                disabled={isLoadingMoreOrders}
              >
                {loadMoreOrdersLabel}
              </LoadMoreButton>
            )}
          </SearchPageSection>
        )}

        {showRefundsSection && (
          <SearchPageSection>
            <SearchPageSectionTitle>
              💸 Refunds ({refundsData.total})
            </SearchPageSectionTitle>
            <SearchPageResultsList>
              {refundsData.refunds.map((refund) => {
                let amountLabel = "Amount pending"
                if (typeof refund.amountCents === "number") {
                  amountLabel = formatMoney(refund.amountCents, refund.currency)
                }

                let userEmailLabel = "Unknown user"
                if (refund.requestedByUser?.email) {
                  userEmailLabel = refund.requestedByUser.email
                }

                const formattedDate = new Date(
                  refund.createdAt
                ).toLocaleDateString()

                const subtitleParts = [
                  userEmailLabel,
                  amountLabel,
                  formattedDate,
                ]
                if (refund.orderId) {
                  subtitleParts.splice(1, 0, `Order: ${refund.orderId}`)
                }

                let statusLabel = refund.status
                if (refund.status) {
                  statusLabel = formatStatusLabel(refund.status)
                }

                return (
                  <SearchPageResultItem key={refund.id}>
                    <SearchPageResultLink
                      as={Link}
                      href={`/refunds/${refund.id}`}
                    >
                      <ResultIcon>💸</ResultIcon>
                      <ResultInfo>
                        <ResultTitle>{refund.id}</ResultTitle>
                        <ResultSubtitle>
                          {subtitleParts.join(" • ")}
                        </ResultSubtitle>
                      </ResultInfo>
                      <ResultBadge $status={refund.status}>
                        {statusLabel}
                      </ResultBadge>
                    </SearchPageResultLink>
                  </SearchPageResultItem>
                )
              })}
            </SearchPageResultsList>
            {refundsData.hasMore && (
              <LoadMoreButton
                onClick={loadMoreRefunds}
                disabled={isLoadingMoreRefunds}
              >
                {loadMoreRefundsLabel}
              </LoadMoreButton>
            )}
          </SearchPageSection>
        )}

        {showFinancingSection && (
          <SearchPageSection>
            <SearchPageSectionTitle>
              💳 Financing ({financingData.total})
            </SearchPageSectionTitle>
            <SearchPageResultsList>
              {financingData.plans.map((plan) => {
                const formattedTotal = formatMoney(
                  plan.totalAmountCents,
                  plan.currency
                )
                const formattedRemaining = formatMoney(
                  plan.remainingBalanceCents,
                  plan.currency
                )

                let userEmailLabel = "Unknown user"
                if (plan.user?.email) {
                  userEmailLabel = plan.user.email
                }

                const subtitleParts = [
                  userEmailLabel,
                  `Total: ${formattedTotal}`,
                  `Remaining: ${formattedRemaining}`,
                ]

                if (plan.cadence) {
                  subtitleParts.push(`Cadence: ${plan.cadence}`)
                }

                if (plan.nextPaymentDate) {
                  const formattedDate = new Date(
                    plan.nextPaymentDate
                  ).toLocaleDateString()
                  subtitleParts.push(`Next: ${formattedDate}`)
                }

                let statusLabel = plan.status
                if (plan.status) {
                  statusLabel = formatStatusLabel(plan.status)
                }

                return (
                  <SearchPageResultItem key={plan.id}>
                    <SearchPageResultLink
                      as={Link}
                      href={`/financing/${plan.id}`}
                    >
                      <ResultIcon>💳</ResultIcon>
                      <ResultInfo>
                        <ResultTitle>{plan.id}</ResultTitle>
                        <ResultSubtitle>
                          {subtitleParts.join(" • ")}
                        </ResultSubtitle>
                      </ResultInfo>
                      <ResultBadge $status={plan.status}>
                        {statusLabel}
                      </ResultBadge>
                    </SearchPageResultLink>
                  </SearchPageResultItem>
                )
              })}
            </SearchPageResultsList>
            {financingData.hasMore && (
              <LoadMoreButton
                onClick={loadMoreFinancing}
                disabled={isLoadingMoreFinancing}
              >
                {loadMoreFinancingLabel}
              </LoadMoreButton>
            )}
          </SearchPageSection>
        )}
      </SearchPageContainer>
    </PageLayout>
  )
}
