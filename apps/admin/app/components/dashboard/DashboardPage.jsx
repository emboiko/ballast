"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import PageLayout from "@/components/ui/PageLayout"
import { PageHeader, PageTitle, PageSubtitle } from "@/components/ui/uiStyles"
import { useEvents } from "@/contexts/EventsContext"
import { useToast } from "@/contexts/ToastContext"
import { formatDate } from "@/utils/date"
import {
  DashboardGrid,
  LiveFeedCard,
  LiveFeedHeader,
  LiveFeedHeaderText,
  LiveFeedTitle,
  LiveFeedSubtitle,
  LiveFeedActions,
  LiveFeedRefreshStack,
  LiveFeedButton,
  LiveFeedRefreshMeta,
  LiveFeedList,
  LiveFeedItem,
  LiveFeedItemHeader,
  LiveFeedBadge,
  LiveFeedTimestamp,
  LiveFeedItemDescription,
  LiveFeedInlineBadges,
  LiveFeedAuthBadge,
  LiveFeedItemMeta,
  LiveFeedMetaItem,
  LiveFeedLoadMore,
  LiveFeedEmptyState,
  LiveFeedErrorText,
} from "@/components/dashboard/dashboardStyles"
import { FEED_LIMIT, REFRESH_INTERVAL_MS } from "@/constants.js"

const normalizeEventList = (events) => {
  if (!Array.isArray(events)) {
    return []
  }
  return events
}

const dedupeEventsById = (existingEvents, incomingEvents) => {
  const existingIds = new Set(existingEvents.map((event) => event.id))
  return incomingEvents.filter((event) => !existingIds.has(event.id))
}

const getEventVariant = (eventType) => {
  if (typeof eventType !== "string") {
    return "neutral"
  }
  if (eventType.startsWith("user.")) {
    return "user"
  }
  if (eventType.startsWith("order.")) {
    return "order"
  }
  if (eventType.startsWith("refund.")) {
    return "refund"
  }
  if (eventType.startsWith("email.")) {
    return "email"
  }
  return "neutral"
}

