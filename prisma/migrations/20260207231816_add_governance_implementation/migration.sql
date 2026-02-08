-- CreateEnum
CREATE TYPE "ImplementationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "GovernanceImplementation" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "status" "ImplementationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceImplementation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GovernanceImplementation_resultId_key" ON "GovernanceImplementation"("resultId");

-- AddForeignKey
ALTER TABLE "GovernanceImplementation" ADD CONSTRAINT "GovernanceImplementation_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "OrgAssessmentResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
