import { Router } from "express"
import crypto from "crypto"
import {
  API_URL,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GOOGLE_OAUTH_STATE_COOKIE_OPTIONS,
} from "../constants.js"
import { signToken, setWebAuthCookie, clearWebAuthCookie } from "../lib/jwt.js"
import {
  signup,
  login,
  verifyEmail,
  verifyEmailChange,
  resendVerification,
  requestEmailChange,
  updatePassword,
  forgotPassword,
  resetPassword,
  archiveAccount,
  verifyAccountReactivation,
  loginWithGoogle,
} from "../lib/auth.js"
import { requireAuth } from "../middleware/auth.js"
import {
  buildWebappRedirect,
  clearGoogleOAuthStateCookie,
} from "../lib/utils/google.js"
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
} from "../gateways/googleGateway.js"

const router = Router()

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const result = await signup(
      req.body.email,
      req.body.password,
      req.body.turnstileToken,
      req.ip
    )

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json({
      message:
        "Account created. Please check your email to verify your account.",
      user: result.user,
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Failed to create account" })
  }
})

// GET /auth/google/start
router.get("/google/start", (req, res) => {
  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !API_URL) {
    const redirectUrl = buildWebappRedirect({
      auth_error: "google_unavailable",
    })
    return res.redirect(redirectUrl)
  }

  const state = crypto.randomBytes(32).toString("hex")
  res.cookie(
    GOOGLE_OAUTH_STATE_COOKIE_NAME,
    state,
    GOOGLE_OAUTH_STATE_COOKIE_OPTIONS
  )

  const redirectUri = `${API_URL}/auth/google/callback`
  const googleUrl = buildGoogleAuthUrl({
    clientId: GOOGLE_OAUTH_CLIENT_ID,
    redirectUri,
    state,
  })

  res.redirect(googleUrl)
})

// GET /auth/google/callback
router.get("/google/callback", async (req, res) => {
  try {
    if (req.query.error) {
      clearGoogleOAuthStateCookie(res, "webapp")
      return res.redirect(
        buildWebappRedirect({ auth_error: "google_access_denied" })
      )
    }

    const code = typeof req.query.code === "string" ? req.query.code : undefined
    const state =
      typeof req.query.state === "string" ? req.query.state : undefined
    const storedState = req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE_NAME]

    if (!code || !state || !storedState || storedState !== state) {
      clearGoogleOAuthStateCookie(res, "webapp")
      return res.redirect(
        buildWebappRedirect({ auth_error: "google_state_mismatch" })
      )
    }

    clearGoogleOAuthStateCookie(res, "webapp")

    const redirectUri = `${API_URL}/auth/google/callback`
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
        buildWebappRedirect({ auth_error: "google_profile_incomplete" })
      )
    }

    if (!emailVerified) {
      return res.redirect(
        buildWebappRedirect({ auth_error: "google_unverified_email" })
      )
    }

    const result = await loginWithGoogle(email, subject)
    if (!result.success) {
      return res.redirect(
        buildWebappRedirect({
          auth_error: result.errorCode || "google_login_failed",
        })
      )
    }

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
    })
    setWebAuthCookie(res, token)

    res.redirect(buildWebappRedirect())
  } catch (error) {
    console.error("Google auth error:", error)
    clearGoogleOAuthStateCookie(res, "webapp")
    res.redirect(buildWebappRedirect({ auth_error: "google_login_failed" }))
  }
})

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const result = await login(req.body.email, req.body.password)

    if (!result.success) {
      if (result.banned === true) {
        clearWebAuthCookie(res)
        return res.status(403).json({
          error: result.error,
          banned: true,
        })
      }
      if (result.emailVerified === false) {
        return res.status(403).json({
          error: result.error,
          emailVerified: false,
        })
      }
      return res.status(401).json({ error: result.error })
    }

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
    })
    setWebAuthCookie(res, token)

    res.json({ user: result.user })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Failed to log in" })
  }
})

