"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  COMMUNICATIONS_POLLING_STATE_KEY,
  COMMUNICATIONS_POLL_INTERVAL_MS,
  COMMUNICATIONS_PAGE_SIZE,
} from "@/constants"
import {
  listEmails as listEmailsGateway,
  getEmailById as getEmailByIdGateway,
  replyToEmail as replyToEmailGateway,
  setEmailReadStatus as setEmailReadStatusGateway,
  deleteEmailById as deleteEmailByIdGateway,
} from "@/gateways/communicationsGateway"

const CommunicationsContext = createContext(undefined)

export function CommunicationsProvider({ children }) {
  const [emails, setEmails] = useState([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedEmailId, setSelectedEmailId] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [error, setError] = useState(null)
  const [isPollingEnabled, setIsPollingEnabled] = useState(true)
  const [directionFilter, setDirectionFilter] = useState("UNREAD")
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const pollIntervalRef = useRef(null)
  const manualUnreadEmailIdsRef = useRef(new Set())

  useEffect(() => {
    const storedValue = localStorage.getItem(COMMUNICATIONS_POLLING_STATE_KEY)
    if (storedValue !== null) {
      setIsPollingEnabled(storedValue === "true")
    }
  }, [])

  const refreshEmails = useCallback(async () => {
    try {
      if (!hasLoadedOnce) {
        setIsLoadingList(true)
      }

      setError(null)

      let directionParam = undefined
      let unreadOnly = false

      if (directionFilter === "INBOUND") {
        directionParam = "INBOUND"
      }
      if (directionFilter === "OUTBOUND") {
        directionParam = "OUTBOUND"
      }
      if (directionFilter === "UNREAD") {
        unreadOnly = true
      }

      const data = await listEmailsGateway({
        limit: COMMUNICATIONS_PAGE_SIZE,
        offset: 0,
        direction: directionParam,
        unreadOnly,
      })

      let nextEmails = []
      if (Array.isArray(data.emails)) {
        nextEmails = data.emails
      }

      let nextTotal = 0
      if (typeof data.total === "number") {
        nextTotal = data.total
      }
      setTotal(nextTotal)

      setEmails((currentEmails) => {
        if (!hasLoadedOnce) {
          const nextHasMore = nextTotal > nextEmails.length
          setHasMore(nextHasMore)
          return nextEmails
        }

        const firstPageIds = new Set(nextEmails.map((email) => email.id))
        const remainingEmails = currentEmails.filter((email) => {
          return !firstPageIds.has(email.id)
        })

        const mergedEmails = [...nextEmails, ...remainingEmails]
        const nextHasMore = nextTotal > mergedEmails.length
        setHasMore(nextHasMore)
        return mergedEmails
      })

      setLastRefreshedAt(new Date())
      if (!hasLoadedOnce) {
        setHasLoadedOnce(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingList(false)
    }
  }, [directionFilter, hasLoadedOnce])

  const loadMoreEmails = useCallback(async () => {
    if (isLoadingMore) {
      return
    }

    if (!hasMore) {
      return
    }

    try {
      setIsLoadingMore(true)
      setError(null)
      let directionParam = undefined
      let unreadOnly = false

      if (directionFilter === "INBOUND") {
        directionParam = "INBOUND"
      }
      if (directionFilter === "OUTBOUND") {
        directionParam = "OUTBOUND"
      }
      if (directionFilter === "UNREAD") {
        unreadOnly = true
      }
      const offset = emails.length
      const data = await listEmailsGateway({
        limit: COMMUNICATIONS_PAGE_SIZE,
        offset,
        direction: directionParam,
        unreadOnly,
      })

      let newEmails = []
      if (Array.isArray(data.emails)) {
        newEmails = data.emails
      }

      let nextTotal = 0
      if (typeof data.total === "number") {
        nextTotal = data.total
      }
      setTotal(nextTotal)

      setEmails((currentEmails) => {
        const existingIds = new Set(currentEmails.map((email) => email.id))
        const uniqueNew = newEmails.filter((email) => {
          return !existingIds.has(email.id)
        })
        const mergedEmails = [...currentEmails, ...uniqueNew]
        const nextHasMore = nextTotal > mergedEmails.length
        setHasMore(nextHasMore)
        return mergedEmails
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingMore(false)
    }
  }, [directionFilter, emails.length, hasMore, isLoadingMore])

  const loadEmailById = useCallback(async (emailId) => {
    try {
      setIsLoadingEmail(true)
      setError(null)
      const data = await getEmailByIdGateway(emailId)
      setSelectedEmail(data.email)
    } catch (err) {
      setError(err.message)
      setSelectedEmail(null)
    } finally {
      setIsLoadingEmail(false)
    }
  }, [])

  useEffect(() => {
    refreshEmails()
  }, [refreshEmails])

  useEffect(() => {
    if (!isPollingEnabled) {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      return
    }

    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    pollIntervalRef.current = window.setInterval(() => {
      refreshEmails()
    }, COMMUNICATIONS_POLL_INTERVAL_MS)

    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [isPollingEnabled, refreshEmails])

  useEffect(() => {
    if (!selectedEmailId) {
      setSelectedEmail(null)
      return
    }

    loadEmailById(selectedEmailId)
  }, [loadEmailById, selectedEmailId])

  const setEmailReadStatus = useCallback(
    async (emailId, isRead) => {
      await setEmailReadStatusGateway(emailId, isRead)

      let readAtValue = null
      if (isRead) {
        readAtValue = new Date().toISOString()
      }

      if (isRead) {
        manualUnreadEmailIdsRef.current.delete(emailId)
      } else {
        manualUnreadEmailIdsRef.current.add(emailId)
      }

      setEmails((currentEmails) => {
        if (directionFilter === "UNREAD" && isRead) {
          return currentEmails.filter((email) => email.id !== emailId)
        }

        return currentEmails.map((email) => {
          if (email.id !== emailId) {
            return email
          }
          return { ...email, readAt: readAtValue }
        })
      })

      setSelectedEmail((currentSelectedEmail) => {
        if (!currentSelectedEmail) {
          return currentSelectedEmail
        }
        if (currentSelectedEmail.id !== emailId) {
          return currentSelectedEmail
        }
        return { ...currentSelectedEmail, readAt: readAtValue }
      })
    },
    [directionFilter]
  )

  const markSelectedEmailAsReadIfNeeded = useCallback(async () => {
    if (!selectedEmail) {
      return
    }

    if (selectedEmail.direction !== "INBOUND") {
      return
    }

    if (manualUnreadEmailIdsRef.current.has(selectedEmail.id)) {
      return
    }

    if (selectedEmail.readAt) {
      return
    }

    try {
      await setEmailReadStatus(selectedEmail.id, true)
    } catch {
      // Ignore: read marking failure should not block viewing
    }
  }, [selectedEmail, setEmailReadStatus])

  useEffect(() => {
    markSelectedEmailAsReadIfNeeded()
  }, [markSelectedEmailAsReadIfNeeded])

  const setPollingEnabled = useCallback((nextValue) => {
    setIsPollingEnabled(nextValue)
    localStorage.setItem(COMMUNICATIONS_POLLING_STATE_KEY, String(nextValue))
  }, [])

  const selectEmail = useCallback((emailId) => {
    manualUnreadEmailIdsRef.current.delete(emailId)
    setSelectedEmailId(emailId)
  }, [])

  const setDirectionFilterValue = useCallback((nextDirectionFilter) => {
    setDirectionFilter(nextDirectionFilter)
    setSelectedEmailId(null)
    setSelectedEmail(null)
    setEmails([])
    setTotal(0)
    setHasMore(false)
    setHasLoadedOnce(false)
    setLastRefreshedAt(null)
  }, [])

  const replyToSelectedEmail = useCallback(
    async (replyText) => {
      if (!selectedEmailId) {
        throw new Error("No email selected")
      }

      if (!replyText || !replyText.trim()) {
        throw new Error("Reply text is required")
      }

      try {
        setIsSendingReply(true)
        setError(null)
        await replyToEmailGateway(selectedEmailId, replyText)
        await refreshEmails()
        await loadEmailById(selectedEmailId)
      } finally {
        setIsSendingReply(false)
      }
    },
    [loadEmailById, refreshEmails, selectedEmailId]
  )

  const deleteEmailById = useCallback(
    async (emailId) => {
      await deleteEmailByIdGateway(emailId)

      setEmails((currentEmails) => {
        return currentEmails.filter((email) => email.id !== emailId)
      })

      setSelectedEmail((currentSelectedEmail) => {
        if (!currentSelectedEmail) {
          return currentSelectedEmail
        }
        if (currentSelectedEmail.id !== emailId) {
          return currentSelectedEmail
        }
        return null
      })

      setSelectedEmailId((currentSelectedEmailId) => {
        if (currentSelectedEmailId !== emailId) {
          return currentSelectedEmailId
        }
        return null
      })

      await refreshEmails()
    },
    [refreshEmails]
  )

  const value = useMemo(() => {
    return {
      emails,
      total,
      hasLoadedOnce,
      selectedEmailId,
      selectedEmail,
      isLoadingList,
      isLoadingMore,
      isLoadingEmail,
      isSendingReply,
      error,
      isPollingEnabled,
      directionFilter,
      lastRefreshedAt,
      hasMore,
      setPollingEnabled,
      refreshEmails,
      loadMoreEmails,
      selectEmail,
      replyToSelectedEmail,
      setDirectionFilterValue,
      setEmailReadStatus,
      deleteEmailById,
    }
  }, [
    emails,
    error,
    hasLoadedOnce,
    isLoadingEmail,
    isLoadingList,
    isLoadingMore,
    isPollingEnabled,
    isSendingReply,
    selectedEmail,
    selectedEmailId,
    directionFilter,
    lastRefreshedAt,
    hasMore,
    setPollingEnabled,
    refreshEmails,
    loadMoreEmails,
    selectEmail,
    replyToSelectedEmail,
    setDirectionFilterValue,
    setEmailReadStatus,
    deleteEmailById,
    total,
  ])

  return (
    <CommunicationsContext.Provider value={value}>
      {children}
    </CommunicationsContext.Provider>
  )
}

export function useCommunications() {
  const context = useContext(CommunicationsContext)
  if (context === undefined) {
    throw new Error(
      "useCommunications must be used within a CommunicationsProvider"
    )
  }
  return context
}
