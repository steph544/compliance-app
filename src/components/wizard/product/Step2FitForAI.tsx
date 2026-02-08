"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep2Schema } from "@/lib/wizard/product-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Step2Data = z.infer<typeof productStep2Schema>;

const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
] as const;

const IMPACT_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

const BUILD_OPTIONS = [
  { value: "build", label: "Build" },
  { value: "integrate", label: "Integrate" },
  { value: "buy", label: "Buy" },
] as const;

export default function Step2FitForAI() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step2 as Step2Data) || {};

  const form = useForm<Step2Data>({
    resolver: zodResolver(productStep2Schema) as any,
    defaultValues: {
      couldSolveWithoutAI: existingAnswers.couldSolveWithoutAI ?? "unsure",
      aiMaterialAdvantage: existingAnswers.aiMaterialAdvantage ?? "unsure",
      machineErrorMoreHarmful: existingAnswers.machineErrorMoreHarmful ?? false,
      worstCaseImpact: existingAnswers.worstCaseImpact ?? "low",
      buildIntegrateBuy: existingAnswers.buildIntegrateBuy ?? "build",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(2, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="couldSolveWithoutAI"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Could this problem be solved without AI?</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {YES_NO_UNSURE.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`couldSolveWithoutAI-${option.value}`}
                      />
                      <Label htmlFor={`couldSolveWithoutAI-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aiMaterialAdvantage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Does AI provide a material advantage over non-AI approaches?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {YES_NO_UNSURE.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`aiMaterialAdvantage-${option.value}`}
                      />
                      <Label htmlFor={`aiMaterialAdvantage-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="machineErrorMoreHarmful"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Machine error more harmful than human error?</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Would an error made by the AI system be more harmful than
                  equivalent human error?
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="worstCaseImpact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Worst-case impact if the system fails</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {IMPACT_LEVELS.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`worstCaseImpact-${option.value}`}
                      />
                      <Label htmlFor={`worstCaseImpact-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buildIntegrateBuy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Build, Integrate, or Buy?</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {BUILD_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`buildIntegrateBuy-${option.value}`}
                      />
                      <Label htmlFor={`buildIntegrateBuy-${option.value}`}>
                        {option.label}
                      </Label>
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
