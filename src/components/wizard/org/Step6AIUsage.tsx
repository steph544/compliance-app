"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step6Schema, type Step6Data } from "@/lib/wizard/org-schema";
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

const AI_USAGE_OPTIONS = [
  { value: "internal_only", label: "Internal use only" },
  { value: "customer_facing", label: "Customer-facing applications" },
  { value: "decision_support", label: "Decision support for humans" },
  { value: "automated_decisions", label: "Automated decision-making" },
] as const;

export default function Step6AIUsage() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step6 as Step6Data) || {};

  const form = useForm<Step6Data>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      aiUsage: existingAnswers.aiUsage ?? [],
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(6, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <p className="text-sm text-muted-foreground">
          How you use AI influences risk tier, control selection, and governance focus.
        </p>
        <section className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            AI Usage Types
          </h3>
        <FormField
          control={form.control}
          name="aiUsage"
          render={() => (
            <FormItem>
              <FormLabel>AI Usage Types</FormLabel>
              <FormDescription>
                Select all the ways your organization uses or plans to use AI. Informs risk scoring and NIST-aligned controls.
              </FormDescription>
              <div className="grid gap-4 mt-2">
                {AI_USAGE_OPTIONS.map((option) => (
                  <FormField
                    key={option.value}
                    control={form.control}
                    name="aiUsage"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              if (checked) {
                                field.onChange([...current, option.value]);
                              } else {
                                field.onChange(
                                  current.filter((v: string) => v !== option.value)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Label className="font-normal">{option.label}</Label>
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
      </form>
    </Form>
  );
}
