"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step4Schema, type Step4Data } from "@/lib/wizard/org-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { SelectableOptionTiles } from "@/components/wizard/SelectableOptionTiles";
import { Slider } from "@/components/ui/slider";

const TOLERANCE_OPTIONS = [
  {
    value: "low",
    label: "Low",
    description: "Minimal risk appetite; prioritize compliance and safety above all",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced approach; accept moderate risk with proper controls",
  },
  {
    value: "high",
    label: "High",
    description: "Higher risk appetite; prioritize innovation and speed to market",
  },
] as const;

const SLIDER_FIELDS = [
  { name: "financial" as const, label: "Financial Risk" },
  { name: "operational" as const, label: "Operational Risk" },
  { name: "safetyWellbeing" as const, label: "Safety & Wellbeing Risk" },
  { name: "reputational" as const, label: "Reputational Risk" },
] as const;

export default function Step4RiskTolerance() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step4 as Step4Data) || {};

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      overallTolerance: existingAnswers.overallTolerance ?? "medium",
      financial: existingAnswers.financial ?? 3,
      operational: existingAnswers.operational ?? 3,
      safetyWellbeing: existingAnswers.safetyWellbeing ?? 3,
      reputational: existingAnswers.reputational ?? 3,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(4, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="w-full min-w-0 space-y-8">
        <p className="text-sm text-muted-foreground">
          Risk tolerance shapes control selection and governance rigor. Your answers inform NIST-aligned recommendations.
        </p>
        <section className="w-full min-w-0 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2 mb-2">
            Overall Risk Tolerance
          </h3>
        <FormField
          control={form.control}
          name="overallTolerance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Risk Tolerance</FormLabel>
              <FormDescription>
                Drives governance and control recommendations; higher tolerance may allow more optional controls.
              </FormDescription>
              <FormControl>
                <SelectableOptionTiles
                  options={TOLERANCE_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                    description: o.description,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  gridCols="3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </section>

        <section className="w-full min-w-0 space-y-6 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            Risk Category Tolerances
          </h3>
          <FormDescription>
            Rate your tolerance for each risk category from 1 (very low) to 5 (very
            high). Used to refine risk scoring and control prioritization.
          </FormDescription>

          {SLIDER_FIELDS.map((sliderField) => (
            <FormField
              key={sliderField.name}
              control={form.control}
              name={sliderField.name}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{sliderField.label}</FormLabel>
                    <span className="text-sm font-medium tabular-nums">
                      {field.value} / 5
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </section>
      </form>
    </Form>
  );
}
