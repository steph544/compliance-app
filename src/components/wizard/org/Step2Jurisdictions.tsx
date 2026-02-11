"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step2Schema, type Step2Data } from "@/lib/wizard/org-schema";
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

const COUNTRIES = [
  { value: "United States", label: "United States" },
  { value: "EU", label: "European Union (EU)" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Japan", label: "Japan" },
  { value: "India", label: "India" },
  { value: "Brazil", label: "Brazil" },
  { value: "Other", label: "Other" },
] as const;

const US_STATES = [
  { value: "California", label: "California" },
  { value: "New York", label: "New York" },
  { value: "Illinois", label: "Illinois" },
  { value: "Texas", label: "Texas" },
  { value: "Virginia", label: "Virginia" },
  { value: "Colorado", label: "Colorado" },
  { value: "Connecticut", label: "Connecticut" },
  { value: "Other", label: "Other" },
] as const;

export default function Step2Jurisdictions() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step2 as Step2Data) || {};

  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema) as any,
    defaultValues: {
      countries: existingAnswers.countries ?? [],
      usStates: existingAnswers.usStates ?? [],
    },
  });

  const selectedCountries = form.watch("countries") ?? [];
  const showUsStates = selectedCountries.includes("United States");

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(2, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  // Clear US states if US is deselected
  useEffect(() => {
    if (!showUsStates) {
      form.setValue("usStates", []);
    }
  }, [showUsStates, form]);

  return (
    <Form {...form}>
      <form className="w-full min-w-0 space-y-6">
        <p className="text-sm text-muted-foreground">
          This step informs jurisdiction-specific controls and compliance mapping.
        </p>
        <section className="w-full min-w-0 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            Operating jurisdictions
          </h3>
        <FormField
          control={form.control}
          name="countries"
          render={() => (
            <FormItem>
              <FormLabel>Operating Jurisdictions</FormLabel>
              <FormDescription>
                Select all countries or regions where your organization operates. Used to tailor regulatory expectations and control recommendations.
              </FormDescription>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {COUNTRIES.map((country) => (
                  <FormField
                    key={country.value}
                    control={form.control}
                    name="countries"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(country.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              if (checked) {
                                field.onChange([...current, country.value]);
                              } else {
                                field.onChange(
                                  current.filter((v: string) => v !== country.value)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Label className="font-normal">{country.label}</Label>
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

        {showUsStates && (
          <section className="w-full min-w-0 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
              U.S. state jurisdictions
            </h3>
          <FormField
            control={form.control}
            name="usStates"
            render={() => (
              <FormItem>
                <FormLabel>U.S. State Jurisdictions</FormLabel>
                <FormDescription>
                  Select the U.S. states with specific AI or data privacy regulations
                  relevant to your operations. Informs state-level compliance and control selection.
                </FormDescription>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {US_STATES.map((state) => (
                    <FormField
                      key={state.value}
                      control={form.control}
                      name="usStates"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(state.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? [];
                                if (checked) {
                                  field.onChange([...current, state.value]);
                                } else {
                                  field.onChange(
                                    current.filter((v: string) => v !== state.value)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <Label className="font-normal">{state.label}</Label>
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
        )}
      </form>
    </Form>
  );
}
