"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { WizardShell } from "@/components/wizard/WizardShell";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { orgSteps } from "@/lib/wizard/org-steps";

import Step1OrgProfile from "@/components/wizard/org/Step1OrgProfile";
import Step2Jurisdictions from "@/components/wizard/org/Step2Jurisdictions";
import Step3AIMaturity from "@/components/wizard/org/Step3AIMaturity";
import Step4RiskTolerance from "@/components/wizard/org/Step4RiskTolerance";
import Step5DataPosture from "@/components/wizard/org/Step5DataPosture";
import Step6AIUsage from "@/components/wizard/org/Step6AIUsage";
import Step7VendorInfra from "@/components/wizard/org/Step7VendorInfra";
import Step8ExistingGovernance from "@/components/wizard/org/Step8ExistingGovernance";
import Step9StakeholderEngagement from "@/components/wizard/org/Step9StakeholderEngagement";

const stepComponents: Record<number, React.ComponentType> = {
  1: Step1OrgProfile,
  2: Step2Jurisdictions,
  3: Step3AIMaturity,
  4: Step4RiskTolerance,
  5: Step5DataPosture,
  6: Step6AIUsage,
  7: Step7VendorInfra,
  8: Step8ExistingGovernance,
  9: Step9StakeholderEngagement,
};

export default function OrgWizardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { setAllAnswers, setTotalSteps, currentStep, reset } =
    useWizardStore();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const id = params.id;

  useEffect(() => {
    reset();
    setTotalSteps(orgSteps.length);

    async function fetchAssessment() {
      try {
        const res = await fetch(`/api/org-assessments/${id}`);
        if (!res.ok) throw new Error("Failed to fetch assessment");
        const data = await res.json();
        if (data.answers && typeof data.answers === "object") {
          setAllAnswers(data.answers as Record<string, unknown>);
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [id, setAllAnswers, setTotalSteps, reset]);

  const handleSaveStep = useCallback(
    async (step: number, data: Record<string, unknown>) => {
      setIsSaving(true);
      try {
        const currentAnswers = useWizardStore.getState().answers;
        const updatedAnswers = { ...currentAnswers, [`step${step}`]: data };

        await fetch(`/api/org-assessments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: updatedAnswers }),
        });
      } catch (error) {
        console.error("Error saving step:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [id],
  );

  const handleComplete = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/org-assessments/${id}/compute`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to compute results");
      router.push(`/org/${id}/results`);
    } catch (error) {
      console.error("Error computing results:", error);
    } finally {
      setIsSaving(false);
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading assessment...</p>
      </div>
    );
  }

  const StepComponent = stepComponents[currentStep];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <WizardShell
        steps={orgSteps}
        onComplete={handleComplete}
        onSaveStep={handleSaveStep}
        isSaving={isSaving}
      >
        {StepComponent ? <StepComponent /> : null}
      </WizardShell>
    </div>
  );
}
