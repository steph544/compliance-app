"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import type { SectionTracking } from "@/lib/governance-implementation/types";

interface StepMeta {
  id: number;
  key: string;
  title: string;
  description: string;
  nistMapping: string;
}

interface ImplementationShellProps {
  steps: StepMeta[];
  children: React.ReactNode;
  onComplete: () => void;
  onSaveStep: (step: number) => Promise<void>;
  isSaving?: boolean;
}

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-300",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
};

export function ImplementationShell({
  steps,
  children,
  onComplete,
  onSaveStep,
  isSaving = false,
}: ImplementationShellProps) {
  const { currentStep, setCurrentStep, nextStep, prevStep, sections } =
    useImplementationStore();
  const totalSteps = steps.length;
  const completedCount = sections.filter(
    (s: SectionTracking) => s.status === "COMPLETED"
  ).length;
  const progressPercent = (completedCount / totalSteps) * 100;
  const currentStepMeta = steps[currentStep - 1];
  const isLastStep = currentStep === totalSteps;

  const handleNext = async () => {
    await onSaveStep(currentStep);
    if (isLastStep) {
      onComplete();
    } else {
      nextStep();
    }
  };

  const handleStepClick = async (stepId: number) => {
    if (stepId === currentStep) return;
    await onSaveStep(currentStep);
    setCurrentStep(stepId);
  };

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>
            {completedCount} of {totalSteps} sections completed
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{currentStepMeta?.title}</h2>
        <p className="mt-1 text-muted-foreground">
          {currentStepMeta?.description}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          NIST AI RMF: {currentStepMeta?.nistMapping}
        </p>
      </div>

      {/* Step content */}
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={async () => {
            await onSaveStep(currentStep);
            prevStep();
          }}
          disabled={currentStep === 1 || isSaving}
        >
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : isLastStep
              ? "Finalize Implementation Plan"
              : "Save & Next"}
        </Button>
      </div>

      {/* Step indicators */}
      <div className="mt-8 flex justify-center gap-2">
        {steps.map((step, i) => {
          const section = sections[i];
          const statusColor = section
            ? statusColors[section.status] ?? "bg-gray-300"
            : "bg-gray-300";
          const isActive = step.id === currentStep;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`h-3 w-3 rounded-full transition-all ${statusColor} ${
                isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
              title={`${step.title} (${section?.status ?? "NOT_STARTED"})`}
            />
          );
        })}
      </div>
    </div>
  );
}