export default function DashboardPage() {
  const { fetchEvents } = useEvents()
  const { showErrorToast } = useToast()

  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [hasMore, setHasMore] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null)

  const latestEvent = useMemo(() => {
    if (events.length === 0) {
      return null
    }
    return events[0]
  }, [events])

  const oldestEvent = useMemo(() => {
    if (events.length === 0) {
      return null
    }
    return events[events.length - 1]
  }, [events])

  const loadInitialEvents = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      const data = await fetchEvents({ limit: FEED_LIMIT })
      const normalizedEvents = normalizeEventList(data.events)
      setEvents(normalizedEvents)
      setHasMore(Boolean(data.hasMore))
      setLastRefreshedAt(new Date())
    } catch (error) {
      const message = error?.message || "Failed to load events"
      setErrorMessage(message)
      showErrorToast(`Failed to load events: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [fetchEvents, showErrorToast])

  const loadNewerEvents = useCallback(async () => {
    if (!latestEvent) {
      return
    }
    if (isRefreshing) {
      return
    }
    setIsRefreshing(true)
    try {
      const data = await fetchEvents({
        limit: FEED_LIMIT,
        after: new Date(latestEvent.createdAt).toISOString(),
      })
      const incomingEvents = normalizeEventList(data.events)
      if (incomingEvents.length > 0) {
        setEvents((previousEvents) => {
          const uniqueEvents = dedupeEventsById(previousEvents, incomingEvents)
          return [...uniqueEvents, ...previousEvents]
        })
      }
      setLastRefreshedAt(new Date())
    } catch (error) {
      const message = error?.message || "Failed to refresh events"
      showErrorToast(`Failed to refresh events: ${message}`)
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchEvents, isRefreshing, latestEvent, showErrorToast])

  const loadOlderEvents = useCallback(async () => {
    if (!oldestEvent) {
      return
    }
    if (isLoadingMore) {
      return
    }
    setIsLoadingMore(true)
    try {
      const data = await fetchEvents({
        limit: FEED_LIMIT,
        before: new Date(oldestEvent.createdAt).toISOString(),
      })
      const incomingEvents = normalizeEventList(data.events)
      setEvents((previousEvents) => {
        const uniqueEvents = dedupeEventsById(previousEvents, incomingEvents)
        return [...previousEvents, ...uniqueEvents]
      })
      setHasMore(Boolean(data.hasMore))
    } catch (error) {
      const message = error?.message || "Failed to load more events"
      showErrorToast(`Failed to load more events: ${message}`)
    } finally {
      setIsLoadingMore(false)
    }
  }, [fetchEvents, isLoadingMore, oldestEvent, showErrorToast])

  useEffect(() => {
    loadInitialEvents()
  }, [loadInitialEvents])

  useEffect(() => {
    if (!latestEvent) {
      return
    }

    const intervalId = setInterval(() => {
      loadNewerEvents()
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [latestEvent, loadNewerEvents])

  let feedBody = null
  if (isLoading) {
    feedBody = <LiveFeedEmptyState>Loading live feed...</LiveFeedEmptyState>
  } else if (errorMessage) {
    feedBody = (
      <LiveFeedEmptyState>
        <LiveFeedErrorText>{errorMessage}</LiveFeedErrorText>
      </LiveFeedEmptyState>
    )
  } else if (events.length === 0) {
    feedBody = <LiveFeedEmptyState>No system events yet.</LiveFeedEmptyState>
  } else {
    feedBody = (
      <LiveFeedList>
        {events.map((event) => {
          let description = event.description
          if (!description) {
            description = "No additional details provided."
          }

          const showGoogleAuthBadge =
            event.eventType === "user.created" &&
            event.payload &&
            event.payload.authProvider === "GOOGLE"

          const metaItems = []
          if (event.entityType) {
            metaItems.push({ label: "Entity", value: event.entityType })
          }
          if (event.entityId) {
            metaItems.push({ label: "ID", value: event.entityId })
          }

          return (
            <LiveFeedItem key={event.id}>
              <LiveFeedItemHeader>
                <LiveFeedBadge $variant={getEventVariant(event.eventType)}>
                  {event.eventType}
                </LiveFeedBadge>
                <LiveFeedTimestamp>
                  {formatDate(event.createdAt)}
                </LiveFeedTimestamp>
              </LiveFeedItemHeader>
              <LiveFeedItemDescription>
                {description}
                {showGoogleAuthBadge && (
                  <LiveFeedInlineBadges>
                    <LiveFeedAuthBadge>Google auth</LiveFeedAuthBadge>
                  </LiveFeedInlineBadges>
                )}
              </LiveFeedItemDescription>
              {metaItems.length > 0 && (
                <LiveFeedItemMeta>
                  {metaItems.map((item) => {
                    return (
                      <LiveFeedMetaItem key={`${event.id}-${item.label}`}>
                        {item.label}: {item.value}
                      </LiveFeedMetaItem>
                    )
                  })}
                </LiveFeedItemMeta>
              )}
            </LiveFeedItem>
          )
        })}
      </LiveFeedList>
    )
  }

  let loadMoreRow = null
  if (hasMore || isLoadingMore) {
    let loadMoreLabel = "Load older events"
    if (isLoadingMore) {
      loadMoreLabel = "Loading..."
    }
    loadMoreRow = (
      <LiveFeedLoadMore>
        <LiveFeedButton onClick={loadOlderEvents} disabled={isLoadingMore}>
          {loadMoreLabel}
        </LiveFeedButton>
      </LiveFeedLoadMore>
    )
  }

  let refreshedLabel = "Waiting for refresh..."
  if (lastRefreshedAt) {
    refreshedLabel = `Refreshed at ${formatDate(lastRefreshedAt)}`
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageSubtitle>Monitor system activity and admin events</PageSubtitle>
      </PageHeader>

      <DashboardGrid>
        <LiveFeedCard>
          <LiveFeedHeader>
            <LiveFeedHeaderText>
              <LiveFeedTitle>Live system feed</LiveFeedTitle>
              <LiveFeedSubtitle>
                Append-only stream of API activity and operational signals.
              </LiveFeedSubtitle>
            </LiveFeedHeaderText>
            <LiveFeedActions>
              <LiveFeedRefreshStack>
                <LiveFeedButton
                  onClick={loadNewerEvents}
                  disabled={isRefreshing}
                >
                  Refresh
                </LiveFeedButton>
                <LiveFeedRefreshMeta>{refreshedLabel}</LiveFeedRefreshMeta>
              </LiveFeedRefreshStack>
            </LiveFeedActions>
          </LiveFeedHeader>

          {feedBody}
          {loadMoreRow}
        </LiveFeedCard>
      </DashboardGrid>
    </PageLayout>
  )
}
