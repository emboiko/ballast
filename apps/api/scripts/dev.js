import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const apiRoot = path.resolve(currentDir, "..")
const repoRoot = path.resolve(apiRoot, "..", "..")
const dbSyncScript = path.join(
  repoRoot,
  "packages",
  "shared",
  "scripts",
  "db-sync.js"
)

const runNodeScript = (scriptPath, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: "inherit",
      ...options,
    })

    child.on("error", (error) => {
      reject(error)
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`Process exited with code ${code}`))
    })
  })
}

const run = async () => {
  await runNodeScript(dbSyncScript)
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--watch", "src/index.js"],
      {
        cwd: apiRoot,
        stdio: "inherit",
      }
    )

    child.on("error", (error) => {
      reject(error)
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`API dev process exited with code ${code}`))
    })
  })
}

run().catch((error) => {
  console.error("API dev startup failed:", error)
  process.exit(1)
})
