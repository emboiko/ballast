import {
  ADMIN_GOOGLE_OAUTH_STATE_COOKIE_NAME,
  ADMIN_GOOGLE_OAUTH_STATE_COOKIE_OPTIONS,
  ADMIN_URL,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GOOGLE_OAUTH_STATE_COOKIE_OPTIONS,
  WEBAPP_URL,
} from "../../constants.js"

/**
 * @param {Record<string, string>} [params]
 * @returns {string}
 */
export const buildWebappRedirect = (params) => {
  if (!WEBAPP_URL) {
    return "/"
  }

  const url = new URL(WEBAPP_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return url.toString()
}

/**
 * @param {Record<string, string>} [params]
 * @returns {string}
 */
export const buildAdminRedirect = (params) => {
  if (!ADMIN_URL) {
    return "/admin"
  }

  const url = new URL(ADMIN_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return url.toString()
}

/**
 * @param {import("express").Response} res
 * @param {"webapp" | "admin"} scope
 */
export const clearGoogleOAuthStateCookie = (res, scope) => {
  if (scope === "admin") {
    res.clearCookie(ADMIN_GOOGLE_OAUTH_STATE_COOKIE_NAME, {
      path: ADMIN_GOOGLE_OAUTH_STATE_COOKIE_OPTIONS.path,
    })
    return
  }

  res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, {
    path: GOOGLE_OAUTH_STATE_COOKIE_OPTIONS.path,
  })
}
