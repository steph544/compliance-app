"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step9Schema, type Step9Data } from "@/lib/wizard/org-schema";
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

const IMPACT_OPTIONS = [
  {
    value: "never",
    label: "Never",
    description: "No impact assessments are performed",
  },
  {
    value: "ad_hoc",
    label: "Ad Hoc",
    description: "Impact assessments are performed occasionally, as needed",
  },
  {
    value: "systematic",
    label: "Systematic",
    description: "Impact assessments are performed systematically for all AI projects",
  },
] as const;

const ENGAGEMENT_OPTIONS = [
  {
    value: "never",
    label: "Never",
    description: "No external stakeholder engagement on AI matters",
  },
  {
    value: "sometimes",
    label: "Sometimes",
    description: "Occasional engagement with external stakeholders",
  },
  {
    value: "regularly",
    label: "Regularly",
    description: "Regular, structured engagement with external stakeholders",
  },
] as const;

export default function Step9StakeholderEngagement() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step9 as Step9Data) || {};

  const form = useForm<Step9Data>({
    resolver: zodResolver(step9Schema) as any,
    defaultValues: {
      impactAssessments: existingAnswers.impactAssessments ?? "never",
      externalEngagement: existingAnswers.externalEngagement ?? "never",
      recourseMechanisms: existingAnswers.recourseMechanisms ?? false,
      publishedPrinciples: existingAnswers.publishedPrinciples ?? false,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(9, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="impactAssessments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact Assessments</FormLabel>
              <p className="text-sm text-muted-foreground">
                How does your organization conduct AI impact assessments?
              </p>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 mt-2"
                >
                  {IMPACT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`impact-${option.value}`}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={`impact-${option.value}`}
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

        <FormField
          control={form.control}
          name="externalEngagement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External Stakeholder Engagement</FormLabel>
              <p className="text-sm text-muted-foreground">
                How often does your organization engage with external stakeholders on AI
                governance?
              </p>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 mt-2"
                >
                  {ENGAGEMENT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`engagement-${option.value}`}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={`engagement-${option.value}`}
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

        <FormField
          control={form.control}
          name="recourseMechanisms"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Recourse Mechanisms</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Does your organization provide mechanisms for individuals to challenge
                  AI-driven decisions?
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
          name="publishedPrinciples"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Published AI Principles</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Has your organization published AI ethics principles or guidelines?
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
