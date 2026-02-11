-- CreateEnum
CREATE TYPE "ReleaseApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseApproval" (
    "id" TEXT NOT NULL,
    "productAssessmentId" TEXT NOT NULL,
    "status" "ReleaseApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseApproval_productAssessmentId_key" ON "ReleaseApproval"("productAssessmentId");

-- CreateIndex
CREATE INDEX "ReleaseApproval_productAssessmentId_idx" ON "ReleaseApproval"("productAssessmentId");

-- AddForeignKey
ALTER TABLE "ReleaseApproval" ADD CONSTRAINT "ReleaseApproval_productAssessmentId_fkey" FOREIGN KEY ("productAssessmentId") REFERENCES "ProductAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
