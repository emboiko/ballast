/**
 * ESM Import Alias Register Hook
 * Registers the loader for @/ and @shared/ import aliases
 * Uses the register() API (Node.js 20.6+)
 */
import { register } from "node:module"
import { pathToFileURL } from "node:url"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, "..")
const loaderPath = resolve(__dirname, "loader.mjs")

register(pathToFileURL(loaderPath).href, pathToFileURL(projectRoot))
