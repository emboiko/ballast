import prisma from "@ballast/shared/src/db/client.js"

/**
 * List contact submissions for admin UI.
 * @param {object} params
 * @param {number} [params.limit=25]
 * @param {number} [params.offset=0]
 * @param {boolean} [params.unreadOnly=false]
 * @returns {Promise<{ submissions: Array<object>, total: number, hasMore: boolean }>}
 */
export const listContactSubmissions = async ({
  limit = 25,
  offset = 0,
  unreadOnly = false,
} = {}) => {
  const whereClause = {}

  if (unreadOnly) {
    whereClause.readAt = null
  }

  const [submissions, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
        readAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.contactSubmission.count({
      where: whereClause,
    }),
  ])

  return {
    submissions,
    total,
    hasMore: offset + submissions.length < total,
  }
}

/**
 * Get a single contact submission by ID.
 * @param {string} submissionId
 * @returns {Promise<{ success: boolean, submission?: object, error?: string }>}
 */
export const getContactSubmissionById = async (submissionId) => {
  if (!submissionId) {
    return { success: false, error: "Submission ID is required" }
  }

  const submission = await prisma.contactSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  })

  if (!submission) {
    return { success: false, error: "Submission not found" }
  }

  return { success: true, submission }
}

/**
 * Mark a contact submission as read/unread.
 * @param {string} submissionId
 * @param {boolean} isRead
 * @returns {Promise<{ success: boolean, submission?: object, error?: string }>}
 */
export const setContactSubmissionReadStatus = async (submissionId, isRead) => {
  if (!submissionId) {
    return { success: false, error: "Submission ID is required" }
  }

  const submission = await prisma.contactSubmission.findUnique({
    where: { id: submissionId },
    select: { id: true },
  })

  if (!submission) {
    return { success: false, error: "Submission not found" }
  }

  let readAt = null
  if (isRead) {
    readAt = new Date()
  }

  const updatedSubmission = await prisma.contactSubmission.update({
    where: { id: submissionId },
    data: { readAt },
  })

  return { success: true, submission: updatedSubmission }
}

/**
 * Permanently delete a contact submission.
 * @param {string} submissionId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const deleteContactSubmission = async (submissionId) => {
  if (!submissionId) {
    return { success: false, error: "Submission ID is required" }
  }

  const submission = await prisma.contactSubmission.findUnique({
    where: { id: submissionId },
    select: { id: true },
  })

  if (!submission) {
    return { success: false, error: "Submission not found" }
  }

  await prisma.contactSubmission.delete({
    where: { id: submissionId },
  })

  return { success: true }
}
