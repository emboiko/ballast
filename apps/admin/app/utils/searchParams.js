/**
 * @typedef {import("next/navigation").ReadonlyURLSearchParams} ReadonlyURLSearchParams
 */

/**
 * @param {ReadonlyURLSearchParams | URLSearchParams | null | undefined} searchParams
 * @param {string} queryParamKey
 * @returns {string | null}
 */
export const getSearchParamCaseInsensitive = (searchParams, queryParamKey) => {
  if (!searchParams || typeof queryParamKey !== "string") {
    return null
  }

  const trimmedKey = queryParamKey.trim()
  if (!trimmedKey) {
    return null
  }

  const directValue = searchParams.get?.(trimmedKey)
  if (typeof directValue === "string") {
    return directValue
  }

  const targetKeyLower = trimmedKey.toLowerCase()
  const entries = searchParams.entries?.()
  if (entries) {
    for (const [key, value] of entries) {
      if (key.toLowerCase() === targetKeyLower) {
        return value
      }
    }
  }

  return null
}

/**
 * @param {ReadonlyURLSearchParams | URLSearchParams | null | undefined} searchParams
 * @param {string} queryParamKey
 * @returns {string | null}
 */
export const getTrimmedSearchParamCaseInsensitive = (
  searchParams,
  queryParamKey
) => {
  const rawValue = getSearchParamCaseInsensitive(searchParams, queryParamKey)
  if (typeof rawValue !== "string") {
    return null
  }

  const trimmed = rawValue.trim()
  if (trimmed.length === 0) {
    return null
  }

  return trimmed
}
