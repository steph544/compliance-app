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
import { SectionHeader } from "@/components/wizard/SectionHeader";
import { cn } from "@/lib/utils";

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
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Data and privacy inform MEASURE 2.2, MAP 2.3, MANAGE 2.2 and control recommendations.
        </p>
        <section className="space-y-5">
          <SectionHeader
            title="Data types"
            description="Select all data types processed by this AI system."
            accentBorder
          />
          <FormField
            control={form.control}
            name="dataTypes"
            render={() => (
              <FormItem>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DATA_TYPES.map((dataType) => (
                    <FormField
                      key={dataType.value}
                      control={form.control}
                      name="dataTypes"
                      render={({ field }) => (
                        <FormItem
                          className={cn(
                            "flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors border-border bg-muted/20",
                            field.value?.includes(dataType.value) && "border-primary bg-primary/5"
                          )}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(dataType.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? [];
                                if (checked) field.onChange([...current, dataType.value]);
                                else field.onChange(current.filter((v: string) => v !== dataType.value));
                              }}
                            />
                          </FormControl>
                          <Label className="cursor-pointer font-normal">{dataType.label}</Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-5">
          <SectionHeader
            title="Data handling"
            description="Cross-border flows, retention, and consent."
          />
          <FormField
            control={form.control}
            name="crossBorderDataFlows"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <FormLabel>Cross-border data flows</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Does this system transfer data across national borders?
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                <FormLabel>Data retention period</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 90 days, 1 year, indefinite" {...field} />
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
                <FormLabel>Consent mechanism</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2 sm:grid-cols-3">
                    {CONSENT_MECHANISMS.map((mechanism) => (
                      <Label
                        key={mechanism.value}
                        htmlFor={`consentMechanisms-${mechanism.value}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors hover:border-muted-foreground/40",
                          field.value === mechanism.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        )}
                      >
                        <RadioGroupItem value={mechanism.value} id={`consentMechanisms-${mechanism.value}`} />
                        <span className="font-medium text-foreground">{mechanism.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-5">
          <SectionHeader
            title="Anonymization"
            description="How data is anonymized or pseudonymized before processing."
          />
          <FormField
            control={form.control}
            name="anonymization"
            render={({ field }) => (
              <FormItem className="rounded-lg border border-border bg-muted/20 p-4">
                <FormLabel>Data anonymization / pseudonymization</FormLabel>
                <p className="mt-0.5 text-xs text-muted-foreground mb-3">
                  Is data anonymized or pseudonymized before processing?
                </p>
                <FormControl>
                  <Input placeholder="Describe anonymization approach..." {...field} />
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
