"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step1Schema, type Step1Data } from "@/lib/wizard/org-schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Education",
  "Government",
  "Retail/E-Commerce",
  "Manufacturing",
  "Media/Entertainment",
  "Professional Services",
  "Other",
] as const;

const ORG_SIZES = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-500", label: "51-500 employees" },
  { value: "501-5000", label: "501-5,000 employees" },
  { value: "5000+", label: "5,000+ employees" },
] as const;

export default function Step1OrgProfile() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step1 as Step1Data) || {};

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      orgName: existingAnswers.orgName ?? "",
      orgSize: existingAnswers.orgSize ?? "1-50",
      sector: existingAnswers.sector ?? "",
      businessModel: existingAnswers.businessModel ?? "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(1, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="orgName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your organization name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orgSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Size</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {ORG_SIZES.map((size) => (
                    <div key={size.value} className="flex items-center gap-2">
                      <RadioGroupItem value={size.value} id={`orgSize-${size.value}`} />
                      <Label htmlFor={`orgSize-${size.value}`}>{size.label}</Label>
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
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry Sector</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your industry sector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Model (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your business model..."
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
