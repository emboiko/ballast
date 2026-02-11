-- CreateTable
CREATE TABLE "AutomatedNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "daysBefore" INTEGER,
    "dedupeKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomatedNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutomatedNotification_dedupeKey_key" ON "AutomatedNotification"("dedupeKey");

-- CreateIndex
CREATE INDEX "AutomatedNotification_userId_idx" ON "AutomatedNotification"("userId");

-- CreateIndex
CREATE INDEX "AutomatedNotification_type_createdAt_idx" ON "AutomatedNotification"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AutomatedNotification_entityType_entityId_idx" ON "AutomatedNotification"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AutomatedNotification_scheduledFor_idx" ON "AutomatedNotification"("scheduledFor");

-- AddForeignKey
ALTER TABLE "AutomatedNotification" ADD CONSTRAINT "AutomatedNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

