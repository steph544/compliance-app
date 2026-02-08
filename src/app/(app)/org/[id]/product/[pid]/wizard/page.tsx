"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { WizardShell } from "@/components/wizard/WizardShell";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productSteps } from "@/lib/wizard/product-steps";
import Step1ProjectOverview from "@/components/wizard/product/Step1ProjectOverview";
import Step2FitForAI from "@/components/wizard/product/Step2FitForAI";
import Step3AISystemDetails from "@/components/wizard/product/Step3AISystemDetails";
import Step4UseCaseImpact from "@/components/wizard/product/Step4UseCaseImpact";
import Step5DataPrivacy from "@/components/wizard/product/Step5DataPrivacy";
import Step6TechnicalArchitecture from "@/components/wizard/product/Step6TechnicalArchitecture";
import Step7RiskThreatLandscape from "@/components/wizard/product/Step7RiskThreatLandscape";
import Step8BaselineMetrics from "@/components/wizard/product/Step8BaselineMetrics";
import Step9ExistingControls from "@/components/wizard/product/Step9ExistingControls";
import Step10ComplianceApproval from "@/components/wizard/product/Step10ComplianceApproval";

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: Step1ProjectOverview,
  2: Step2FitForAI,
  3: Step3AISystemDetails,
  4: Step4UseCaseImpact,
  5: Step5DataPrivacy,
  6: Step6TechnicalArchitecture,
  7: Step7RiskThreatLandscape,
  8: Step8BaselineMetrics,
  9: Step9ExistingControls,
  10: Step10ComplianceApproval,
};

export default function ProductWizardPage() {
  const params = useParams<{ id: string; pid: string }>();
  const router = useRouter();
  const { setAllAnswers, setTotalSteps, currentStep, reset } =
    useWizardStore();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { id, pid } = params;

  useEffect(() => {
    reset();
    setTotalSteps(productSteps.length);

    async function fetchProduct() {
      try {
        const res = await fetch(
          `/api/org-assessments/${id}/products/${pid}`,
        );
        if (!res.ok) throw new Error("Failed to fetch product assessment");
        const data = await res.json();
        if (data.answers && typeof data.answers === "object") {
          setAllAnswers(data.answers as Record<string, unknown>);
        }
      } catch (error) {
        console.error("Error fetching product assessment:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, pid, setAllAnswers, setTotalSteps, reset]);

  const handleSaveStep = useCallback(
    async (step: number, data: Record<string, unknown>) => {
      setIsSaving(true);
      try {
        const currentAnswers = useWizardStore.getState().answers;
        const updatedAnswers = { ...currentAnswers, [`step${step}`]: data };

        await fetch(`/api/org-assessments/${id}/products/${pid}`, {
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
    [id, pid],
  );

  const handleComplete = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/org-assessments/${id}/products/${pid}/compute`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error("Failed to compute results");
      router.push(`/org/${id}/product/${pid}/results`);
    } catch (error) {
      console.error("Error computing results:", error);
    } finally {
      setIsSaving(false);
    }
  }, [id, pid, router]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading product assessment...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <WizardShell
        steps={productSteps}
        onComplete={handleComplete}
        onSaveStep={handleSaveStep}
        isSaving={isSaving}
      >
        {(() => {
          const StepComponent = STEP_COMPONENTS[currentStep];
          return StepComponent ? <StepComponent /> : null;
        })()}
      </WizardShell>
    </div>
  );
}
