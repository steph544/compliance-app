"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { implementationSteps } from "@/lib/governance-implementation/steps";
import type { SectionTracking } from "@/lib/governance-implementation/types";
import { ImplementationShell } from "./ImplementationShell";
import { ImplementationProgressDashboard } from "./ImplementationProgressDashboard";
import { ThreeLoDStep } from "./steps/ThreeLoDStep";
import { RolesStep } from "./steps/RolesStep";
import { CommitteesStep } from "./steps/CommitteesStep";
import { DecisionRightsStep } from "./steps/DecisionRightsStep";
import { ReviewCadenceStep } from "./steps/ReviewCadenceStep";
import { HumanAiPatternsStep } from "./steps/HumanAiPatternsStep";
import { WhistleblowerStep } from "./steps/WhistleblowerStep";
import { EscalationStep } from "./steps/EscalationStep";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ImplementationWalkthroughProps {
  assessmentId: string;
  blueprint: Record<string, unknown>;
}

export function ImplementationWalkthrough({
  assessmentId,
  blueprint,
}: ImplementationWalkthroughProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    currentStep,
    setCurrentStep,
    sections,
    setSections,
    setImplementationId,
    reset,
  } = useImplementationStore();

  // Load implementation data
  useEffect(() => {
    reset();
    const load = async () => {
      try {
        const res = await fetch(
          `/api/org-assessments/${assessmentId}/governance`
        );
        if (!res.ok) return;
        const data = await res.json();
        setImplementationId(data.id);
        if (data.sections && Array.isArray(data.sections)) {
          setSections(data.sections as SectionTracking[]);
        }
        if (data.currentStep) {
          setCurrentStep(data.currentStep);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  const handleSaveStep = useCallback(
    async (step: number) => {
      setIsSaving(true);
      try {
        const sectionIndex = step - 1;
        const section = sections[sectionIndex];
        if (!section) return;

        await fetch(`/api/org-assessments/${assessmentId}/governance`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionIndex,
            section,
            currentStep: step,
          }),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [assessmentId, sections]
  );

  const handleComplete = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save the last step first
      await handleSaveStep(currentStep);

      // Finalize
      await fetch(`/api/org-assessments/${assessmentId}/governance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      router.push(`/org/${assessmentId}/results`);
    } finally {
      setIsSaving(false);
    }
  }, [assessmentId, currentStep, handleSaveStep, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground mx-auto" />
          <p className="text-muted-foreground">Loading implementation plan...</p>
        </div>
      </div>
    );
  }

  const stepComponents: Record<number, React.ReactNode> = {
    1: <ThreeLoDStep blueprint={blueprint as any} />,
    2: <RolesStep blueprint={blueprint as any} />,
    3: <CommitteesStep blueprint={blueprint as any} />,
    4: <DecisionRightsStep blueprint={blueprint as any} />,
    5: <ReviewCadenceStep blueprint={blueprint as any} />,
    6: <HumanAiPatternsStep blueprint={blueprint as any} />,
    7: <WhistleblowerStep blueprint={blueprint as any} />,
    8: <EscalationStep blueprint={blueprint as any} />,
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href={`/org/${assessmentId}/results`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Governance Implementation</h1>
        <p className="text-muted-foreground mt-1">
          Walk through each section of your governance blueprint and assign real
          people, dates, and implementation details.
        </p>
      </div>

      <ImplementationProgressDashboard sections={sections} />

      <ImplementationShell
        steps={implementationSteps}
        onComplete={handleComplete}
        onSaveStep={handleSaveStep}
        isSaving={isSaving}
      >
        {stepComponents[currentStep]}
      </ImplementationShell>
    </div>
  );
}
