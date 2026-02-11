/**
 * Jobs Application Constants
 *
 * This file consolidates all environment variable access and constants
 * for the Jobs application. All process.env access should happen here.
 */

import { z } from "zod"
import { loadEnv } from "../../../packages/shared/src/config/env.js"
import { createEnvWarningHelpers } from "../../../packages/shared/src/config/env-warnings.js"

// Load environment variables before evaluating constants
loadEnv()

const warnEnvValue = createEnvWarningHelpers("jobs")

/**
 * Base URL for internal API calls from jobs.
 * If `API_INTERNAL_URL` is set, it takes precedence over `API_URL`.
 * @type {string}
 */
export const INTERNAL_API_BASE_URL = (() => {
  const explicit = warnEnvValue(
    "API_INTERNAL_URL",
    process.env.API_INTERNAL_URL,
    undefined
  )
  if (typeof explicit === "string" && explicit.trim().length > 0) {
    return explicit.trim().replace(/\/+$/, "")
  }

  const apiUrl = warnEnvValue(
    "API_URL",
    process.env.API_URL,
    "http://localhost:3000"
  )
  if (typeof apiUrl === "string" && apiUrl.trim().length > 0) {
    return apiUrl.trim().replace(/\/+$/, "")
  }

  return "http://localhost:3000"
})()

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
 * Stripe secret key
 * @type {string|undefined}
 */
export const STRIPE_SECRET_KEY = warnEnvValue(
  "STRIPE_SECRET_KEY",
  process.env.STRIPE_SECRET_KEY,
  undefined
)

/**
 * How many days before a charge we should send reminders.
 * @type {string|undefined}
 */
export const PAYMENT_REMINDER_DAYS_BEFORE = warnEnvValue(
  "PAYMENT_REMINDER_DAYS_BEFORE",
  process.env.PAYMENT_REMINDER_DAYS_BEFORE,
  "3"
)

/**
 * Current Node.js environment
 * @type {string}
 */
export const NODE_ENV = warnEnvValue(
  "NODE_ENV",
  process.env.NODE_ENV,
  "development"
)

const trimmedUrlSchema = z.string().trim().pipe(z.url())

const envValidationSchema = z.object({
  INTERNAL_API_BASE_URL: trimmedUrlSchema,
  NODE_ENV: z.enum(["development", "test", "production"]),
  PAYMENT_REMINDER_DAYS_BEFORE: z.coerce.number().int().positive(),
  JOBS_INTERNAL_API_TOKEN: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
})

const envValidationResult = envValidationSchema.safeParse({
  INTERNAL_API_BASE_URL,
  NODE_ENV,
  PAYMENT_REMINDER_DAYS_BEFORE,
  JOBS_INTERNAL_API_TOKEN,
  STRIPE_SECRET_KEY,
})

if (!envValidationResult.success) {
  const treeifiedErrors = z.treeifyError(envValidationResult.error)
  const message = `Invalid Jobs environment configuration: ${JSON.stringify(
    treeifiedErrors
  )}`

  if (NODE_ENV === "production") {
    throw new Error(message)
  }

  console.warn(message)
}
