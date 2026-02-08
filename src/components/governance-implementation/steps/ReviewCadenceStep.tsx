"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { step5Schema } from "@/lib/governance-implementation/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTrackingFields } from "./SectionTrackingFields";
import type { z } from "zod";

type Step5Data = z.infer<typeof step5Schema>;

interface ReviewCadenceStepProps {
  blueprint: {
    reviewCadence: string;
  };
}

export function ReviewCadenceStep({ blueprint }: ReviewCadenceStepProps) {
  const { sections, setSectionData } = useImplementationStore();
  const section = sections[4]; // reviewCadence is index 4
  const savedData = section?.data as Record<string, unknown> | undefined;

  const form = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      tracking: {
        status: section?.status ?? "NOT_STARTED",
        dueDate: section?.dueDate ?? null,
        owner: section?.owner ?? "",
        notes: section?.notes ?? "",
      },
      confirmedCadence: (savedData?.confirmedCadence as string) ?? blueprint.reviewCadence ?? "",
      firstReviewDate: (savedData?.firstReviewDate as string) ?? null,
      reviewOwner: (savedData?.reviewOwner as string) ?? "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) return;
      setSectionData(4, {
        status: values.tracking?.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" ?? "NOT_STARTED",
        dueDate: values.tracking?.dueDate ?? null,
        owner: values.tracking?.owner ?? "",
        notes: values.tracking?.notes ?? "",
        data: {
          confirmedCadence: values.confirmedCadence,
          firstReviewDate: values.firstReviewDate,
          reviewOwner: values.reviewOwner,
        },
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setSectionData]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* AI Recommendation */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Recommended Review Cadence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{blueprint.reviewCadence}</p>
          </CardContent>
        </Card>

        {/* Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configure Review Schedule</h3>

          <FormField
            control={form.control}
            name="confirmedCadence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmed Review Cadence</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Quarterly reviews with annual deep-dive"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstReviewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Review Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reviewOwner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Owner</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Person responsible for scheduling and running reviews"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <SectionTrackingFields form={form} />
      </form>
    </Form>
  );
}
