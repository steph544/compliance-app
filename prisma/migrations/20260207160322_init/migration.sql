-- CreateEnum
CREATE TYPE "ControlType" AS ENUM ('TECHNICAL', 'PROCESS', 'LEGAL');

-- CreateEnum
CREATE TYPE "ControlScope" AS ENUM ('ORG', 'PRODUCT', 'BOTH');

-- CreateEnum
CREATE TYPE "ImplLevel" AS ENUM ('BASELINE', 'ENHANCED', 'HIGH_STAKES');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RiskTier" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'REGULATED');

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('INTERNAL', 'THIRD_PARTY', 'HYBRID');

-- CreateEnum
CREATE TYPE "SystemPurpose" AS ENUM ('DECISION_SUPPORT', 'AUTOMATION', 'ANALYTICS', 'CUSTOMER_FACING', 'INTERNAL_TOOL');

-- CreateEnum
CREATE TYPE "SystemStatus" AS ENUM ('PLANNED', 'PILOT', 'PRODUCTION', 'DECOMMISSIONING', 'DECOMMISSIONED');

-- CreateTable
CREATE TABLE "NistFunction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NistFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NistCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,

    CONSTRAINT "NistCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NistSubcategory" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "NistSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ControlType" NOT NULL,
    "scope" "ControlScope" NOT NULL,
    "riskTags" TEXT[],
    "applicabilityTags" JSONB,
    "implementationLevel" "ImplLevel" NOT NULL,
    "implementationSteps" TEXT[],
    "monitoringMetrics" JSONB,
    "evidenceArtifacts" TEXT[],
    "vendorGuidance" JSONB,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgAssessmentResult" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "riskTier" "RiskTier" NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskDrivers" JSONB NOT NULL,
    "readinessHeatmap" JSONB NOT NULL,
    "governanceBlueprint" JSONB NOT NULL,
    "nistMapping" JSONB NOT NULL,
    "controlSelections" JSONB NOT NULL,
    "monitoringPlan" JSONB NOT NULL,
    "operationsRunbook" JSONB NOT NULL,
    "policyDrafts" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgAssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAssessment" (
    "id" TEXT NOT NULL,
    "orgAssessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAssessmentResult" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "riskTier" "RiskTier" NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskDrivers" JSONB NOT NULL,
    "fitForAiResult" JSONB NOT NULL,
    "stakeholderMap" JSONB NOT NULL,
    "releaseCriteriaMatrix" JSONB NOT NULL,
    "technicalControls" JSONB NOT NULL,
    "complianceRequirements" JSONB NOT NULL,
    "nistMapping" JSONB NOT NULL,
    "implementationChecklist" JSONB NOT NULL,
    "serviceCard" JSONB NOT NULL,
    "monitoringSpec" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISystem" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vendor" TEXT,
    "vendorType" "VendorType" NOT NULL,
    "aiType" TEXT[],
    "purpose" "SystemPurpose" NOT NULL,
    "department" TEXT NOT NULL,
    "businessOwner" TEXT NOT NULL,
    "technicalOwner" TEXT,
    "dataTypes" TEXT[],
    "hasAutomatedDecisions" BOOLEAN NOT NULL DEFAULT false,
    "affectsExternalUsers" BOOLEAN NOT NULL DEFAULT false,
    "riskTier" "RiskTier",
    "riskNotes" TEXT,
    "modelType" TEXT,
    "modelVersion" TEXT,
    "modelProvider" TEXT,
    "trainingDate" TIMESTAMP(3),
    "dataResidency" TEXT[],
    "status" "SystemStatus" NOT NULL DEFAULT 'PLANNED',
    "deploymentType" TEXT,
    "goLiveDate" TIMESTAMP(3),
    "lastReviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "hasDocumentation" BOOLEAN NOT NULL DEFAULT false,
    "hasImpactAssessment" BOOLEAN NOT NULL DEFAULT false,
    "hasMonitoring" BOOLEAN NOT NULL DEFAULT false,
    "hasIncidentPlan" BOOLEAN NOT NULL DEFAULT false,
    "applicableLaws" TEXT[],
    "prohibitedUses" TEXT,
    "driftThresholds" JSONB,
    "complianceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AISystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ControlNistRefs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ControlNistRefs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RuleControls" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RuleControls_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Control_controlId_key" ON "Control"("controlId");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_ruleId_key" ON "Rule"("ruleId");

-- CreateIndex
CREATE INDEX "OrgAssessment_userId_idx" ON "OrgAssessment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgAssessmentResult_assessmentId_key" ON "OrgAssessmentResult"("assessmentId");

-- CreateIndex
CREATE INDEX "ProductAssessment_orgAssessmentId_idx" ON "ProductAssessment"("orgAssessmentId");

-- CreateIndex
CREATE INDEX "ProductAssessment_userId_idx" ON "ProductAssessment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAssessmentResult_assessmentId_key" ON "ProductAssessmentResult"("assessmentId");

-- CreateIndex
CREATE INDEX "AISystem_assessmentId_idx" ON "AISystem"("assessmentId");

-- CreateIndex
CREATE INDEX "_ControlNistRefs_B_index" ON "_ControlNistRefs"("B");

-- CreateIndex
CREATE INDEX "_RuleControls_B_index" ON "_RuleControls"("B");

-- AddForeignKey
ALTER TABLE "NistCategory" ADD CONSTRAINT "NistCategory_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "NistFunction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NistSubcategory" ADD CONSTRAINT "NistSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NistCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAssessmentResult" ADD CONSTRAINT "OrgAssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "OrgAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAssessment" ADD CONSTRAINT "ProductAssessment_orgAssessmentId_fkey" FOREIGN KEY ("orgAssessmentId") REFERENCES "OrgAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAssessmentResult" ADD CONSTRAINT "ProductAssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "ProductAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISystem" ADD CONSTRAINT "AISystem_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "OrgAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControlNistRefs" ADD CONSTRAINT "_ControlNistRefs_A_fkey" FOREIGN KEY ("A") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControlNistRefs" ADD CONSTRAINT "_ControlNistRefs_B_fkey" FOREIGN KEY ("B") REFERENCES "NistSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RuleControls" ADD CONSTRAINT "_RuleControls_A_fkey" FOREIGN KEY ("A") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RuleControls" ADD CONSTRAINT "_RuleControls_B_fkey" FOREIGN KEY ("B") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
