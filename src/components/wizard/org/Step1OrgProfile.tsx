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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

const BUSINESS_CONTEXT_OPTIONS = [
  { value: "internal_ops", label: "Internal operations & efficiency" },
  { value: "customer_facing", label: "Customer-facing products or services" },
  { value: "regulated_products", label: "Regulated products or high-stakes decisions" },
  { value: "research_innovation", label: "Research & innovation" },
  { value: "other", label: "Other" },
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
      missionOrObjectives: existingAnswers.missionOrObjectives ?? "",
      goalsForAI: existingAnswers.goalsForAI ?? "",
      primaryBusinessContextForAI: existingAnswers.primaryBusinessContextForAI ?? "",
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
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          This information shapes your governance blueprint, risk tier, and NIST-aligned recommendations.
        </p>

        {/* Organization identity */}
        <section className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            Organization identity
          </h3>

          <FormField
            control={form.control}
            name="orgName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormDescription>Used in reports and governance artifacts.</FormDescription>
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
                <FormDescription>
                  Drives governance structure (e.g. roles, committees, escalation) and readiness scoring.
                </FormDescription>
                <FormControl>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ORG_SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => field.onChange(size.value)}
                        className={cn(
                          "rounded-md border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                          field.value === size.value
                            ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                            : "border-border bg-background hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                        )}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
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
                <FormDescription>
                  Helps identify sector-specific regulations and risk expectations.
                </FormDescription>
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
        </section>

        {/* Business context */}
        <section className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            Business context (optional)
          </h3>
          <p className="text-xs text-muted-foreground">
            Aligns with NIST AI RMF MAP 1.3 and MAP 1.4 — mission, goals for AI, and context of business use.
          </p>

          <FormField
            control={form.control}
            name="missionOrObjectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization mission or primary objectives (optional)</FormLabel>
                <FormDescription>Used to tailor governance and align controls with your mission (MAP 1.3).</FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Deliver safe, equitable financial services..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goalsForAI"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary goals for AI adoption or responsible AI (optional)</FormLabel>
                <FormDescription>Helps frame risk and governance recommendations (MAP 1.3).</FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Improve decision quality, reduce bias, meet regulatory expectations..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryBusinessContextForAI"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary business context for AI use (optional)</FormLabel>
                <FormDescription>How AI supports business objectives and in what context (MAP 1.4).</FormDescription>
                <Select value={field.value || ""} onValueChange={(v) => field.onChange(v || undefined)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select context" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BUSINESS_CONTEXT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
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
                <FormLabel>Business value or context of business use (optional)</FormLabel>
                <FormDescription>Provides context for appropriate use and risk framing (MAP 1.4).</FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Briefly describe how AI fits into your business value and context of use..."
                    className="resize-none"
                    {...field}
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
