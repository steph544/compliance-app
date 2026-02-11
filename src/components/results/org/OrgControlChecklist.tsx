"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DonutChart } from "@/components/charts/DonutChart";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { DESIGNATION_COLORS } from "@/components/charts/chart-colors";

interface ControlSelection {
  controlId: string;
  designation: "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
  owner?: string;
  reasoning: string | string[];
}

interface OrgControlChecklistProps {
  controlSelections: ControlSelection[];
  /** When set, show a callout that implementation steps reflect this cloud (e.g. AWS Bedrock Guardrails). */
  primaryCloudInfrastructure?: "aws" | "azure" | "gcp" | "multi" | "on_prem_only" | "hybrid";
}

const designationConfig = {
  REQUIRED: {
    label: "Required",
    className: "bg-red-100 text-red-800 border-red-200",
    order: 0,
  },
  RECOMMENDED: {
    label: "Recommended",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    order: 1,
  },
  OPTIONAL: {
    label: "Optional",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    order: 2,
  },
} as const;

const CLOUD_CALLOUT: Record<string, { title: string; message: string }> = {
  aws: {
    title: "AWS implementation",
    message:
      "Because you use AWS, implementation steps in the NIST Compliance tab reflect AWS services (e.g. Amazon Bedrock Guardrails) where available.",
  },
  azure: {
    title: "Azure implementation",
    message:
      "Because you use Azure, implementation steps in the NIST Compliance tab reflect Azure offerings (e.g. Azure AI Content Safety) where available.",
  },
};

export function OrgControlChecklist({
  controlSelections,
  primaryCloudInfrastructure,
}: OrgControlChecklistProps) {
  const selections = controlSelections ?? [];
  const callout =
    primaryCloudInfrastructure === "aws" || primaryCloudInfrastructure === "azure"
      ? CLOUD_CALLOUT[primaryCloudInfrastructure]
      : null;

  const grouped = selections.reduce(
    (acc, control) => {
      const key = control.designation;
      if (!acc[key]) acc[key] = [];
      acc[key].push(control);
      return acc;
    },
    {} as Record<string, ControlSelection[]>
  );

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) =>
      designationConfig[a as keyof typeof designationConfig].order -
      designationConfig[b as keyof typeof designationConfig].order
  );

  const donutData = (["REQUIRED", "RECOMMENDED", "OPTIONAL"] as const)
    .map((key) => ({
      name: designationConfig[key].label,
      value: grouped[key]?.length ?? 0,
      color: DESIGNATION_COLORS[key],
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Controls Checklist</h3>

      {callout && (
        <FadeIn>
          <Card className="border-muted bg-muted/30">
            <CardContent className="py-4">
              <p className="text-sm font-medium">{callout.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{callout.message}</p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Donut Chart */}
      {donutData.length > 0 && (
        <FadeIn>
          <Card>
            <CardContent className="py-6">
              <div className="max-w-xs mx-auto">
                <DonutChart data={donutData} centerLabel="Controls" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Grouped Control Lists */}
      {sortedGroups.map(([designation, controls], groupIndex) => {
        const config =
          designationConfig[designation as keyof typeof designationConfig];
        return (
          <FadeIn key={designation} delay={groupIndex * 0.1}>
            <section className="space-y-3">
              <h4 className="text-base font-medium flex items-center gap-2">
                <Badge className={cn(config.className)}>{config.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({controls.length} controls)
                </span>
              </h4>

              <StaggeredList className="grid gap-3">
                {controls.map((control) => (
                  <StaggeredItem key={control.controlId}>
                    <Card
                      className="transition-card hover-lift overflow-hidden"
                      style={{
                        borderLeft: `4px solid ${DESIGNATION_COLORS[designation] ?? "#94a3b8"}`,
                      }}
                    >
                      <CardContent className="flex items-start gap-4 py-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-medium">
                              {control.controlId}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(control.reasoning)
                              ? control.reasoning.join(" ")
                              : control.reasoning}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">Owner</p>
                          <p className="text-sm font-medium">{control.owner ?? "—"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggeredItem>
                ))}
              </StaggeredList>
            </section>
          </FadeIn>
        );
      })}
    </div>
  );
}
