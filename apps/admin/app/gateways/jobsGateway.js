import { API_URL } from "@/constants.js"

export const fetchJobRuns = async ({ status, jobType, limit, offset } = {}) => {
  const params = new URLSearchParams()

  if (typeof status === "string" && status.trim()) {
    params.append("status", status.trim())
  }
  if (typeof jobType === "string" && jobType.trim()) {
    params.append("jobType", jobType.trim())
  }
  if (typeof limit === "number") {
    params.append("limit", String(limit))
  }
  if (typeof offset === "number") {
    params.append("offset", String(offset))
  }

  const queryString = params.toString()
  let url = `${API_URL}/admin/jobs`
  if (queryString) {
    url = `${url}?${queryString}`
  }

  const response = await fetch(url, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch job runs")
  }

  return data
}

export const fetchJobRunById = async (jobRunId) => {
  const response = await fetch(`${API_URL}/admin/jobs/${jobRunId}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch job run")
  }

  return data
}
