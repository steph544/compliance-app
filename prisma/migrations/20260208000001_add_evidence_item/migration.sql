-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('REQUESTED', 'COLLECTED', 'VERIFIED');

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "productAssessmentId" TEXT NOT NULL,
    "controlId" TEXT,
    "taskIdentifier" TEXT,
    "requestedArtifact" TEXT NOT NULL,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'REQUESTED',
    "linkUrl" TEXT,
    "note" TEXT,
    "uploadedFileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvidenceItem_productAssessmentId_controlId_idx" ON "EvidenceItem"("productAssessmentId", "controlId");

-- CreateIndex
CREATE INDEX "EvidenceItem_productAssessmentId_taskIdentifier_idx" ON "EvidenceItem"("productAssessmentId", "taskIdentifier");

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_productAssessmentId_fkey" FOREIGN KEY ("productAssessmentId") REFERENCES "ProductAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
