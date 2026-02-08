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
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

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
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="overallTolerance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Risk Tolerance</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 mt-2"
                >
                  {TOLERANCE_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`tolerance-${option.value}`}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={`tolerance-${option.value}`}
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

        <div className="space-y-6">
          <h3 className="text-sm font-medium">Risk Category Tolerances</h3>
          <p className="text-sm text-muted-foreground">
            Rate your tolerance for each risk category from 1 (very low) to 5 (very
            high).
          </p>

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
        </div>
      </form>
    </Form>
  );
}
