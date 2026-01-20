"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import PageLayout from "@/components/ui/PageLayout"
import { PageHeader, PageTitle, PageSubtitle } from "@/components/ui/uiStyles"
import { useToast } from "@/contexts/ToastContext"
import {
  fetchUsersGrowth,
  fetchUsersStats,
  listUsers,
} from "@/gateways/usersGateway"
import { formatDate } from "@/utils/date"
import UserGrowthChart from "@/components/users/UserGrowthChart"
import {
  UsersOverviewGrid,
  StatCardsGrid,
  StatCard,
  StatLabel,
  StatSubValue,
  StatValue,
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
  UserRowLink,
  UserRowLeft,
  UserRowEmail,
  UserRowMeta,
  UserRowRight,
  LoadMoreRow,
  LoadMoreButton,
  InlineErrorText,
  StatusBadge,
  EmptyListText,
} from "@/components/users/userStyles"

export default function UsersPage() {
  const { showErrorToast } = useToast()

  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [growthRange, setGrowthRange] = useState("month")
  const [growthBuckets, setGrowthBuckets] = useState([])
  const [growthLoading, setGrowthLoading] = useState(true)
  const [growthError, setGrowthError] = useState(null)

  const createPanelState = () => ({
    isOpen: false,
    hasLoadedOnce: false,
    users: [],
    totalCount: null,
    nextCursor: null,
    isLoading: false,
    error: null,
  })

  const [newestPanel, setNewestPanel] = useState(() => ({
    ...createPanelState(),
    isOpen: true,
  }))
  const [bannedPanel, setBannedPanel] = useState(() => createPanelState())
  const [archivedPanel, setArchivedPanel] = useState(() => createPanelState())

  const formatNumber = useCallback((value) => {
    if (typeof value !== "number") {
      return "—"
    }
    return new Intl.NumberFormat("en-US").format(value)
  }, [])

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const data = await fetchUsersStats()
      setStats(data.stats)
    } catch (error) {
      setStats(null)
      showErrorToast(`Failed to load user stats: ${error.message}`)
    } finally {
      setStatsLoading(false)
    }
  }, [showErrorToast])

  const loadGrowth = useCallback(async (range) => {
    try {
      setGrowthLoading(true)
      setGrowthError(null)
      const data = await fetchUsersGrowth({ range })
      setGrowthBuckets(data.buckets)
    } catch (error) {
      setGrowthError(error.message)
      setGrowthBuckets([])
    } finally {
      setGrowthLoading(false)
    }
  }, [])

  const loadUsersForPanel = useCallback(
    async ({ filter, setPanelState, cursor, append }) => {
      try {
        setPanelState((previous) => ({
          ...previous,
          isLoading: true,
          error: null,
        }))

        const response = await listUsers({
          filter,
          limit: 20,
          cursor,
        })

        setPanelState((previous) => {
          let nextUsers = response.users
          if (append) {
            nextUsers = [...previous.users, ...response.users]
          }
          return {
            ...previous,
            users: nextUsers,
            totalCount: response.totalCount,
            nextCursor: response.nextCursor,
            isLoading: false,
            hasLoadedOnce: true,
          }
        })
      } catch (error) {
        setPanelState((previous) => ({
          ...previous,
          isLoading: false,
          error: error.message,
        }))
      }
    },
    []
  )

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadGrowth(growthRange)
  }, [growthRange, loadGrowth])

  useEffect(() => {
    if (
      newestPanel.isOpen &&
      !newestPanel.hasLoadedOnce &&
      !newestPanel.isLoading
    ) {
      loadUsersForPanel({
        filter: "newest",
        setPanelState: setNewestPanel,
        cursor: null,
        append: false,
      })
    }
  }, [
    loadUsersForPanel,
    newestPanel.hasLoadedOnce,
    newestPanel.isLoading,
    newestPanel.isOpen,
  ])

  useEffect(() => {
    if (
      bannedPanel.isOpen &&
      !bannedPanel.hasLoadedOnce &&
      !bannedPanel.isLoading
    ) {
      loadUsersForPanel({
        filter: "banned",
        setPanelState: setBannedPanel,
        cursor: null,
        append: false,
      })
    }
  }, [
    bannedPanel.hasLoadedOnce,
    bannedPanel.isLoading,
    bannedPanel.isOpen,
    loadUsersForPanel,
  ])

  useEffect(() => {
    if (
      archivedPanel.isOpen &&
      !archivedPanel.hasLoadedOnce &&
      !archivedPanel.isLoading
    ) {
      loadUsersForPanel({
        filter: "archived",
        setPanelState: setArchivedPanel,
        cursor: null,
        append: false,
      })
    }
  }, [
    archivedPanel.hasLoadedOnce,
    archivedPanel.isLoading,
    archivedPanel.isOpen,
    loadUsersForPanel,
  ])

  const toggleNewestPanel = () => {
    setNewestPanel((previous) => {
      const nextIsOpen = !previous.isOpen
      return { ...previous, isOpen: nextIsOpen }
    })
  }

  const toggleBannedPanel = () => {
    setBannedPanel((previous) => {
      const nextIsOpen = !previous.isOpen
      return { ...previous, isOpen: nextIsOpen }
    })
  }

  const toggleArchivedPanel = () => {
    setArchivedPanel((previous) => {
      const nextIsOpen = !previous.isOpen
      return { ...previous, isOpen: nextIsOpen }
    })
  }

  const getPanelTotals = useMemo(() => {
    const totals = {
      newest: stats?.totalUsers,
      banned: stats?.totalBannedUsers,
      archived: stats?.totalArchivedUsers,
    }
    return totals
  }, [stats])

  const renderUserBadges = (user) => {
    const badges = []

    if (user.isAdmin) {
      badges.push({ label: "Admin", variant: "success" })
    }

    if (!user.emailVerified) {
      badges.push({ label: "Unverified", variant: "warning" })
    }

    if (user.bannedAt) {
      badges.push({ label: "Banned", variant: "error" })
    }

    if (user.archivedAt) {
      badges.push({ label: "Archived", variant: "error" })
    }

    return badges.map((badge) => (
      <StatusBadge key={badge.label} $variant={badge.variant}>
        {badge.label}
      </StatusBadge>
    ))
  }

  const renderPanel = ({ panel, setPanelState, filter, title, onToggle }) => {
    const totalFromStats = getPanelTotals[filter]
    const total = panel.totalCount
    let totalToDisplay = totalFromStats
    if (typeof total === "number") {
      totalToDisplay = total
    }

    let headerCountText = "Total: —"
    if (typeof totalToDisplay === "number") {
      headerCountText = `Total: ${formatNumber(totalToDisplay)}`
    }

    let loadedText = ""
    if (panel.hasLoadedOnce && typeof totalToDisplay === "number") {
      loadedText = ` • Loaded ${formatNumber(panel.users.length)}`
    }

    let chevronText = "Show"
    if (panel.isOpen) {
      chevronText = "Hide"
    }

    let loadMoreButtonText = "Load more"
    if (panel.isLoading) {
      loadMoreButtonText = "Loading..."
    }

    return (
      <CollapsibleSection>
        <SectionHeaderButton
          type="button"
          onClick={() => {
            onToggle()
          }}
        >
          <SectionHeaderLeft>
            <OverviewSectionTitle>{title}</OverviewSectionTitle>
            <SectionCount>
              {headerCountText}
              {loadedText}
            </SectionCount>
          </SectionHeaderLeft>
          <SectionChevron>{chevronText}</SectionChevron>
        </SectionHeaderButton>

        {panel.isOpen && (
          <SectionBody>
            {panel.error && <InlineErrorText>{panel.error}</InlineErrorText>}

            {!panel.isLoading &&
              panel.users.length === 0 &&
              panel.hasLoadedOnce && (
                <EmptyListText>No users found.</EmptyListText>
              )}

            {panel.users.length > 0 && (
              <ScrollList>
                {panel.users.map((user) => (
                  <UserRowLink key={user.id} href={`/users/${user.id}`}>
                    <UserRowLeft>
                      <UserRowEmail>{user.email}</UserRowEmail>
                      <UserRowMeta>
                        Created {formatDate(user.createdAt)}
                      </UserRowMeta>
                    </UserRowLeft>
                    <UserRowRight>{renderUserBadges(user)}</UserRowRight>
                  </UserRowLink>
                ))}
              </ScrollList>
            )}

            {panel.nextCursor && (
              <LoadMoreRow>
                <LoadMoreButton
                  type="button"
                  disabled={panel.isLoading}
                  onClick={() =>
                    loadUsersForPanel({
                      filter,
                      setPanelState,
                      cursor: panel.nextCursor,
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
    )
  }

  let totalUsersValue = "…"
  let bannedUsersValue = "…"
  let archivedUsersValue = "…"
  let stripeCustomersValue = "…"
  let braintreeCustomersValue = "…"
  let squareCustomersValue = "…"
  let authorizeCustomersValue = "…"
  let googleUsersValue = "…"

  if (!statsLoading) {
    totalUsersValue = formatNumber(stats?.totalUsers)
    bannedUsersValue = formatNumber(stats?.totalBannedUsers)
    archivedUsersValue = formatNumber(stats?.totalArchivedUsers)
    stripeCustomersValue = formatNumber(stats?.usersWithStripeCustomerId)
    braintreeCustomersValue = formatNumber(stats?.usersWithBraintreeCustomerId)
    squareCustomersValue = formatNumber(stats?.usersWithSquareCustomerId)
    authorizeCustomersValue = formatNumber(stats?.usersWithAuthorizeCustomerId)
    googleUsersValue = formatNumber(stats?.totalGoogleUsers)
  }

  let growthContent = <UserGrowthChart buckets={growthBuckets} />
  if (growthLoading) {
    growthContent = <EmptyListText>Loading growth…</EmptyListText>
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageTitle>Users</PageTitle>
        <PageSubtitle>Overview, statistics, and user management</PageSubtitle>
      </PageHeader>

      <UsersOverviewGrid>
        <StatCardsGrid>
          <StatCard>
            <StatLabel>Total users</StatLabel>
            <StatValue>{totalUsersValue}</StatValue>
            <StatSubValue>Google users: {googleUsersValue}</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Banned users</StatLabel>
            <StatValue>{bannedUsersValue}</StatValue>
            <StatSubValue>Accounts with a ban set</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Archived users</StatLabel>
            <StatValue>{archivedUsersValue}</StatValue>
            <StatSubValue>Soft-deleted accounts</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Stripe customers</StatLabel>
            <StatValue>{stripeCustomersValue}</StatValue>
            <StatSubValue>Users with a Stripe ID</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Braintree customers</StatLabel>
            <StatValue>{braintreeCustomersValue}</StatValue>
            <StatSubValue>Users with a Braintree ID</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Square customers</StatLabel>
            <StatValue>{squareCustomersValue}</StatValue>
            <StatSubValue>Users with a Square ID</StatSubValue>
          </StatCard>

          <StatCard>
            <StatLabel>Authorize customers</StatLabel>
            <StatValue>{authorizeCustomersValue}</StatValue>
            <StatSubValue>Users with an Authorize ID</StatSubValue>
          </StatCard>
        </StatCardsGrid>

        <Card>
          <CardHeader>
            <CardTitle>User growth</CardTitle>
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

        {renderPanel({
          panel: newestPanel,
          setPanelState: setNewestPanel,
          filter: "newest",
          title: "Newest users",
          onToggle: toggleNewestPanel,
        })}
        {renderPanel({
          panel: bannedPanel,
          setPanelState: setBannedPanel,
          filter: "banned",
          title: "Banned users",
          onToggle: toggleBannedPanel,
        })}
        {renderPanel({
          panel: archivedPanel,
          setPanelState: setArchivedPanel,
          filter: "archived",
          title: "Archived users",
          onToggle: toggleArchivedPanel,
        })}
      </UsersOverviewGrid>
    </PageLayout>
  )
}
