import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { loadEnv } from "../config/env.js"

const NODE_ENV = process.env.NODE_ENV || "development"
const IS_PRODUCTION = NODE_ENV === "production"

const globalForPrisma = globalThis

const createPrismaClient = () => {
  loadEnv()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (!IS_PRODUCTION) {
  globalForPrisma.prisma = prisma
}

export default prisma
