import prisma from "../../../../../packages/shared/src/db/client.js"
import { formatSystemEventForAdmin } from "../systemEvents.js"

const buildDateFilter = ({ before, after }) => {
  const filters = []

  if (before) {
    filters.push({ createdAt: { lt: before } })
  }

  if (after) {
    filters.push({ createdAt: { gt: after } })
  }

  if (filters.length === 0) {
    return undefined
  }

  if (filters.length === 1) {
    return filters[0]
  }

  return { AND: filters }
}

/**
 * List system events for admin UI.
 * @param {object} params
 * @param {number} [params.limit=25]
 * @param {Date|null} [params.before]
 * @param {Date|null} [params.after]
 * @returns {Promise<{ events: Array<object>, total: number, hasMore: boolean }>}
 */
export const listSystemEvents = async ({
  limit = 25,
  before = null,
  after = null,
} = {}) => {
  const whereClause = buildDateFilter({ before, after })

  const [events, total] = await Promise.all([
    prisma.systemEvent.findMany({
      where: whereClause,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
    }),
    prisma.systemEvent.count({
      where: whereClause,
    }),
  ])

  return {
    events: events.map((event) => formatSystemEventForAdmin(event)),
    total,
    hasMore: events.length < total,
  }
}
