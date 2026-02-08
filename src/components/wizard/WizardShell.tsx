"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useWizardStore } from "@/lib/wizard/wizard-store";

interface StepMeta {
  id: number;
  title: string;
  description: string;
  nistMapping: string;
  phase?: string;
}

interface WizardShellProps {
  steps: StepMeta[];
  children: React.ReactNode;
  onComplete: () => void;
  onSaveStep: (step: number, data: Record<string, unknown>) => Promise<void>;
  isSaving?: boolean;
  /** Optional phase label (e.g. "Map", "Measure", "Manage") for product wizard. */
  phaseLabel?: string;
}

export function WizardShell({
  steps,
  children,
  onComplete,
  onSaveStep,
  isSaving = false,
  phaseLabel,
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
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progressPercent)}% complete</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-muted" />
      </div>

      {/* Step header */}
      <div className="mb-6 border-l-2 border-accent-primary pl-4">
        {phaseLabel && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Phase: {phaseLabel}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {currentStepMeta?.title}
        </h2>
        <p className="mt-1.5 text-muted-foreground">
          {currentStepMeta?.description}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground/80">
            NIST AI RMF: {currentStepMeta?.nistMapping}
          </p>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex text-muted-foreground/80 hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label="Why we ask this"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs text-xs">
                These NIST AI RMF subcategories guide how we tailor your governance profile and control recommendations. Your answers inform which controls and evidence matter for compliance.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          This step supports the framework areas above; your answers inform governance and control selection.
        </p>
      </div>

      {/* Step content */}
      <div className="transition-card hover-lift mb-8 rounded-xl border border-border bg-card px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSaving}
          className="min-w-[100px]"
        >
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isSaving} className="min-w-[100px]">
          {isSaving ? "Saving…" : isLastStep ? "Complete Assessment" : "Next"}
        </Button>
      </div>

      {/* Step indicators */}
      <div className="mt-8 flex justify-center gap-1.5">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => useWizardStore.getState().setCurrentStep(step.id)}
            className={`h-2 w-2 rounded-full transition-colors ${
              step.id === currentStep
                ? "bg-accent-primary ring-2 ring-accent-primary/30 ring-offset-2 ring-offset-background"
                : step.id < currentStep
                  ? "bg-accent-primary/60 hover:bg-accent-primary/80"
                  : "bg-muted-foreground/25 hover:bg-muted-foreground/40"
            }`}
            title={step.title}
            aria-label={`Step ${step.id}: ${step.title}`}
          />
        ))}
      </div>
    </div>
  );
}
