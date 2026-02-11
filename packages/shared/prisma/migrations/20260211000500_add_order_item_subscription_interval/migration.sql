-- AlterTable
ALTER TABLE "OrderItem"
  ADD COLUMN IF NOT EXISTS "subscriptionInterval" "SubscriptionInterval";

-- CreateIndex
CREATE INDEX "OrderItem_subscriptionInterval_idx" ON "OrderItem"("subscriptionInterval");

