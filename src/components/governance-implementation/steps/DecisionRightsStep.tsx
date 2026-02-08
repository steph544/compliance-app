"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { step4Schema } from "@/lib/governance-implementation/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Step4Data = z.infer<typeof step4Schema>;

interface DecisionRightsStepProps {
  blueprint: {
    decisionRights: Array<{
      decision: string;
      responsible: string;
      accountable: string;
      consulted: string;
      informed: string;
    }>;
  };
}

const raciHeaders = [
  { key: "responsible", label: "Responsible", color: "bg-blue-50 text-blue-700" },
  { key: "accountable", label: "Accountable", color: "bg-green-50 text-green-700" },
  { key: "consulted", label: "Consulted", color: "bg-yellow-50 text-yellow-700" },
  { key: "informed", label: "Informed", color: "bg-gray-50 text-gray-700" },
] as const;

export function DecisionRightsStep({ blueprint }: DecisionRightsStepProps) {
  const { sections, setSectionData } = useImplementationStore();
  const section = sections[3]; // decisionRights is index 3
  const savedDecisions = (section?.data as Record<string, unknown>)?.decisions as Array<{
    decision: string;
    responsible: string;
    accountable: string;
    consulted: string;
    informed: string;
  }> | undefined;

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      tracking: {
        status: section?.status ?? "NOT_STARTED",
        dueDate: section?.dueDate ?? null,
        owner: section?.owner ?? "",
        notes: section?.notes ?? "",
      },
      decisions: (blueprint.decisionRights ?? []).map((d) => {
        const saved = savedDecisions?.find((sd) => sd.decision === d.decision);
        return {
          decision: d.decision,
          responsible: saved?.responsible ?? "",
          accountable: saved?.accountable ?? "",
          consulted: saved?.consulted ?? "",
          informed: saved?.informed ?? "",
        };
      }),
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) return;
      setSectionData(3, {
        status: values.tracking?.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" ?? "NOT_STARTED",
        dueDate: values.tracking?.dueDate ?? null,
        owner: values.tracking?.owner ?? "",
        notes: values.tracking?.notes ?? "",
        data: { decisions: values.decisions },
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
              Recommended RACI Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Decision</TableHead>
                    {raciHeaders.map((h) => (
                      <TableHead key={h.key} className={h.color}>
                        {h.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(blueprint.decisionRights ?? []).map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm">
                        {d.decision}
                      </TableCell>
                      <TableCell className="text-sm text-blue-600">
                        {d.responsible}
                      </TableCell>
                      <TableCell className="text-sm text-green-600">
                        {d.accountable}
                      </TableCell>
                      <TableCell className="text-sm text-yellow-600">
                        {d.consulted}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {d.informed}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Editable RACI Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Assign Real People to RACI Roles
          </h3>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Decision</TableHead>
                  {raciHeaders.map((h) => (
                    <TableHead key={h.key} className={`min-w-[160px] ${h.color}`}>
                      {h.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(blueprint.decisionRights ?? []).map((d, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-sm align-top pt-4">
                      {d.decision}
                    </TableCell>
                    {raciHeaders.map((h) => (
                      <TableCell key={h.key} className="align-top">
                        <FormField
                          control={form.control}
                          name={`decisions.${index}.${h.key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={`e.g., ${(d as Record<string, string>)[h.key]}`}
                                  className="text-sm"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <SectionTrackingFields form={form} />
      </form>
    </Form>
  );
}
