/**
 * API Application Constants
 *
 * This file consolidates all environment variable access and constants
 * for the API application. All process.env access should happen here.
 */

import { loadEnv } from "../../../packages/shared/src/config/env.js"
import { createEnvWarningHelpers } from "../../../packages/shared/src/config/env-warnings.js"
import { z } from "zod"

// Load environment variables before evaluating constants
loadEnv()

const warnEnvValue = createEnvWarningHelpers("api")

// ============================================================================
// Server Configuration
// ============================================================================

/**
 * Port number for the API server
 * @type {string|undefined}
 */
export const PORT = warnEnvValue("PORT", process.env.PORT, "3000")

/**
 * Base URL for the webapp (used for CORS and email links)
 * @type {string|undefined}
 */
export const WEBAPP_URL = warnEnvValue(
  "WEBAPP_URL",
  process.env.WEBAPP_URL,
  "http://localhost:3001"
)

/**
 * Base URL for the admin dashboard (used for CORS)
 * @type {string|undefined}
 */
export const ADMIN_URL = warnEnvValue(
  "ADMIN_URL",
  process.env.ADMIN_URL,
  "http://localhost:3003"
)

/**
 * Base URL for the API server (used for email links)
 * @type {string|undefined}
 */
export const API_URL = warnEnvValue(
  "API_URL",
  process.env.API_URL,
  "http://localhost:3000"
)

// ============================================================================
// Authentication
// ============================================================================

/**
 * JWT secret key for signing and verifying authentication tokens
 * @type {string|undefined}
 */
export const JWT_SECRET = warnEnvValue(
  "JWT_SECRET",
  process.env.JWT_SECRET,
  undefined
)

/**
 * Google OAuth client ID
 * @type {string}
 */
export const GOOGLE_OAUTH_CLIENT_ID = warnEnvValue(
  "GOOGLE_OAUTH_CLIENT_ID",
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  undefined
)

/**
 * Google OAuth client secret
 * @type {string}
 */
export const GOOGLE_OAUTH_CLIENT_SECRET = warnEnvValue(
  "GOOGLE_OAUTH_CLIENT_SECRET",
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  undefined
)

/**
 * Google OAuth endpoints
 * @type {{ authUrl: string, tokenUrl: string, userInfoUrl: string }}
 */
export const GOOGLE_OAUTH_ENDPOINTS = {
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
}

// ============================================================================
// Email Gateway
// ============================================================================

/**
 * Resend API key for sending emails
 * @type {string|undefined}
 */
export const RESEND_API_KEY = warnEnvValue(
  "RESEND_API_KEY",
  process.env.RESEND_API_KEY,
  undefined
)

/**
 * From email address for Resend emails
 * @type {string|undefined}
 */
export const RESEND_FROM_EMAIL = warnEnvValue(
  "RESEND_FROM_EMAIL",
  process.env.RESEND_FROM_EMAIL,
  undefined
)

/**
 * Webhook signing secret for Resend (Svix)
 * @type {string|undefined}
 */
export const RESEND_WEBHOOK_SECRET = warnEnvValue(
  "RESEND_WEBHOOK_SECRET",
  process.env.RESEND_WEBHOOK_SECRET,
  undefined
)

/**
 * Shared secret used by internal Jobs callers.
 * Passed via: Authorization: Bearer <token>
 * @type {string|undefined}
 */
export const JOBS_INTERNAL_API_TOKEN = warnEnvValue(
  "JOBS_INTERNAL_API_TOKEN",
  process.env.JOBS_INTERNAL_API_TOKEN,
  undefined
)

/**
 * How many days before a charge we should send reminders.
 * Jobs are responsible for selecting due items; API uses this mainly as a default.
 * @type {string|undefined}
 */
export const PAYMENT_REMINDER_DAYS_BEFORE = warnEnvValue(
  "PAYMENT_REMINDER_DAYS_BEFORE",
  process.env.PAYMENT_REMINDER_DAYS_BEFORE,
  "3"
)

// ============================================================================
// Payment Gateway
// ============================================================================

/**
 * Stripe secret key
 * @type {string|undefined}
 */
export const STRIPE_SECRET_KEY = warnEnvValue(
  "STRIPE_SECRET_KEY",
  process.env.STRIPE_SECRET_KEY,
  undefined
)

// ============================================================================
// Security / CAPTCHA
// ============================================================================

/**
 * Cloudflare Turnstile secret key
 * @type {string|undefined}
 */
