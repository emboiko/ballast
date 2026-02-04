"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import PageLayout from "@/components/ui/PageLayout"
import SectionNav from "@/components/ui/SectionNav"
import { useToast } from "@/contexts/ToastContext"
import { useJobs } from "@/contexts/JobsContext"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import {
  JobsContainer,
  JobsFiltersRow,
  JobFilterChip,
  JobFilterCount,
  JobsList,
  JobCard,
  JobHeader,
  JobHeaderDetails,
  JobTitle,
  JobSubtext,
  JobStatusBadge,
  JobMetaRow,
  JobMetaItem,
  JobDetailsGrid,
  JobDetailCard,
  JobDetailLabel,
  JobDetailValue,
  JobDetailJson,
  JobDetailSection,
  JobDetailHeading,
  JobEmptyState,
  JobButton,
} from "@/components/jobs/jobsStyles"
import { JOBS_PAGE_SIZE } from "@/constants.js"

const formatJobTypeLabel = (jobType) => {
  if (!jobType) {
    return "Job"
  }
  if (jobType === "chargeFinancingPlans") {
    return "Charge financing plans"
  }
  if (jobType === "chargeSubscriptions") {
    return "Charge subscriptions"
  }
  return jobType
}

const formatDateTime = (value) => {
  if (!value) {
    return "—"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }
  return date.toLocaleString()
}

