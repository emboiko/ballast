-- AlterTable
ALTER TABLE "FinancingPlan"
  ADD COLUMN IF NOT EXISTS "failedPaymentAttempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FinancingPayment"
  ADD COLUMN IF NOT EXISTS "failureMessage" TEXT;
