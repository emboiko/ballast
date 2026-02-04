import prisma from "../../../../../packages/shared/src/db/client.js"

const normalizeJobStatus = (value) => {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim().toUpperCase()
  if (!normalized) {
    return null
  }

  const allowed = new Set(["RUNNING", "COMPLETED", "FAILED", "SKIPPED"])
  if (!allowed.has(normalized)) {
    return null
  }

  return normalized
}

const normalizeJobType = (value) => {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  return trimmed
}

export const listJobRuns = async ({
  status,
  jobType,
  limit = 25,
  offset = 0,
} = {}) => {
  const whereClause = {}

  const normalizedStatus = normalizeJobStatus(status)
  if (normalizedStatus) {
    whereClause.status = normalizedStatus
  }

  const normalizedJobType = normalizeJobType(jobType)
  if (normalizedJobType) {
    whereClause.jobType = normalizedJobType
  }

  const [jobRuns, total] = await Promise.all([
    prisma.jobRun.findMany({
      where: whereClause,
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        jobType: true,
        status: true,
        startedAt: true,
        completedAt: true,
        progress: true,
        summary: true,
        error: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.jobRun.count({ where: whereClause }),
  ])

  return {
    jobRuns,
    total,
    hasMore: offset + jobRuns.length < total,
  }
}

export const getJobRunById = async (jobRunId) => {
  if (!jobRunId) {
    return { success: false, error: "Job run ID is required" }
  }

  const jobRun = await prisma.jobRun.findUnique({
    where: { id: jobRunId },
    select: {
      id: true,
      jobType: true,
      status: true,
      startedAt: true,
      completedAt: true,
      progress: true,
      summary: true,
      error: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!jobRun) {
    return { success: false, error: "Job run not found" }
  }

  return { success: true, jobRun }
}
