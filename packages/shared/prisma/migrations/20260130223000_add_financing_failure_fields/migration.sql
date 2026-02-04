-- AlterTable
ALTER TABLE "FinancingPlan" ADD COLUMN "failedPaymentAttempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FinancingPayment" ADD COLUMN "failureMessage" TEXT;
