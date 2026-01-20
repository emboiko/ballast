import { config } from "dotenv"
import { dirname, join } from "path"
import { existsSync } from "fs"

/**
 * Load environment variables for the current app
 * Looks for .env.local first, then .env in the current working directory
 * and walks upward until the repo root.
 */
export const loadEnv = () => {
  const visitedDirs = new Set()
  let currentDir = process.cwd()

  let workspaceRoot = null

  while (!visitedDirs.has(currentDir)) {
    visitedDirs.add(currentDir)

    const envLocalPath = join(currentDir, ".env.local")
    if (existsSync(envLocalPath)) {
      config({ path: envLocalPath })
    }

    const envPath = join(currentDir, ".env")
    if (existsSync(envPath)) {
      config({ path: envPath })
    }

    const hasWorkspaceMarker =
      existsSync(join(currentDir, "pnpm-workspace.yaml")) ||
      existsSync(join(currentDir, ".git"))
    if (hasWorkspaceMarker) {
      workspaceRoot = currentDir
      break
    }

    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) {
      break
    }
    currentDir = parentDir
  }

  if (workspaceRoot) {
    const sharedEnvLocalPath = join(
      workspaceRoot,
      "packages",
      "shared",
      ".env.local"
    )
    if (existsSync(sharedEnvLocalPath)) {
      config({ path: sharedEnvLocalPath })
    }

    const sharedEnvPath = join(workspaceRoot, "packages", "shared", ".env")
    if (existsSync(sharedEnvPath)) {
      config({ path: sharedEnvPath })
    }
  }
}

/**
 * Get required environment variable (throws if missing)
 * Use this for variables that must be set for the app to function.
 * For optional variables with defaults, use process.env[key] ?? defaultValue directly.
 *
 * @param {string} key - Environment variable key
 * @returns {string}
 * @throws {Error} If variable is not set
 * @example
 * const port = getRequiredEnvVar("PORT")
 */
export const getRequiredEnvVar = (key) => {
  const value = process.env[key]
  if (value === undefined) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}
