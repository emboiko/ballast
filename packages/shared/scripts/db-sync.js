import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const sharedRoot = path.resolve(currentDir, "..")

const isWindows = process.platform === "win32"
let prismaBinary = "prisma"
if (isWindows) {
  prismaBinary = "prisma.cmd"
}

const prismaPath = path.join(sharedRoot, "node_modules", ".bin", prismaBinary)

const runPrismaCommand = (args) => {
  return new Promise((resolve, reject) => {
    let command = prismaPath
    let commandArgs = args
    if (isWindows) {
      const commandShell = process.env.ComSpec || "cmd.exe"
      command = commandShell
      commandArgs = ["/d", "/s", "/c", prismaPath, ...args]
    }

    const child = spawn(command, commandArgs, {
      cwd: sharedRoot,
      stdio: "inherit",
    })

    child.on("error", (error) => {
      reject(error)
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`Prisma command failed with code ${code}`))
    })
  })
}

const run = async () => {
  await runPrismaCommand(["db", "push", "--schema=prisma/schema.prisma"])
  await runPrismaCommand(["generate", "--schema=prisma/schema.prisma"])
}

run().catch((error) => {
  console.error("Database sync failed:", error)
  process.exit(1)
})
