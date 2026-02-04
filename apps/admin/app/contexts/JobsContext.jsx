"use client"

import { createContext, useCallback, useContext } from "react"
import {
  fetchJobRuns as fetchJobRunsGateway,
  fetchJobRunById as fetchJobRunByIdGateway,
} from "@/gateways/jobsGateway"

const JobsContext = createContext(undefined)

export function JobsProvider({ children }) {
  const fetchJobRuns = useCallback(async ({ status, jobType, limit, offset } = {}) => {
    return fetchJobRunsGateway({ status, jobType, limit, offset })
  }, [])

  const fetchJobRunById = useCallback(async (jobRunId) => {
    return fetchJobRunByIdGateway(jobRunId)
  }, [])

  const value = {
    fetchJobRuns,
    fetchJobRunById,
  }

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>
}

export function useJobs() {
  const context = useContext(JobsContext)
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobsProvider")
  }
  return context
}
