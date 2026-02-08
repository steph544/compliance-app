"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { step7Schema } from "@/lib/governance-implementation/schemas";
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

type Step7Data = z.infer<typeof step7Schema>;

interface WhistleblowerStepProps {
  blueprint: {
    whistleblower: {
      channel: string;
      process: string;
      sla: string;
    };
  };
}

export function WhistleblowerStep({ blueprint }: WhistleblowerStepProps) {
  const { sections, setSectionData } = useImplementationStore();
  const section = sections[6]; // whistleblower is index 6
  const savedData = section?.data as Record<string, unknown> | undefined;

  const form = useForm<Step7Data>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      tracking: {
        status: section?.status ?? "NOT_STARTED",
        dueDate: section?.dueDate ?? null,
        owner: section?.owner ?? "",
        notes: section?.notes ?? "",
      },
      channelUrl: (savedData?.channelUrl as string) ?? "",
      processOwner: (savedData?.processOwner as string) ?? "",
      configuredSla: (savedData?.configuredSla as string) ?? blueprint.whistleblower?.sla ?? "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) return;
      setSectionData(6, {
        status: values.tracking?.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" ?? "NOT_STARTED",
        dueDate: values.tracking?.dueDate ?? null,
        owner: values.tracking?.owner ?? "",
        notes: values.tracking?.notes ?? "",
        data: {
          channelUrl: values.channelUrl,
          processOwner: values.processOwner,
          configuredSla: values.configuredSla,
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
              Recommended Whistleblower Mechanism
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <p className="font-medium mb-1">Channel</p>
                <p className="text-muted-foreground">
                  {blueprint.whistleblower?.channel}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Process</p>
                <p className="text-muted-foreground">
                  {blueprint.whistleblower?.process}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">SLA</p>
                <p className="text-muted-foreground">
                  {blueprint.whistleblower?.sla}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Configure Whistleblower Channel
          </h3>

          <FormField
            control={form.control}
            name="channelUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel URL or Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., https://company.ethicspoint.com or ai-concerns@company.com"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="processOwner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process Owner</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Person responsible for managing reports"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="configuredSla"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Configured SLA</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 24-hour triage, 5-day resolution"
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
