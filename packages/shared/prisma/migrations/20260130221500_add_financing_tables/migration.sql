-- CreateEnum
CREATE TYPE "FinancingPlanStatus" AS ENUM ('ACTIVE', 'PAID_OFF', 'PAUSED', 'CANCELED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "FinancingPaymentType" AS ENUM ('INSTALLMENT', 'PRINCIPAL');

-- CreateEnum
CREATE TYPE "FinancingPaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "FinancingCadence" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "FinancingPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "processor" "PaymentProcessor" NOT NULL,
    "processorPaymentMethodId" TEXT NOT NULL,
    "processorCustomerId" TEXT,
    "processorPaymentMethod" JSONB,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "totalAmountCents" INTEGER NOT NULL,
    "downPaymentCents" INTEGER NOT NULL,
    "financedAmountCents" INTEGER NOT NULL,
    "remainingBalanceCents" INTEGER NOT NULL,
    "installmentAmountCents" INTEGER NOT NULL,
    "termCount" INTEGER NOT NULL,
    "interestRateBasisPoints" INTEGER NOT NULL DEFAULT 0,
    "cadence" "FinancingCadence" NOT NULL,
    "scheduleJson" JSONB NOT NULL,
    "nextPaymentDate" TIMESTAMP(3),
    "status" "FinancingPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "failedPaymentAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingPayment" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "type" "FinancingPaymentType" NOT NULL,
    "status" "FinancingPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "scheduledFor" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "failureMessage" TEXT,
    "processorPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingContract" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "html" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancingContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancingPlan_orderId_key" ON "FinancingPlan"("orderId");

-- CreateIndex
CREATE INDEX "FinancingPlan_userId_idx" ON "FinancingPlan"("userId");

-- CreateIndex
CREATE INDEX "FinancingPlan_status_idx" ON "FinancingPlan"("status");

-- CreateIndex
CREATE INDEX "FinancingPlan_processor_processorPaymentMethodId_idx" ON "FinancingPlan"("processor", "processorPaymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancingPayment_processorPaymentId_key" ON "FinancingPayment"("processorPaymentId");

-- CreateIndex
CREATE INDEX "FinancingPayment_planId_idx" ON "FinancingPayment"("planId");

-- CreateIndex
CREATE INDEX "FinancingPayment_type_idx" ON "FinancingPayment"("type");

-- CreateIndex
CREATE INDEX "FinancingPayment_status_idx" ON "FinancingPayment"("status");

-- CreateIndex
CREATE INDEX "FinancingContract_planId_idx" ON "FinancingContract"("planId");

-- CreateIndex
CREATE INDEX "FinancingContract_createdAt_idx" ON "FinancingContract"("createdAt");

-- AddForeignKey
ALTER TABLE "FinancingPlan" ADD CONSTRAINT "FinancingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingPlan" ADD CONSTRAINT "FinancingPlan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingPayment" ADD CONSTRAINT "FinancingPayment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "FinancingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingContract" ADD CONSTRAINT "FinancingContract_planId_fkey" FOREIGN KEY ("planId") REFERENCES "FinancingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
