"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step3Schema, type Step3Data } from "@/lib/wizard/org-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const MATURITY_OPTIONS = [
  {
    value: "none",
    label: "No AI in Use",
    description: "No AI in use",
  },
  {
    value: "pilots",
    label: "Pilots / Experiments",
    description: "Running AI pilots/experiments",
  },
  {
    value: "production",
    label: "Production",
    description: "AI systems in production",
  },
  {
    value: "enterprise",
    label: "Enterprise-wide",
    description: "Enterprise-wide AI deployment",
  },
] as const;

export default function Step3AIMaturity() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step3 as Step3Data) || {};

  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      maturityStage: existingAnswers.maturityStage ?? "none",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(3, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="maturityStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Maturity Stage</FormLabel>
              <p className="text-sm text-muted-foreground">
                Select the stage that best describes your organization&apos;s current AI
                adoption level.
              </p>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 mt-2"
                >
                  {MATURITY_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`maturity-${option.value}`}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={`maturity-${option.value}`}
                          className="font-medium"
                        >
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
