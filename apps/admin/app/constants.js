import { createEnvWarningHelpers } from "@ballast/shared/src/config/env-warnings.js"
/**
 * Admin Application Constants
 *
 * This file consolidates all environment variable access and constants
 * for the admin application. All process.env access should happen here.
 *
 * Note: Next.js automatically loads .env.local and .env files, so we don't
 * need to call loadEnv() here. Only NEXT_PUBLIC_* variables are available
 * in client-side code.
 */

// ============================================================================
// API Configuration
// ============================================================================

const warnEnvValue = createEnvWarningHelpers("admin")

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

// ============================================================================
// Search Configuration
// ============================================================================

/**
 * Default number of results to show in search dropdown
 * @type {number}
 */
export const SEARCH_DROPDOWN_LIMIT = 5

/**
 * Default number of results per page on search results page
 * @type {number}
 */
export const SEARCH_PAGE_LIMIT = 20

/**
 * Debounce delay for search input (milliseconds)
 * @type {number}
 */
export const SEARCH_DEBOUNCE_MS = 300

// ============================================================================
// Sidebar Configuration
// ============================================================================

/**
 * LocalStorage key for sidebar collapsed state
 * @type {string}
 */
export const SIDEBAR_STATE_KEY = "admin_sidebar_collapsed"

// ============================================================================
// Catalog Image Uploads
// ============================================================================

/**
 * Max image upload size in bytes (default 20MB)
 * @type {number}
 */
export const CATALOG_IMAGE_MAX_SIZE_BYTES = warnEnvValue(
  "NEXT_PUBLIC_CATALOG_IMAGE_MAX_SIZE_BYTES",
  process.env.NEXT_PUBLIC_CATALOG_IMAGE_MAX_SIZE_BYTES,
  20971520,
  { parseNumber: true }
)

/**
 * Max number of images per upload request
 * @type {number}
 */
export const CATALOG_IMAGE_MAX_COUNT = warnEnvValue(
  "NEXT_PUBLIC_CATALOG_IMAGE_MAX_COUNT",
  process.env.NEXT_PUBLIC_CATALOG_IMAGE_MAX_COUNT,
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
// Communications Configuration
// ============================================================================

/**
 * LocalStorage key for communications polling toggle
 * @type {string}
 */
export const COMMUNICATIONS_POLLING_STATE_KEY =
  "admin_communications_polling_enabled"

/**
 * Poll interval (milliseconds)
 * @type {number}
 */
export const COMMUNICATIONS_POLL_INTERVAL_MS = 15000

/**
 * Default page size for communications list
 * @type {number}
 */
export const COMMUNICATIONS_PAGE_SIZE = 25

// ============================================================================
// Refunds Configuration
// ============================================================================

/**
 * Default page size for refunds list
 * @type {number}
 */
export const REFUNDS_PAGE_SIZE = 25

// ============================================================================
// Refunds Configuration
// ============================================================================

/**
 * Default page size for refunds list
 * @type {number}
 */
export const JOBS_PAGE_SIZE = 25

// ============================================================================
// Dashboard Configuration
// ============================================================================

/**
 * Default page size for activity feed
 * @type {number}
 */
export const FEED_LIMIT = 25

/**
 * Activity feed refresh interval (milliseconds)
 * @type {number}
 */
export const REFRESH_INTERVAL_MS = 10000
