"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import { PageHeader, PageTitle, PageSubtitle } from "@/components/ui/uiStyles"
import { useToast } from "@/contexts/ToastContext"
import { useOrders } from "@/contexts/OrdersContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import { formatDate } from "@/utils/date"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import { getTrimmedSearchParamCaseInsensitive } from "@/utils/searchParams"
import OrderGrowthChart from "@/components/orders/OrderGrowthChart"
import {
  OrdersOverviewGrid,
  StatCardsGrid,
  StatCard,
  StatLabel,
  StatSubValue,
  StatValue,
  StatValueCompact,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  RangeButtonRow,
  RangeButton,
  ChartContainer,
  CollapsibleSection,
  SectionHeaderButton,
  SectionHeaderLeft,
  OverviewSectionTitle,
  SectionCount,
  SectionChevron,
  SectionBody,
  ScrollList,
  OrderRowCard,
  OrderRowLeft,
  OrderRowTitle,
  OrderRowMeta,
  OrderRowRight,
  OrderRowAmount,
  LoadMoreRow,
  LoadMoreButton,
  InlineErrorText,
  StatusBadge,
  EmptyListText,
  OrderRowLink,
} from "@/components/orders/ordersStyles"

export default function OrdersPage() {
  const { showErrorToast } = useToast()
  const { fetchOrders, fetchOrderStats, fetchOrderGrowth } = useOrders()
  const searchParams = useSearchParams()

  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [growthRange, setGrowthRange] = useState("month")
  const [growthBuckets, setGrowthBuckets] = useState([])
  const [growthLoading, setGrowthLoading] = useState(true)
  const [growthError, setGrowthError] = useState(null)

  const createPanelState = () => ({
    isOpen: false,
    hasLoadedOnce: false,
    orders: [],
    totalCount: null,
    offset: 0,
    hasMore: false,
    isLoading: false,
    error: null,
  })

  const [latestPanel, setLatestPanel] = useState(() => ({
    ...createPanelState(),
    isOpen: true,
  }))

  const normalizedUserId = useMemo(() => {
    return getTrimmedSearchParamCaseInsensitive(searchParams, "userId")
  }, [searchParams])

  useEffect(() => {
    setLatestPanel({ ...createPanelState(), isOpen: true })
  }, [normalizedUserId])

  const formatNumber = useCallback((value) => {
    if (typeof value !== "number") {
      return "—"
    }
    return new Intl.NumberFormat("en-US").format(value)
  }, [])

  const formatMoneyValue = useCallback((value) => {
    if (typeof value !== "number") {
      return "—"
    }
    return formatMoney(value)
  }, [])

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const data = await fetchOrderStats({
        userId: normalizedUserId || undefined,
      })
      setStats(data.stats)
    } catch (error) {
      setStats(null)
      showErrorToast(`Failed to load order stats: ${error.message}`)
    } finally {
      setStatsLoading(false)
    }
  }, [fetchOrderStats, normalizedUserId, showErrorToast])

  const loadGrowth = useCallback(
    async (range) => {
      try {
        setGrowthLoading(true)
        setGrowthError(null)
        const data = await fetchOrderGrowth({
          range,
          userId: normalizedUserId || undefined,
        })
        setGrowthBuckets(data.buckets)
      } catch (error) {
        setGrowthError(error.message)
        setGrowthBuckets([])
      } finally {
        setGrowthLoading(false)
      }
    },
    [fetchOrderGrowth, normalizedUserId]
  )

  const loadOrdersForPanel = useCallback(
    async ({ offset, append }) => {
      try {
        setLatestPanel((previous) => ({
          ...previous,
          isLoading: true,
          error: null,
        }))

        const response = await fetchOrders({
          limit: 20,
          offset,
          userId: normalizedUserId || undefined,
        })

        setLatestPanel((previous) => {
          let nextOrders = response.orders || []
          if (append) {
            nextOrders = [...previous.orders, ...nextOrders]
          }
          return {
            ...previous,
            orders: nextOrders,
            totalCount: response.total,
            offset: nextOrders.length,
            hasMore: response.hasMore,
            isLoading: false,
            hasLoadedOnce: true,
          }
        })
      } catch (error) {
        setLatestPanel((previous) => ({
          ...previous,
          isLoading: false,
          error: error.message,
        }))
      }
    },
    [fetchOrders, normalizedUserId]
  )

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadGrowth(growthRange)
  }, [growthRange, loadGrowth])

  useEffect(() => {
    if (!latestPanel.isOpen) {
      return
    }
    if (latestPanel.hasLoadedOnce) {
      return
    }
    if (latestPanel.isLoading) {
      return
    }
    loadOrdersForPanel({
      offset: 0,
      append: false,
    })
  }, [
    latestPanel.hasLoadedOnce,
    latestPanel.isLoading,
    latestPanel.isOpen,
    loadOrdersForPanel,
  ])

  const toggleLatestPanel = () => {
    setLatestPanel((previous) => {
      const nextIsOpen = !previous.isOpen
      return { ...previous, isOpen: nextIsOpen }
    })
  }

  const getStatusVariant = (status) => {
    if (status === "succeeded") {
      return "success"
    }
    if (status === "pending") {
      return "warning"
    }
    if (status === "failed") {
      return "error"
    }
    return undefined
  }

  const renderOrderBadges = (order) => {
    const badges = []
    const orderStatusVariant = getStatusVariant(order.status)
    let orderStatusLabel = "Unknown"
    if (order.status) {
      orderStatusLabel = formatStatusLabel(order.status)
    }
    badges.push({
      label: orderStatusLabel,
      variant: orderStatusVariant,
    })

    if (order.refundStatus) {
      let refundVariant
      if (order.refundStatus === "pending") {
        refundVariant = "warning"
      }
      badges.push({
        label: `Refunds: ${formatStatusLabel(order.refundStatus)}`,
        variant: refundVariant,
      })
    }

    return badges.map((badge) => (
      <StatusBadge key={badge.label} $variant={badge.variant}>
        {badge.label}
      </StatusBadge>
    ))
  }

  let totalOrdersValue = "…"
  let succeededOrdersValue = "…"
  let pendingOrdersValue = "…"
  let failedOrdersValue = "…"
  let totalAmountValue = "…"
  let refundedAmountValue = "…"
  let pendingRefundsValue = "…"

  if (!statsLoading) {
    totalOrdersValue = formatNumber(stats?.totalOrders)
    succeededOrdersValue = formatNumber(stats?.succeededOrders)
    pendingOrdersValue = formatNumber(stats?.pendingOrders)
    failedOrdersValue = formatNumber(stats?.failedOrders)
    totalAmountValue = formatMoneyValue(stats?.totalAmountCents)
    refundedAmountValue = formatMoneyValue(stats?.refundedAmountCents)
    pendingRefundsValue = formatNumber(stats?.pendingRefundRequests)
  }

  let growthContent = <OrderGrowthChart buckets={growthBuckets} />
  if (growthLoading) {
    growthContent = <EmptyListText>Loading growth…</EmptyListText>
  }

  let subtitleText = "Manage orders and refunds"
  if (normalizedUserId) {
    subtitleText = `Showing orders for user ${normalizedUserId}`
  }

  let totalOrdersLabel = "Total: —"
  let totalToDisplay = stats?.totalOrders
  if (typeof latestPanel.totalCount === "number") {
    totalToDisplay = latestPanel.totalCount
  }
  if (typeof totalToDisplay === "number") {
    totalOrdersLabel = `Total: ${formatNumber(totalToDisplay)}`
  }

  let loadedText = ""
  if (latestPanel.hasLoadedOnce && typeof totalToDisplay === "number") {
    loadedText = ` • Loaded ${formatNumber(latestPanel.orders.length)}`
  }

  let chevronText = "Show"
  if (latestPanel.isOpen) {
    chevronText = "Hide"
  }

  let loadMoreButtonText = "Load more"
  if (latestPanel.isLoading) {
    loadMoreButtonText = "Loading..."
  }
  if (!latestPanel.hasMore) {
    loadMoreButtonText = "No more"
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageTitle>Orders</PageTitle>
        <PageSubtitle>{subtitleText}</PageSubtitle>
      </PageHeader>

      <OrdersOverviewGrid>
        <StatCardsGrid>
          <StatCard>
            <StatLabel>Total orders</StatLabel>
            <StatValue>{totalOrdersValue}</StatValue>
            <StatSubValue>All-time orders processed</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Succeeded</StatLabel>
            <StatValue>{succeededOrdersValue}</StatValue>
            <StatSubValue>Completed orders</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Pending</StatLabel>
            <StatValue>{pendingOrdersValue}</StatValue>
            <StatSubValue>Awaiting completion</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Failed</StatLabel>
            <StatValue>{failedOrdersValue}</StatValue>
            <StatSubValue>Orders that failed</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Total revenue</StatLabel>
            <StatValueCompact>{totalAmountValue}</StatValueCompact>
            <StatSubValue>Gross order value</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Refunded</StatLabel>
            <StatValueCompact>{refundedAmountValue}</StatValueCompact>
            <StatSubValue>Refunded order value</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Pending refunds</StatLabel>
            <StatValue>{pendingRefundsValue}</StatValue>
            <StatSubValue>Awaiting review</StatSubValue>
          </StatCard>
        </StatCardsGrid>

        <Card>
          <CardHeader>
            <CardTitle>Order growth</CardTitle>
            <RangeButtonRow>
              <RangeButton
                type="button"
                $active={growthRange === "week"}
                onClick={() => setGrowthRange("week")}
              >
                Week
              </RangeButton>
              <RangeButton
                type="button"
                $active={growthRange === "month"}
                onClick={() => setGrowthRange("month")}
              >
                Month
              </RangeButton>
              <RangeButton
                type="button"
                $active={growthRange === "year"}
                onClick={() => setGrowthRange("year")}
              >
                Year
              </RangeButton>
              <RangeButton
                type="button"
                $active={growthRange === "all"}
                onClick={() => setGrowthRange("all")}
              >
                All
              </RangeButton>
            </RangeButtonRow>
          </CardHeader>
          <CardBody>
            {growthError && <InlineErrorText>{growthError}</InlineErrorText>}
            <ChartContainer>{growthContent}</ChartContainer>
          </CardBody>
        </Card>

        <CollapsibleSection>
          <SectionHeaderButton type="button" onClick={toggleLatestPanel}>
            <SectionHeaderLeft>
              <OverviewSectionTitle>Latest orders</OverviewSectionTitle>
              <SectionCount>
                {totalOrdersLabel}
                {loadedText}
              </SectionCount>
            </SectionHeaderLeft>
            <SectionChevron>{chevronText}</SectionChevron>
          </SectionHeaderButton>

          {latestPanel.isOpen && (
            <SectionBody>
              {latestPanel.error && (
                <InlineErrorText>{latestPanel.error}</InlineErrorText>
              )}

              {!latestPanel.isLoading &&
                latestPanel.orders.length === 0 &&
                latestPanel.hasLoadedOnce && (
                  <EmptyListText>No orders found.</EmptyListText>
                )}

              {latestPanel.orders.length > 0 && (
                <ScrollList>
                  {latestPanel.orders.map((order) => {
                    const orderAmountLabel = formatMoneyValue(order.amountCents)
                    const createdAtLabel = formatDate(order.createdAt)
                    const userEmail = order.user?.email || "Unknown user"
                    const processorLabel =
                      order.processor || "Unknown processor"

                    return (
                      <OrderRowCard key={order.id}>
                        <OrderRowLeft>
                          <OrderRowTitle>
                            <OrderRowLink href={`/orders/${order.id}`}>
                              Order #{order.id}
                            </OrderRowLink>
                          </OrderRowTitle>
                          <OrderRowMeta>
                            <span>
                              User:{" "}
                              <OrderRowLink href={`/users/${order.userId}`}>
                                {userEmail}
                              </OrderRowLink>
                            </span>
                            <span>Processor: {processorLabel}</span>
                            <span>Created: {createdAtLabel}</span>
                          </OrderRowMeta>
                        </OrderRowLeft>
                        <OrderRowRight>
                          <OrderRowAmount>{orderAmountLabel}</OrderRowAmount>
                          {renderOrderBadges(order)}
                        </OrderRowRight>
                      </OrderRowCard>
                    )
                  })}
                </ScrollList>
              )}

              {latestPanel.hasMore && (
                <LoadMoreRow>
                  <LoadMoreButton
                    type="button"
                    disabled={latestPanel.isLoading}
                    onClick={() =>
                      loadOrdersForPanel({
                        offset: latestPanel.offset,
                        append: true,
                      })
                    }
                  >
                    {loadMoreButtonText}
                  </LoadMoreButton>
                </LoadMoreRow>
              )}
            </SectionBody>
          )}
        </CollapsibleSection>
      </OrdersOverviewGrid>
    </PageLayout>
  )
}
