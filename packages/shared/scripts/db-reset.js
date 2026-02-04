#!/usr/bin/env node

/**
 * Resets the database by deleting all data from all tables.
 * Useful for development/testing - preserves schema, clears data.
 *
 * Usage: pnpm --filter @ballast/shared db:reset
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const reset = async () => {
  console.info("🗑️  Resetting database...")

  // Delete in order to respect foreign key constraints
  await prisma.catalogImage.deleteMany()
  console.info("   ✓ Cleared catalog images")

  await prisma.orderItem.deleteMany()
  console.info("   ✓ Cleared order items")

  await prisma.refund.deleteMany()
  console.info("   ✓ Cleared refunds")

  await prisma.order.deleteMany()
  console.info("   ✓ Cleared orders")

  await prisma.contactSubmission.deleteMany()
  console.info("   ✓ Cleared contact submissions")

  await prisma.communicationEmail.deleteMany()
  console.info("   ✓ Cleared communication emails")

  await prisma.verificationToken.deleteMany()
  console.info("   ✓ Cleared verification tokens")

  await prisma.user.deleteMany()
  console.info("   ✓ Cleared users")

  await prisma.product.deleteMany()
  console.info("   ✓ Cleared products")

  await prisma.service.deleteMany()
  console.info("   ✓ Cleared services")

  await prisma.historyEvent.deleteMany()
  console.info("   ✓ Cleared history events")

  console.info("✅ Database reset complete!")
}

reset()
  .catch((error) => {
    console.error("❌ Reset failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
