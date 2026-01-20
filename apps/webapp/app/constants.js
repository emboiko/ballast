import { createEnvWarningHelpers } from "@ballast/shared/src/config/env-warnings.js"
/**
 * Webapp Application Constants
 *
 * This file consolidates all environment variable access and constants
 * for the webapp application. All process.env access should happen here.
 *
 * Note: Next.js automatically loads .env.local and .env files, so we don't
 * need to call loadEnv() here. Only NEXT_PUBLIC_* variables are available
 * in client-side code.
 */

// ============================================================================
// API Configuration
// ============================================================================

const warnEnvValue = createEnvWarningHelpers("webapp")

/**
 * Base URL for the API server (client-side)
 * @type {string|undefined}
 */
export const API_URL = warnEnvValue(
  "NEXT_PUBLIC_API_URL",
  process.env.NEXT_PUBLIC_API_URL,
  undefined
)

// ============================================================================
// Payment Processors
// ============================================================================

/**
 * Stripe publishable key (client-side)
 * @type {string|undefined}
 */
export const STRIPE_PUBLISHABLE_KEY = warnEnvValue(
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  undefined
)

/**
 * Payment processor selection (client-side)
 * Valid values: "stripe", "braintree", "square", "authorize"
 * @type {string|undefined}
 */
export const PAYMENT_PROCESSOR = warnEnvValue(
  "NEXT_PUBLIC_PAYMENT_PROCESSOR",
  process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR,
  undefined
)

/**
 * Braintree client token (client-side)
 * @type {string|undefined}
 */
export const BRAINTREE_CLIENT_TOKEN = warnEnvValue(
  "NEXT_PUBLIC_BRAINTREE_CLIENT_TOKEN",
  process.env.NEXT_PUBLIC_BRAINTREE_CLIENT_TOKEN,
  undefined
)

/**
 * Square application ID (client-side)
 * @type {string|undefined}
 */
export const SQUARE_APPLICATION_ID = warnEnvValue(
  "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
  process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
  undefined
)

/**
 * Authorize.net API login ID (client-side)
 * @type {string|undefined}
 */
export const AUTHORIZE_API_LOGIN_ID = warnEnvValue(
  "NEXT_PUBLIC_AUTHORIZE_API_LOGIN_ID",
  process.env.NEXT_PUBLIC_AUTHORIZE_API_LOGIN_ID,
  undefined
)

/**
 * Authorize.net client key (client-side)
 * @type {string|undefined}
 */
export const AUTHORIZE_CLIENT_KEY = warnEnvValue(
  "NEXT_PUBLIC_AUTHORIZE_CLIENT_KEY",
  process.env.NEXT_PUBLIC_AUTHORIZE_CLIENT_KEY,
  undefined
)

// ============================================================================
// Security / CAPTCHA
// ============================================================================

/**
 * Cloudflare Turnstile site key (client-side)
 * @type {string|undefined}
 */
export const TURNSTILE_SITE_KEY = warnEnvValue(
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  undefined
)

/**
 * Cloudflare Turnstile script URL
 * @type {string}
 */
export const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js"

// ============================================================================
// Application Constants
// ============================================================================

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
 * Shopping cart browser storage key (localStorage)
 * @type {string}
 */
export const CART_STORAGE_KEY = "ballast.cart"


// ============================================================================
// Support
// ============================================================================

/**
 * Support phone number (client-side)
 * @type {string|undefined}
 */
export const SUPPORT_PHONE_NUMBER = warnEnvValue(
  "NEXT_PUBLIC_SUPPORT_PHONE_NUMBER",
  process.env.NEXT_PUBLIC_SUPPORT_PHONE_NUMBER,
  undefined
)

const buildPhoneTelHref = (phoneNumber) => {
  if (typeof phoneNumber !== "string") {
    return undefined
  }

  const trimmed = phoneNumber.trim()
  if (trimmed.length === 0) {
    return undefined
  }

  const normalized = trimmed.replace(/[^\d+]/g, "")
  if (normalized.length === 0) {
    return undefined
  }

  return `tel:${normalized}`
}

/**
 * Convenience `tel:` href for the configured support phone number
 * @type {string|undefined}
 */
export const SUPPORT_PHONE_TEL_HREF = buildPhoneTelHref(SUPPORT_PHONE_NUMBER)