export const TURNSTILE_SECRET_KEY = warnEnvValue(
  "TURNSTILE_SECRET_KEY",
  process.env.TURNSTILE_SECRET_KEY,
  undefined
)

/**
 * Cloudflare Turnstile verification API endpoint
 * @type {string}
 */
export const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

// ============================================================================
// Application Constants
// ============================================================================

/**
 * Number of bcrypt salt rounds for password hashing
 * @type {number}
 */
export const BCRYPT_SALT_ROUNDS = 12

/**
 * Current Node.js environment
 * @type {string}
 */
export const NODE_ENV = warnEnvValue(
  "NODE_ENV",
  process.env.NODE_ENV,
  "development"
)

/**
 * Whether the application is running in production
 * @type {boolean}
 */
export const IS_PRODUCTION = NODE_ENV === "production"

/**
 * Whether the application is running in development
 * @type {boolean}
 */
export const IS_DEVELOPMENT = NODE_ENV === "development"

/**
 * Google OAuth state cookie name (webapp)
 * @type {string}
 */
export const GOOGLE_OAUTH_STATE_COOKIE_NAME = "google_oauth_state"

/**
 * Google OAuth state cookie name (admin)
 * @type {string}
 */
export const ADMIN_GOOGLE_OAUTH_STATE_COOKIE_NAME = "admin_google_oauth_state"

/**
 * Google OAuth state cookie options (webapp)
 * @type {object}
 */
export const GOOGLE_OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: "/auth/google",
}

/**
 * Google OAuth state cookie options (admin)
 * @type {object}
 */
export const ADMIN_GOOGLE_OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: "/admin/auth/google",
}

// ============================================================================
// Catalog Image Uploads
// ============================================================================

/**
 * Max image upload size in bytes (default 20MB)
 * @type {number}
 */
export const CATALOG_IMAGE_MAX_SIZE_BYTES = warnEnvValue(
  "CATALOG_IMAGE_MAX_SIZE_BYTES",
  process.env.CATALOG_IMAGE_MAX_SIZE_BYTES,
  20971520,
  { parseNumber: true }
)

/**
 * Max number of images per upload request
 * @type {number}
 */
export const CATALOG_IMAGE_MAX_COUNT = warnEnvValue(
  "CATALOG_IMAGE_MAX_COUNT",
  process.env.CATALOG_IMAGE_MAX_COUNT,
  12,
  { parseNumber: true }
)

/**
 * Allowed MIME types for catalog images
 * @type {string[]}
 */
export const CATALOG_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]

// ============================================================================
// Runtime environment validation (best-effort)
// ============================================================================

const trimmedUrlSchema = z.string().trim().pipe(z.url())

const envValidationSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  WEBAPP_URL: trimmedUrlSchema,
  ADMIN_URL: trimmedUrlSchema,
  API_URL: trimmedUrlSchema,
  NODE_ENV: z.enum(["development", "test", "production"]),
  PAYMENT_REMINDER_DAYS_BEFORE: z.coerce.number().int().positive(),
  CATALOG_IMAGE_MAX_SIZE_BYTES: z.number().int().positive(),
  CATALOG_IMAGE_MAX_COUNT: z.number().int().positive(),

  JWT_SECRET: z.string().min(1).optional(),
  JOBS_INTERNAL_API_TOKEN: z.string().min(1).optional(),

  STRIPE_SECRET_KEY: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().min(1).optional(),
  RESEND_WEBHOOK_SECRET: z.string().min(1).optional(),

  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),

  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
})

const envValidationResult = envValidationSchema.safeParse({
  PORT,
  WEBAPP_URL,
  ADMIN_URL,
  API_URL,
  NODE_ENV,
  PAYMENT_REMINDER_DAYS_BEFORE,
  CATALOG_IMAGE_MAX_SIZE_BYTES,
  CATALOG_IMAGE_MAX_COUNT,
  JWT_SECRET,
  JOBS_INTERNAL_API_TOKEN,
  STRIPE_SECRET_KEY,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  RESEND_WEBHOOK_SECRET,
  TURNSTILE_SECRET_KEY,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
})

if (!envValidationResult.success) {
  const treeifiedErrors = z.treeifyError(envValidationResult.error)
  const message = `Invalid API environment configuration: ${JSON.stringify(
    treeifiedErrors
  )}`

  if (NODE_ENV === "production") {
    throw new Error(message)
  }

  console.warn(message)
}
