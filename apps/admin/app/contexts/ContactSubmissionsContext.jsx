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
import { COMMUNICATIONS_PAGE_SIZE } from "@/constants"
import {
  deleteContactSubmissionById as deleteContactSubmissionByIdGateway,
  getContactSubmissionById as getContactSubmissionByIdGateway,
  listContactSubmissions as listContactSubmissionsGateway,
  setContactSubmissionReadStatus as setContactSubmissionReadStatusGateway,
} from "@/gateways/contactSubmissionsGateway"

const ContactSubmissionsContext = createContext(undefined)

export function ContactSubmissionsProvider({ children }) {
  const [submissions, setSubmissions] = useState([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("UNREAD")
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const manualUnreadSubmissionIdsRef = useRef(new Set())

  const refreshSubmissions = useCallback(async () => {
    try {
      if (!hasLoadedOnce) {
        setIsLoadingList(true)
      }

      setError(null)

      let unreadOnly = false
      if (filter === "UNREAD") {
        unreadOnly = true
      }

      const data = await listContactSubmissionsGateway({
        limit: COMMUNICATIONS_PAGE_SIZE,
        offset: 0,
        unreadOnly,
      })

      let nextSubmissions = []
      if (Array.isArray(data.submissions)) {
        nextSubmissions = data.submissions
      }

      let nextTotal = 0
      if (typeof data.total === "number") {
        nextTotal = data.total
      }
      setTotal(nextTotal)

      setSubmissions((currentSubmissions) => {
        if (!hasLoadedOnce) {
          const nextHasMore = nextTotal > nextSubmissions.length
          setHasMore(nextHasMore)
          return nextSubmissions
        }

        const firstPageIds = new Set(
          nextSubmissions.map((submission) => submission.id)
        )
        const remainingSubmissions = currentSubmissions.filter((submission) => {
          return !firstPageIds.has(submission.id)
        })

        const mergedSubmissions = [...nextSubmissions, ...remainingSubmissions]
        const nextHasMore = nextTotal > mergedSubmissions.length
        setHasMore(nextHasMore)
        return mergedSubmissions
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
  }, [filter, hasLoadedOnce])

  const loadMoreSubmissions = useCallback(async () => {
    if (isLoadingMore) {
      return
    }

    if (!hasMore) {
      return
    }

    try {
      setIsLoadingMore(true)
      setError(null)

      let unreadOnly = false
      if (filter === "UNREAD") {
        unreadOnly = true
      }

      const offset = submissions.length
      const data = await listContactSubmissionsGateway({
        limit: COMMUNICATIONS_PAGE_SIZE,
        offset,
        unreadOnly,
      })

      let newSubmissions = []
      if (Array.isArray(data.submissions)) {
        newSubmissions = data.submissions
      }

      let nextTotal = 0
      if (typeof data.total === "number") {
        nextTotal = data.total
      }
      setTotal(nextTotal)

      setSubmissions((currentSubmissions) => {
        const existingIds = new Set(
          currentSubmissions.map((submission) => submission.id)
        )
        const uniqueNew = newSubmissions.filter((submission) => {
          return !existingIds.has(submission.id)
        })
        const mergedSubmissions = [...currentSubmissions, ...uniqueNew]
        const nextHasMore = nextTotal > mergedSubmissions.length
        setHasMore(nextHasMore)
        return mergedSubmissions
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingMore(false)
    }
  }, [filter, hasMore, isLoadingMore, submissions.length])

  const loadSubmissionById = useCallback(async (submissionId) => {
    try {
      setIsLoadingSubmission(true)
      setError(null)
      const data = await getContactSubmissionByIdGateway(submissionId)
      setSelectedSubmission(data.submission)
    } catch (err) {
      setError(err.message)
      setSelectedSubmission(null)
    } finally {
      setIsLoadingSubmission(false)
    }
  }, [])

  useEffect(() => {
    refreshSubmissions()
  }, [refreshSubmissions])

  useEffect(() => {
    if (!selectedSubmissionId) {
      setSelectedSubmission(null)
      return
    }

    loadSubmissionById(selectedSubmissionId)
  }, [loadSubmissionById, selectedSubmissionId])

  const setSubmissionReadStatus = useCallback(
    async (submissionId, isRead) => {
      await setContactSubmissionReadStatusGateway(submissionId, isRead)

      let readAtValue = null
      if (isRead) {
        readAtValue = new Date().toISOString()
      }

      if (isRead) {
        manualUnreadSubmissionIdsRef.current.delete(submissionId)
      } else {
        manualUnreadSubmissionIdsRef.current.add(submissionId)
      }

      setSubmissions((currentSubmissions) => {
        if (filter === "UNREAD" && isRead) {
          return currentSubmissions.filter(
            (submission) => submission.id !== submissionId
          )
        }

        return currentSubmissions.map((submission) => {
          if (submission.id !== submissionId) {
            return submission
          }
          return { ...submission, readAt: readAtValue }
        })
      })

      setSelectedSubmission((currentSelectedSubmission) => {
        if (!currentSelectedSubmission) {
          return currentSelectedSubmission
        }
        if (currentSelectedSubmission.id !== submissionId) {
          return currentSelectedSubmission
        }
        return { ...currentSelectedSubmission, readAt: readAtValue }
      })
    },
    [filter]
  )

  const markSelectedSubmissionAsReadIfNeeded = useCallback(async () => {
    if (!selectedSubmission) {
      return
    }

    if (manualUnreadSubmissionIdsRef.current.has(selectedSubmission.id)) {
      return
    }

    if (selectedSubmission.readAt) {
      return
    }

    try {
      await setSubmissionReadStatus(selectedSubmission.id, true)
    } catch {
      // Ignore: read marking failure should not block viewing
    }
  }, [selectedSubmission, setSubmissionReadStatus])

  useEffect(() => {
    markSelectedSubmissionAsReadIfNeeded()
  }, [markSelectedSubmissionAsReadIfNeeded])

  const selectSubmission = useCallback((submissionId) => {
    manualUnreadSubmissionIdsRef.current.delete(submissionId)
    setSelectedSubmissionId(submissionId)
  }, [])

  const setFilterValue = useCallback((nextFilter) => {
    setFilter(nextFilter)
    setSelectedSubmissionId(null)
    setSelectedSubmission(null)
    setSubmissions([])
    setTotal(0)
    setHasMore(false)
    setHasLoadedOnce(false)
    setLastRefreshedAt(null)
  }, [])

  const deleteSubmissionById = useCallback(
    async (submissionId) => {
      await deleteContactSubmissionByIdGateway(submissionId)

      setSubmissions((currentSubmissions) => {
        return currentSubmissions.filter(
          (submission) => submission.id !== submissionId
        )
      })

      setSelectedSubmission((currentSelectedSubmission) => {
        if (!currentSelectedSubmission) {
          return currentSelectedSubmission
        }
        if (currentSelectedSubmission.id !== submissionId) {
          return currentSelectedSubmission
        }
        return null
      })

      setSelectedSubmissionId((currentSelectedSubmissionId) => {
        if (currentSelectedSubmissionId !== submissionId) {
          return currentSelectedSubmissionId
        }
        return null
      })

      await refreshSubmissions()
    },
    [refreshSubmissions]
  )

  const value = useMemo(() => {
    return {
      submissions,
      total,
      hasMore,
      hasLoadedOnce,
      selectedSubmissionId,
      selectedSubmission,
      isLoadingList,
      isLoadingMore,
      isLoadingSubmission,
      error,
      filter,
      lastRefreshedAt,
      refreshSubmissions,
      loadMoreSubmissions,
      selectSubmission,
      setFilterValue,
      setSubmissionReadStatus,
      deleteSubmissionById,
    }
  }, [
    deleteSubmissionById,
    error,
    filter,
    hasLoadedOnce,
    hasMore,
    isLoadingList,
    isLoadingMore,
    isLoadingSubmission,
    lastRefreshedAt,
    loadMoreSubmissions,
    refreshSubmissions,
    selectSubmission,
    selectedSubmission,
    selectedSubmissionId,
    setFilterValue,
    setSubmissionReadStatus,
    submissions,
    total,
  ])

  return (
    <ContactSubmissionsContext.Provider value={value}>
      {children}
    </ContactSubmissionsContext.Provider>
  )
}

export function useContactSubmissions() {
  const context = useContext(ContactSubmissionsContext)
  if (context === undefined) {
    throw new Error(
      "useContactSubmissions must be used within a ContactSubmissionsProvider"
    )
  }
  return context
}
