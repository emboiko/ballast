-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "SubscriptionPaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL');

-- CreateTable
CREATE TABLE "ServiceSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "processor" "PaymentProcessor" NOT NULL,
    "processorPaymentMethodId" TEXT NOT NULL,
    "processorCustomerId" TEXT,
    "processorPaymentMethod" JSONB,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "interval" "SubscriptionInterval" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextChargeDate" TIMESTAMP(3),
    "failedPaymentAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedChargeAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSubscriptionPayment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "status" "SubscriptionPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "failureMessage" TEXT,
    "processorPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceSubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceIntervalPrice" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "interval" "SubscriptionInterval" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceIntervalPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceSubscription_userId_idx" ON "ServiceSubscription"("userId");

-- CreateIndex
CREATE INDEX "ServiceSubscription_serviceId_idx" ON "ServiceSubscription"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceSubscription_status_idx" ON "ServiceSubscription"("status");

-- CreateIndex
CREATE INDEX "ServiceSubscription_nextChargeDate_idx" ON "ServiceSubscription"("nextChargeDate");

-- CreateIndex
CREATE INDEX "ServiceSubscription_userId_serviceId_idx" ON "ServiceSubscription"("userId", "serviceId");

-- CreateIndex
CREATE INDEX "ServiceSubscriptionPayment_subscriptionId_idx" ON "ServiceSubscriptionPayment"("subscriptionId");

-- CreateIndex
CREATE INDEX "ServiceSubscriptionPayment_status_idx" ON "ServiceSubscriptionPayment"("status");

-- CreateIndex
CREATE INDEX "ServiceSubscriptionPayment_scheduledFor_idx" ON "ServiceSubscriptionPayment"("scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceIntervalPrice_serviceId_interval_key" ON "ServiceIntervalPrice"("serviceId", "interval");

-- CreateIndex
CREATE INDEX "ServiceIntervalPrice_serviceId_idx" ON "ServiceIntervalPrice"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceIntervalPrice_interval_idx" ON "ServiceIntervalPrice"("interval");

-- CreateIndex
CREATE INDEX "ServiceIntervalPrice_isEnabled_idx" ON "ServiceIntervalPrice"("isEnabled");

-- AddForeignKey
ALTER TABLE "ServiceSubscription" ADD CONSTRAINT "ServiceSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSubscription" ADD CONSTRAINT "ServiceSubscription_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSubscriptionPayment" ADD CONSTRAINT "ServiceSubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "ServiceSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceIntervalPrice" ADD CONSTRAINT "ServiceIntervalPrice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

