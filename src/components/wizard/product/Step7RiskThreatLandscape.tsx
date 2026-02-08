"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep7Schema } from "@/lib/wizard/product-schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Step7Data = z.infer<typeof productStep7Schema>;

const HALLUCINATION_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

const BIAS_CATEGORIES = [
  { value: "gender", label: "Gender bias" },
  { value: "race", label: "Racial / ethnic bias" },
  { value: "age", label: "Age bias" },
  { value: "disability", label: "Disability bias" },
  { value: "other", label: "Other" },
] as const;

export default function Step7RiskThreatLandscape() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step7 as Step7Data) || {};

  const form = useForm<Step7Data>({
    resolver: zodResolver(productStep7Schema) as any,
    defaultValues: {
      promptInjectionExposure:
        existingAnswers.promptInjectionExposure ?? false,
      hallucinationRisk: existingAnswers.hallucinationRisk ?? "low",
      biasRiskCategories: existingAnswers.biasRiskCategories ?? [],
      adversarialAttackSurface:
        existingAnswers.adversarialAttackSurface ?? "",
      dataPoisoningRisk: existingAnswers.dataPoisoningRisk ?? false,
      ipConfidentialityConcerns:
        existingAnswers.ipConfidentialityConcerns ?? false,
      regulatoryRisks: existingAnswers.regulatoryRisks ?? [],
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(7, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="promptInjectionExposure"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Prompt injection exposure</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Is the system exposed to prompt injection attacks from user
                  inputs?
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
          name="hallucinationRisk"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hallucination Risk</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {HALLUCINATION_LEVELS.map((level) => (
                    <div key={level.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={level.value}
                        id={`hallucinationRisk-${level.value}`}
                      />
                      <Label htmlFor={`hallucinationRisk-${level.value}`}>
                        {level.label}
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
          name="biasRiskCategories"
          render={() => (
            <FormItem>
              <FormLabel>Bias Risk Categories</FormLabel>
              <p className="text-sm text-muted-foreground">
                Select all bias categories that may apply to this system.
              </p>
              <div className="grid gap-4 mt-2">
                {BIAS_CATEGORIES.map((category) => (
                  <FormField
                    key={category.value}
                    control={form.control}
                    name="biasRiskCategories"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(category.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              if (checked) {
                                field.onChange([...current, category.value]);
                              } else {
                                field.onChange(
                                  current.filter(
                                    (v: string) => v !== category.value
                                  )
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Label className="font-normal">
                          {category.label}
                        </Label>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataPoisoningRisk"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Data poisoning risk</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Could training data be manipulated or poisoned by malicious
                  actors?
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
          name="ipConfidentialityConcerns"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>IP / confidentiality concerns</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Are there intellectual property or data confidentiality
                  concerns with this system?
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
      </form>
    </Form>
  );
}
