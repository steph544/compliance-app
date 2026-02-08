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
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/wizard/SectionHeader";
import { cn } from "@/lib/utils";

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

function RadioCardGroup<T extends string>({
  value,
  onChange,
  options,
  namePrefix,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
  namePrefix: string;
  className?: string;
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className={cn("grid gap-2", className)}>
      {options.map((option) => (
        <Label
          key={option.value}
          htmlFor={`${namePrefix}-${option.value}`}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors hover:border-muted-foreground/40",
            value === option.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"
          )}
        >
          <RadioGroupItem value={option.value} id={`${namePrefix}-${option.value}`} />
          <span className="font-medium text-foreground">{option.label}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}

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
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          This step validates fit-for-AI and informs MAP 1.4, MAP 2.1, and MANAGE 2.1 recommendations.
        </p>
        <section className="space-y-5">
          <SectionHeader
            title="Fit-for-AI validation"
            description="Confirm whether AI is the right approach for this problem."
            accentBorder
          />
          <FormField
            control={form.control}
            name="couldSolveWithoutAI"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Could this problem be solved without AI?</FormLabel>
                <FormDescription>
                  Informs governance and control recommendations for this project.
                </FormDescription>
                <FormControl>
                  <RadioCardGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={YES_NO_UNSURE}
                    namePrefix="couldSolveWithoutAI"
                    className="grid-cols-3"
                  />
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
                <FormLabel>Does AI provide a material advantage over non-AI approaches?</FormLabel>
                <FormControl>
                  <RadioCardGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={YES_NO_UNSURE}
                    namePrefix="aiMaterialAdvantage"
                    className="grid-cols-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="machineErrorMoreHarmful"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <FormLabel>Machine error more harmful than human error?</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Would an error made by the AI system be more harmful than equivalent human error?
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-5">
          <SectionHeader
            title="Impact & approach"
            description="Worst-case impact and how you will obtain the system."
          />
          <FormField
            control={form.control}
            name="worstCaseImpact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Worst-case impact if the system fails</FormLabel>
                <FormControl>
                  <RadioCardGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={IMPACT_LEVELS}
                    namePrefix="worstCaseImpact"
                    className="grid-cols-2 sm:grid-cols-4"
                  />
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
                <FormLabel>Build, integrate, or buy?</FormLabel>
                <FormControl>
                  <RadioCardGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={BUILD_OPTIONS}
                    namePrefix="buildIntegrateBuy"
                    className="grid-cols-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
      </form>
    </Form>
  );
}
