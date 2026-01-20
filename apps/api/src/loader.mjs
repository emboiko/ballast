/**
 * ESM Import Alias Loader
 * Enables @/ and @shared/ import aliases at runtime for Node.js ESM
 * Uses the register hook API (Node.js 20.6+)
 */
import { pathToFileURL } from "url"
import { resolve as resolvePath, dirname, extname } from "path"
import { fileURLToPath } from "url"
import { existsSync } from "fs"
// Get the project root (api directory)
// When loaded as a loader, import.meta.url points to this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// loader.mjs is in src/, so go up one level to get api/ directory
const projectRoot = resolvePath(__dirname, "..")

// Resolve alias paths
function resolveAlias(specifier) {
  if (specifier.startsWith("@/")) {
    const path = specifier.replace("@/", "")
    let resolved = resolvePath(projectRoot, "src", path)

    // If no extension, try .js
    if (!extname(resolved)) {
      const withExt = `${resolved}.js`
      if (existsSync(withExt)) {
        resolved = withExt
      }
    }

    return pathToFileURL(resolved).href
  }

  if (specifier.startsWith("@shared/")) {
    const path = specifier.replace("@shared/", "")
    let resolved = resolvePath(
      projectRoot,
      "..",
      "..",
      "packages",
      "shared",
      "src",
      path
    )

    // If no extension, try .js
    if (!extname(resolved)) {
      const withExt = `${resolved}.js`
      if (existsSync(withExt)) {
        resolved = withExt
      }
    }

    return pathToFileURL(resolved).href
  }

  return null
}

export async function resolve(specifier, context, nextResolve) {
  // Only intercept if it's an alias
  if (specifier.startsWith("@/") || specifier.startsWith("@shared/")) {
    const aliasResolved = resolveAlias(specifier)
    if (aliasResolved) {
      return { url: aliasResolved, shortCircuit: true }
    }
  }

  // Otherwise, use default resolution
  return nextResolve(specifier, context)
}
