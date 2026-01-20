import { API_URL } from "@/constants.js"

/**
 * Search users and orders
 * @param {string} query - Search query
 * @param {object} options
 * @param {string} [options.type='all'] - Type of search: 'all', 'users', 'orders', 'refunds'
 * @param {number} [options.limit=5] - Number of results per type
 * @param {number} [options.offset=0] - Offset for pagination
 * @returns {Promise<{ users?: { users: Array, total: number, hasMore: boolean }, orders?: { orders: Array, total: number, hasMore: boolean }, refunds?: { refunds: Array, total: number, hasMore: boolean } }>}
 */
export const search = async (
  query,
  { type = "all", limit = 5, offset = 0 } = {}
) => {
  const params = new URLSearchParams({
    q: query,
    type,
    limit: String(limit),
    offset: String(offset),
  })

  const response = await fetch(`${API_URL}/admin/search?${params}`, {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Search failed")
  }

  return response.json()
}