// POST /auth/logout
router.post("/logout", (req, res) => {
  clearWebAuthCookie(res)
  res.json({ message: "Logged out successfully" })
})

// GET /auth/verify?token=xxx - Initial email verification for new accounts
router.get("/verify", async (req, res) => {
  try {
    const result = await verifyEmail(req.query.token)

    if (!result.success) {
      return res.redirect(`${WEBAPP_URL}?error=${result.error}`)
    }

    const authToken = signToken({
      userId: result.user.id,
      email: result.user.email,
    })
    setWebAuthCookie(res, authToken)

    res.redirect(`${WEBAPP_URL}?verified=true`)
  } catch (error) {
    console.error("Verification error:", error)
    res.redirect(`${WEBAPP_URL}?error=verification_failed`)
  }
})

// GET /auth/verify-email-change?token=xxx - Verify new email address
router.get("/verify-email-change", async (req, res) => {
  try {
    const result = await verifyEmailChange(req.query.token)

    if (!result.success) {
      return res.redirect(
        `${WEBAPP_URL}/account/settings?error=${result.error}`
      )
    }

    const authToken = signToken({
      userId: result.user.id,
      email: result.user.email,
    })
    setWebAuthCookie(res, authToken)

    res.redirect(`${WEBAPP_URL}/account/settings?email_updated=true`)
  } catch (error) {
    console.error("Email change verification error:", error)
    res.redirect(`${WEBAPP_URL}/account/settings?error=verification_failed`)
  }
})

// GET /auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// POST /auth/resend-verification
router.post("/resend-verification", async (req, res) => {
  try {
    const result = await resendVerification(req.body.email)
    res.json({ message: result.message })
  } catch (error) {
    console.error("Resend verification error:", error)
    res.status(500).json({ error: "Failed to resend verification email" })
  }
})

// POST /auth/update-email - Request email change (requires auth)
router.post("/update-email", requireAuth, async (req, res) => {
  try {
    const result = await requestEmailChange(
      req.user.id,
      req.body.newEmail,
      req.body.password
    )

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error("Update email error:", error)
    res.status(500).json({ error: "Failed to initiate email change" })
  }
})

// POST /auth/update-password - Change password (requires auth)
router.post("/update-password", requireAuth, async (req, res) => {
  try {
    const result = await updatePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    )

    if (!result.success) {
      return res.status(401).json({ error: result.error })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error("Update password error:", error)
    res.status(500).json({ error: "Failed to update password" })
  }
})

// POST /auth/forgot-password - Request password reset (no auth required)
router.post("/forgot-password", async (req, res) => {
  try {
    const result = await forgotPassword(req.body.email)
    res.json({ message: result.message })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Failed to process password reset request" })
  }
})

// POST /auth/reset-password - Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const result = await resetPassword(req.body.token, req.body.newPassword)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    const authToken = signToken({
      userId: result.user.id,
      email: result.user.email,
    })
    setWebAuthCookie(res, authToken)

    res.json({
      message: result.message,
      user: result.user,
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Failed to reset password" })
  }
})

// POST /auth/delete-account - Self-service account deletion (archives)
router.post("/delete-account", requireAuth, async (req, res) => {
  try {
    const result = await archiveAccount(req.user.id, req.body.password)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    clearWebAuthCookie(res)
    res.json({ message: result.message })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({ error: "Failed to delete account" })
  }
})

// GET /auth/reactivate?token=xxx - Verify account reactivation
router.get("/reactivate", async (req, res) => {
  try {
    const result = await verifyAccountReactivation(req.query.token)

    if (!result.success) {
      return res.redirect(`${WEBAPP_URL}/reactivate?error=${result.error}`)
    }

    res.redirect(`${WEBAPP_URL}/reactivate?success=true`)
  } catch (error) {
    console.error("Account reactivation error:", error)
    res.redirect(`${WEBAPP_URL}/reactivate?error=reactivation_failed`)
  }
})

export default router
