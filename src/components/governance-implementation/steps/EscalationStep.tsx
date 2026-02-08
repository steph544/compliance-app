"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { step8Schema } from "@/lib/governance-implementation/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionTrackingFields } from "./SectionTrackingFields";
import type { z } from "zod";

type Step8Data = z.infer<typeof step8Schema>;

interface EscalationStepProps {
  blueprint: {
    escalation: Array<{
      level: number;
      trigger: string;
      owner: string;
      timeline: string;
    }>;
  };
}

const levelColors: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

export function EscalationStep({ blueprint }: EscalationStepProps) {
  const { sections, setSectionData } = useImplementationStore();
  const section = sections[7]; // escalation is index 7
  const savedLevels = (section?.data as Record<string, unknown>)?.levels as Array<{
    level: string;
    assignedOwner: string;
    confirmedTimeline: string;
  }> | undefined;

  const form = useForm<Step8Data>({
    resolver: zodResolver(step8Schema),
    defaultValues: {
      tracking: {
        status: section?.status ?? "NOT_STARTED",
        dueDate: section?.dueDate ?? null,
        owner: section?.owner ?? "",
        notes: section?.notes ?? "",
      },
      levels: (blueprint.escalation ?? []).map((e) => {
        const saved = savedLevels?.find((sl) => sl.level === String(e.level));
        return {
          level: String(e.level),
          assignedOwner: saved?.assignedOwner ?? "",
          confirmedTimeline: saved?.confirmedTimeline ?? e.timeline ?? "",
        };
      }),
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) return;
      setSectionData(7, {
        status: values.tracking?.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" ?? "NOT_STARTED",
        dueDate: values.tracking?.dueDate ?? null,
        owner: values.tracking?.owner ?? "",
        notes: values.tracking?.notes ?? "",
        data: { levels: values.levels },
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
              Recommended Escalation Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Suggested Owner</TableHead>
                  <TableHead>Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(blueprint.escalation ?? []).map((e) => (
                  <TableRow key={e.level}>
                    <TableCell>
                      <Badge
                        className={
                          levelColors[e.level] ?? "bg-gray-100 text-gray-800"
                        }
                      >
                        Level {e.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{e.trigger}</TableCell>
                    <TableCell className="text-sm text-blue-600">
                      {e.owner}
                    </TableCell>
                    <TableCell className="text-sm">{e.timeline}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Editable Escalation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Assign Escalation Owners
          </h3>
          {(blueprint.escalation ?? []).map((esc, index) => (
            <div
              key={esc.level}
              className="rounded-lg border p-4 space-y-3"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor:
                  esc.level === 1
                    ? "#eab308"
                    : esc.level === 2
                      ? "#f97316"
                      : "#475569",
              }}
            >
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    levelColors[esc.level] ?? "bg-gray-100 text-gray-800"
                  }
                >
                  Level {esc.level}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {esc.trigger}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`levels.${index}.assignedOwner`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={`Assigned owner (suggested: ${esc.owner})`}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`levels.${index}.confirmedTimeline`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Response timeline"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <SectionTrackingFields form={form} />
      </form>
    </Form>
  );
}
