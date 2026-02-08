"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step8Schema, type Step8Data } from "@/lib/wizard/org-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const GOVERNANCE_FIELDS = [
  {
    name: "securityProgram" as const,
    label: "Formal security program",
    description: "An established information security program with policies and controls",
  },
  {
    name: "privacyProgram" as const,
    label: "Formal privacy program",
    description: "A dedicated data privacy program with defined practices",
  },
  {
    name: "modelInventory" as const,
    label: "AI model inventory/registry",
    description: "A catalog or registry tracking AI models in use across the organization",
  },
  {
    name: "incidentResponse" as const,
    label: "Incident response plan",
    description: "A documented plan for responding to AI-related incidents",
  },
  {
    name: "sdlcControls" as const,
    label: "SDLC security controls",
    description: "Security controls integrated into your software development lifecycle",
  },
] as const;

export default function Step8ExistingGovernance() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step8 as Step8Data) || {};

  const form = useForm<Step8Data>({
    resolver: zodResolver(step8Schema) as any,
    defaultValues: {
      securityProgram: existingAnswers.securityProgram ?? false,
      privacyProgram: existingAnswers.privacyProgram ?? false,
      modelInventory: existingAnswers.modelInventory ?? false,
      incidentResponse: existingAnswers.incidentResponse ?? false,
      sdlcControls: existingAnswers.sdlcControls ?? false,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(8, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-1">Existing Governance Controls</h3>
          <p className="text-sm text-muted-foreground">
            Indicate which governance programs and controls your organization currently
            has in place.
          </p>
        </div>

        <div className="grid gap-4">
          {GOVERNANCE_FIELDS.map((govField) => (
            <FormField
              key={govField.name}
              control={form.control}
              name={govField.name}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{govField.label}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {govField.description}
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
          ))}
        </div>
      </form>
    </Form>
  );
}
