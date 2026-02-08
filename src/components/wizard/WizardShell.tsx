"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWizardStore } from "@/lib/wizard/wizard-store";

interface StepMeta {
  id: number;
  title: string;
  description: string;
  nistMapping: string;
}

interface WizardShellProps {
  steps: StepMeta[];
  children: React.ReactNode;
  onComplete: () => void;
  onSaveStep: (step: number, data: Record<string, unknown>) => Promise<void>;
  isSaving?: boolean;
}

export function WizardShell({
  steps,
  children,
  onComplete,
  onSaveStep,
  isSaving = false,
}: WizardShellProps) {
  const { currentStep, nextStep, prevStep, answers } = useWizardStore();
  const totalSteps = steps.length;
  const progressPercent = (currentStep / totalSteps) * 100;
  const currentStepMeta = steps[currentStep - 1];
  const isLastStep = currentStep === totalSteps;

  const handleNext = async () => {
    const stepAnswers = answers[`step${currentStep}`] as Record<string, unknown> | undefined;
    if (stepAnswers) {
      await onSaveStep(currentStep, stepAnswers);
    }
    if (isLastStep) {
      onComplete();
    } else {
      nextStep();
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progressPercent)}% complete</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {currentStepMeta?.title}
        </h2>
        <p className="mt-1 text-gray-500">{currentStepMeta?.description}</p>
        <p className="mt-1 text-xs text-gray-400">
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
          onClick={prevStep}
          disabled={currentStep === 1 || isSaving}
        >
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isSaving}>
          {isSaving ? "Saving..." : isLastStep ? "Complete Assessment" : "Next"}
        </Button>
      </div>

      {/* Step indicators */}
      <div className="mt-8 flex justify-center gap-2">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => useWizardStore.getState().setCurrentStep(step.id)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              step.id === currentStep
                ? "bg-blue-600"
                : step.id < currentStep
                  ? "bg-blue-300"
                  : "bg-gray-200"
            }`}
            title={step.title}
          />
        ))}
      </div>
    </div>
  );
}
