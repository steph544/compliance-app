-- CreateEnum
CREATE TYPE "ReassessmentTriggerType" AS ENUM ('SCHEDULE', 'THRESHOLD', 'EVENT', 'MANUAL');

-- CreateTable
CREATE TABLE "ReassessmentTrigger" (
    "id" TEXT NOT NULL,
    "productAssessmentId" TEXT,
    "orgAssessmentId" TEXT,
    "triggerType" "ReassessmentTriggerType" NOT NULL,
    "config" JSONB NOT NULL,
    "nextDueAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReassessmentTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReassessmentTrigger_productAssessmentId_idx" ON "ReassessmentTrigger"("productAssessmentId");

-- CreateIndex
CREATE INDEX "ReassessmentTrigger_orgAssessmentId_idx" ON "ReassessmentTrigger"("orgAssessmentId");

-- CreateIndex
CREATE INDEX "ReassessmentTrigger_nextDueAt_idx" ON "ReassessmentTrigger"("nextDueAt");

-- AddForeignKey
ALTER TABLE "ReassessmentTrigger" ADD CONSTRAINT "ReassessmentTrigger_productAssessmentId_fkey" FOREIGN KEY ("productAssessmentId") REFERENCES "ProductAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReassessmentTrigger" ADD CONSTRAINT "ReassessmentTrigger_orgAssessmentId_fkey" FOREIGN KEY ("orgAssessmentId") REFERENCES "OrgAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
