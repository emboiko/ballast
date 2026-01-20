import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
    // @ts-expect-error Prisma config supports directUrl at runtime.
    directUrl: env("DIRECT_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
})
