import { GOOGLE_OAUTH_ENDPOINTS } from "../constants.js"

/**
 * @param {object} options
 * @param {string} options.clientId
 * @param {string} options.redirectUri
 * @param {string} options.state
 * @returns {string}
 */
export const buildGoogleAuthUrl = ({ clientId, redirectUri, state }) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  })

  return `${GOOGLE_OAUTH_ENDPOINTS.authUrl}?${params.toString()}`
}

/**
 * @param {object} options
 * @param {string} options.code
 * @param {string} options.clientId
 * @param {string} options.clientSecret
 * @param {string} options.redirectUri
 * @returns {Promise<{ accessToken: string }>}
 */
export const exchangeGoogleCode = async ({
  code,
  clientId,
  clientSecret,
  redirectUri,
}) => {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  })

  const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const data = await response.json()

  if (!response.ok || !data.access_token) {
    const message = data.error_description || data.error || "Google token error"
    throw new Error(message)
  }

  return { accessToken: data.access_token }
}

/**
 * @param {object} options
 * @param {string} options.accessToken
 * @returns {Promise<{ email: string, emailVerified: boolean, subject: string }>}
 */
export const fetchGoogleUserInfo = async ({ accessToken }) => {
  const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data = await response.json()

  if (!response.ok) {
    const message =
      data.error_description || data.error || "Failed to fetch Google profile"
    throw new Error(message)
  }

  return {
    email: data.email,
    emailVerified: data.email_verified === true,
    subject: data.sub,
  }
}
