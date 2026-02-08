"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step5Schema, type Step5Data } from "@/lib/wizard/org-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DATA_TYPES = [
  { name: "pii" as const, label: "Personally Identifiable Information (PII)" },
  { name: "phi" as const, label: "Protected Health Information (PHI)" },
  { name: "pci" as const, label: "Payment Card Industry (PCI) data" },
  { name: "biometric" as const, label: "Biometric data" },
  { name: "childrenData" as const, label: "Children's data (under 13)" },
  { name: "retentionNeeds" as const, label: "Data retention requirements" },
  { name: "multiTenant" as const, label: "Multi-tenant data environment" },
] as const;

export default function Step5DataPosture() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step5 as Step5Data) || {};

  const form = useForm<Step5Data>({
    resolver: zodResolver(step5Schema) as any,
    defaultValues: {
      pii: existingAnswers.pii ?? false,
      phi: existingAnswers.phi ?? false,
      pci: existingAnswers.pci ?? false,
      biometric: existingAnswers.biometric ?? false,
      childrenData: existingAnswers.childrenData ?? false,
      retentionNeeds: existingAnswers.retentionNeeds ?? false,
      multiTenant: existingAnswers.multiTenant ?? false,
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
        <p className="text-sm text-muted-foreground">
          Data types drive privacy and security control recommendations and NIST mapping.
        </p>
        <section className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            Data Sensitivity Profile
          </h3>
          <FormDescription>
            Select all data types and considerations that apply to your organization. Used to tailor data governance and evidence requirements.
          </FormDescription>
        <div className="grid gap-4">
          {DATA_TYPES.map((dataType) => (
            <FormField
              key={dataType.name}
              control={form.control}
              name={dataType.name}
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label className="font-normal">{dataType.label}</Label>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        </section>
      </form>
    </Form>
  );
}
