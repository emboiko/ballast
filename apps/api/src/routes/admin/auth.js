import { Router } from "express"
import crypto from "crypto"
import {
  API_URL,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  ADMIN_GOOGLE_OAUTH_STATE_COOKIE_NAME,
  ADMIN_GOOGLE_OAUTH_STATE_COOKIE_OPTIONS,
} from "../../constants.js"
import {
  signToken,
  setAdminAuthCookie,
  clearAdminAuthCookie,
} from "../../lib/jwt.js"
import { adminLogin } from "../../lib/admin/index.js"
import { requireAdmin } from "../../middleware/admin.js"
import { loginWithGoogle } from "../../lib/auth.js"
import {
  buildAdminRedirect,
  clearGoogleOAuthStateCookie,
} from "../../lib/utils/google.js"
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
} from "../../gateways/googleGateway.js"

const router = Router()

// POST /admin/auth/login
router.post("/login", async (req, res) => {
  try {
    const result = await adminLogin(req.body.email, req.body.password)

    if (!result.success) {
      if (result.banned === true) {
        clearAdminAuthCookie(res)
        return res.status(403).json({ error: result.error })
      }
      return res.status(401).json({ error: result.error })
    }

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
    })
    setAdminAuthCookie(res, token)

    res.json({ user: result.user })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ error: "Failed to log in" })
  }
})

// GET /admin/auth/google/start
router.get("/google/start", (req, res) => {
  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !API_URL) {
    return res.redirect(
      buildAdminRedirect({ auth_error: "google_unavailable" })
    )
  }

  const state = crypto.randomBytes(32).toString("hex")
  res.cookie(
    ADMIN_GOOGLE_OAUTH_STATE_COOKIE_NAME,
    state,
    ADMIN_GOOGLE_OAUTH_STATE_COOKIE_OPTIONS
  )

  const redirectUri = `${API_URL}/admin/auth/google/callback`
  const googleUrl = buildGoogleAuthUrl({
    clientId: GOOGLE_OAUTH_CLIENT_ID,
    redirectUri,
    state,
  })

  res.redirect(googleUrl)
})

// GET /admin/auth/google/callback
router.get("/google/callback", async (req, res) => {
  try {
    if (req.query.error) {
      clearGoogleOAuthStateCookie(res, "admin")
      return res.redirect(
        buildAdminRedirect({ auth_error: "google_access_denied" })
      )
    }

    const code = typeof req.query.code === "string" ? req.query.code : undefined
    const state =
      typeof req.query.state === "string" ? req.query.state : undefined
    const storedState = req.cookies?.[ADMIN_GOOGLE_OAUTH_STATE_COOKIE_NAME]

    if (!code || !state || !storedState || storedState !== state) {
      clearGoogleOAuthStateCookie(res, "admin")
      return res.redirect(
        buildAdminRedirect({ auth_error: "google_state_mismatch" })
      )
    }

    clearGoogleOAuthStateCookie(res, "admin")

    const redirectUri = `${API_URL}/admin/auth/google/callback`
    const { accessToken } = await exchangeGoogleCode({
      code,
      clientId: GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri,
    })

    const { email, emailVerified, subject } = await fetchGoogleUserInfo({
      accessToken,
    })

    if (!email || !subject) {
      return res.redirect(
        buildAdminRedirect({ auth_error: "google_profile_incomplete" })
      )
    }

    if (!emailVerified) {
      return res.redirect(
        buildAdminRedirect({ auth_error: "google_unverified_email" })
      )
    }

    const result = await loginWithGoogle(email, subject)
    if (!result.success) {
      return res.redirect(
        buildAdminRedirect({
          auth_error: result.errorCode || "google_login_failed",
        })
      )
    }

    if (!result.user.isAdmin) {
      return res.redirect(
        buildAdminRedirect({ auth_error: "admin_access_required" })
      )
    }

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
    })
    setAdminAuthCookie(res, token)

    res.redirect(buildAdminRedirect())
  } catch (error) {
    console.error("Admin Google auth error:", error)
    clearGoogleOAuthStateCookie(res, "admin")
    res.redirect(buildAdminRedirect({ auth_error: "google_login_failed" }))
  }
})

// POST /admin/auth/logout
router.post("/logout", requireAdmin, (req, res) => {
  clearAdminAuthCookie(res)
  res.json({ message: "Logged out successfully" })
})

// GET /admin/auth/me
router.get("/me", requireAdmin, (req, res) => {
  res.json({ user: req.user })
})

export default router