const formatDuration = (startedAt, completedAt) => {
  if (!startedAt || !completedAt) {
    return "—"
  }
  const start = new Date(startedAt)
  const end = new Date(completedAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "—"
  }
  const durationMs = end.getTime() - start.getTime()
  if (durationMs < 0) {
    return "—"
  }
  const seconds = Math.floor(durationMs / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainderSeconds = seconds % 60
  return `${minutes}m ${remainderSeconds}s`
}

export default function JobsPage() {
  const toast = useToast()
  const { fetchJobRuns } = useJobs()
  const [status, setStatus] = useState("all")
  const [jobRuns, setJobRuns] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [statusCounts, setStatusCounts] = useState({
    all: null,
    running: null,
    completed: null,
    failed: null,
    skipped: null,
  })

  const hasMore = jobRuns.length < total

  const filterChips = useMemo(() => {
    return [
      { value: "all", label: "All" },
      { value: "running", label: "Running" },
      { value: "completed", label: "Completed" },
      { value: "failed", label: "Failed" },
      { value: "skipped", label: "Skipped" },
    ]
  }, [])

  const loadStatusCounts = useCallback(async () => {
    try {
      const [all, running, completed, failed, skipped] = await Promise.all([
        fetchJobRuns({ limit: 1, offset: 0 }),
        fetchJobRuns({ status: "running", limit: 1, offset: 0 }),
        fetchJobRuns({ status: "completed", limit: 1, offset: 0 }),
        fetchJobRuns({ status: "failed", limit: 1, offset: 0 }),
        fetchJobRuns({ status: "skipped", limit: 1, offset: 0 }),
      ])

      setStatusCounts({
        all: all.total || 0,
        running: running.total || 0,
        completed: completed.total || 0,
        failed: failed.total || 0,
        skipped: skipped.total || 0,
      })
    } catch (error) {
      toast.showErrorToast(error.message || "Failed to load job counts")
    }
  }, [fetchJobRuns, toast])

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true)
    let statusFilter = undefined
    if (status !== "all") {
      statusFilter = status
    }

    try {
      const data = await fetchJobRuns({
        status: statusFilter,
        limit: JOBS_PAGE_SIZE,
        offset: 0,
      })
      setJobRuns(data.jobRuns || [])
      setTotal(data.total || 0)
      setOffset((data.jobRuns || []).length)
    } catch (error) {
      toast.showErrorToast(error.message || "Failed to load job runs")
    } finally {
      setIsLoading(false)
    }
  }, [fetchJobRuns, status, toast])

  useEffect(() => {
    loadFirstPage()
  }, [loadFirstPage])

  useEffect(() => {
    loadStatusCounts()
  }, [loadStatusCounts])

  const loadMore = async () => {
    if (isLoadingMore) {
      return
    }
    if (!hasMore) {
      return
    }

    setIsLoadingMore(true)
    let statusFilter = undefined
    if (status !== "all") {
      statusFilter = status
    }

    try {
      const data = await fetchJobRuns({
        status: statusFilter,
        limit: JOBS_PAGE_SIZE,
        offset,
      })
      const nextRuns = data.jobRuns || []
      setJobRuns((prev) => [...prev, ...nextRuns])
      setTotal(data.total || total)
      setOffset(offset + nextRuns.length)
    } catch (error) {
      toast.showErrorToast(error.message || "Failed to load more job runs")
    } finally {
      setIsLoadingMore(false)
    }
  }

  let subtitleText = "Monitor scheduled job runs"
  if (status !== "all") {
    subtitleText = `Showing ${formatStatusLabel(status)} job runs`
  }

  let loadMoreLabel = "Load more"
  if (isLoadingMore) {
    loadMoreLabel = "Loading..."
  } else if (!hasMore) {
    loadMoreLabel = "No more"
  }

  return (
    <PageLayout>
      <JobsContainer>
        <SectionNav title="Jobs" subtitle={subtitleText} />

        <JobsFiltersRow>
          {filterChips.map((chip) => {
            const isActive = chip.value === status
            let countLabel = "(—)"
            if (
              chip.value === "running" &&
              typeof statusCounts.running === "number"
            ) {
              countLabel = `(${statusCounts.running})`
            }
            if (
              chip.value === "completed" &&
              typeof statusCounts.completed === "number"
            ) {
              countLabel = `(${statusCounts.completed})`
            }
            if (
              chip.value === "failed" &&
              typeof statusCounts.failed === "number"
            ) {
              countLabel = `(${statusCounts.failed})`
            }
            if (
              chip.value === "skipped" &&
              typeof statusCounts.skipped === "number"
            ) {
              countLabel = `(${statusCounts.skipped})`
            }
            if (chip.value === "all") {
              if (status === "all") {
                countLabel = `(${total})`
              } else if (typeof statusCounts.all === "number") {
                countLabel = `(${statusCounts.all})`
              }
            }

            return (
              <JobFilterChip
                key={chip.value}
                $isActive={isActive}
                onClick={() => {
                  setStatus(chip.value)
                  setOffset(0)
                }}
              >
                <span>{chip.label}</span>
                <JobFilterCount>{countLabel}</JobFilterCount>
              </JobFilterChip>
            )
          })}
        </JobsFiltersRow>

        <JobsList>
          {isLoading && <JobEmptyState>Loading job runs...</JobEmptyState>}

          {!isLoading && jobRuns.length === 0 && (
            <JobEmptyState>No job runs found.</JobEmptyState>
          )}

          {!isLoading &&
            jobRuns.map((jobRun) => {
              const isExpanded = expandedJobId === jobRun.id
              const statusLabel = formatStatusLabel(jobRun.status)
              const jobTypeLabel = formatJobTypeLabel(jobRun.jobType)
              const durationLabel = formatDuration(
                jobRun.startedAt,
                jobRun.completedAt
              )

              let progressText = "No progress recorded"
              if (jobRun.progress) {
                progressText = JSON.stringify(jobRun.progress, null, 2)
              }

              let summaryText = "No summary recorded"
              if (jobRun.summary) {
                summaryText = JSON.stringify(jobRun.summary, null, 2)
              }

              let errorText = null
              if (jobRun.error) {
                errorText = jobRun.error
              }

              let toggleLabel = "View details"
              if (isExpanded) {
                toggleLabel = "Hide details"
              }

              return (
                <JobCard key={jobRun.id}>
                  <JobHeader>
                    <JobHeaderDetails>
                      <JobTitle>{jobTypeLabel}</JobTitle>
                      <JobSubtext>Run ID: {jobRun.id}</JobSubtext>
                    </JobHeaderDetails>
                    <JobStatusBadge>{statusLabel}</JobStatusBadge>
                  </JobHeader>

                  <JobMetaRow>
                    <JobMetaItem>
                      Started: {formatDateTime(jobRun.startedAt)}
                    </JobMetaItem>
                    <JobMetaItem>
                      Completed: {formatDateTime(jobRun.completedAt)}
                    </JobMetaItem>
                    <JobMetaItem>Duration: {durationLabel}</JobMetaItem>
                  </JobMetaRow>

                  <JobButton
                    type="button"
                    onClick={() => {
                      setExpandedJobId((prev) => {
                        if (prev === jobRun.id) {
                          return null
                        }
                        return jobRun.id
                      })
                    }}
                  >
                    {toggleLabel}
                  </JobButton>

                  {isExpanded && (
                    <>
                      <JobDetailsGrid>
                        <JobDetailCard>
                          <JobDetailLabel>Status</JobDetailLabel>
                          <JobDetailValue>{statusLabel}</JobDetailValue>
                        </JobDetailCard>
                        <JobDetailCard>
                          <JobDetailLabel>Job type</JobDetailLabel>
                          <JobDetailValue>{jobTypeLabel}</JobDetailValue>
                        </JobDetailCard>
                        <JobDetailCard>
                          <JobDetailLabel>Started</JobDetailLabel>
                          <JobDetailValue>
                            {formatDateTime(jobRun.startedAt)}
                          </JobDetailValue>
                        </JobDetailCard>
                        <JobDetailCard>
                          <JobDetailLabel>Completed</JobDetailLabel>
                          <JobDetailValue>
                            {formatDateTime(jobRun.completedAt)}
                          </JobDetailValue>
                        </JobDetailCard>
                      </JobDetailsGrid>

                      <JobDetailSection>
                        <JobDetailHeading>Progress</JobDetailHeading>
                        <JobDetailJson>{progressText}</JobDetailJson>
                      </JobDetailSection>

                      <JobDetailSection>
                        <JobDetailHeading>Summary</JobDetailHeading>
                        <JobDetailJson>{summaryText}</JobDetailJson>
                      </JobDetailSection>

                      {errorText && (
                        <JobDetailSection>
                          <JobDetailHeading>Error</JobDetailHeading>
                          <JobDetailJson>{errorText}</JobDetailJson>
                        </JobDetailSection>
                      )}
                    </>
                  )}
                </JobCard>
              )
            })}

          {!isLoading && jobRuns.length > 0 && hasMore && (
            <JobButton
              type="button"
              disabled={!hasMore || isLoadingMore}
              onClick={loadMore}
            >
              {loadMoreLabel}
            </JobButton>
          )}
        </JobsList>
      </JobsContainer>
    </PageLayout>
  )
}
