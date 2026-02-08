"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep5Schema } from "@/lib/wizard/product-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Step5Data = z.infer<typeof productStep5Schema>;

const DATA_TYPES = [
  { value: "PII", label: "Personally Identifiable Information (PII)" },
  { value: "PHI", label: "Protected Health Information (PHI)" },
  { value: "PCI", label: "Payment Card Industry (PCI) data" },
  { value: "biometric", label: "Biometric data" },
  { value: "financial", label: "Financial data" },
  { value: "behavioral", label: "Behavioral data" },
] as const;

const CONSENT_MECHANISMS = [
  { value: "consent", label: "Consent" },
  { value: "contract", label: "Contract" },
  { value: "legitimate_interest", label: "Legitimate interest" },
] as const;

export default function Step5DataPrivacy() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step5 as Step5Data) || {};

  const form = useForm<Step5Data>({
    resolver: zodResolver(productStep5Schema) as any,
    defaultValues: {
      dataTypes: existingAnswers.dataTypes ?? [],
      dataSources: existingAnswers.dataSources ?? [],
      lawfulBasis: existingAnswers.lawfulBasis ?? "",
      crossBorderDataFlows: existingAnswers.crossBorderDataFlows ?? false,
      dataResidency: existingAnswers.dataResidency ?? "",
      dataRetention: existingAnswers.dataRetention ?? "",
      consentMechanisms: existingAnswers.consentMechanisms ?? "",
      anonymization: existingAnswers.anonymization ?? "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(5, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="dataTypes"
          render={() => (
            <FormItem>
              <FormLabel>Data Types</FormLabel>
              <p className="text-sm text-muted-foreground">
                Select all data types processed by this AI system.
              </p>
              <div className="grid gap-4 mt-2">
                {DATA_TYPES.map((dataType) => (
                  <FormField
                    key={dataType.value}
                    control={form.control}
                    name="dataTypes"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(dataType.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              if (checked) {
                                field.onChange([...current, dataType.value]);
                              } else {
                                field.onChange(
                                  current.filter(
                                    (v: string) => v !== dataType.value
                                  )
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Label className="font-normal">{dataType.label}</Label>
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
          name="crossBorderDataFlows"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Cross-border data flows</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Does this system transfer data across national borders?
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
          name="dataRetention"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Retention Period</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 90 days, 1 year, indefinite"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentMechanisms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consent Mechanism</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {CONSENT_MECHANISMS.map((mechanism) => (
                    <div
                      key={mechanism.value}
                      className="flex items-center gap-2"
                    >
                      <RadioGroupItem
                        value={mechanism.value}
                        id={`consentMechanisms-${mechanism.value}`}
                      />
                      <Label
                        htmlFor={`consentMechanisms-${mechanism.value}`}
                      >
                        {mechanism.label}
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
          name="anonymization"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Data anonymization / pseudonymization</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Is data anonymized or pseudonymized before processing?
                </p>
              </div>
              <FormControl>
                <Input
                  placeholder="Describe anonymization approach..."
                  className="max-w-sm"
                  {...field}
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
