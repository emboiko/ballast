/**
 * @fileoverview Type declarations for environment configuration utilities
 */

/**
 * Load environment variables for the current app
 * Looks for .env.local first, then .env in the current working directory
 * and walks upward until the repo root.
 */
export declare function loadEnv(): void

/**
 * Get required environment variable (throws if missing)
 * Use this for variables that must be set for the app to function.
 * For optional variables with defaults, use process.env[key] ?? defaultValue directly.
 *
 * @param key - Environment variable key
 * @returns The environment variable value
 * @throws {Error} If variable is not set
 */
export declare function getRequiredEnvVar(key: string): string
