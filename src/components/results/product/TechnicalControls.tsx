"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DonutChart } from "@/components/charts/DonutChart";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { AnimatePresence, motion } from "framer-motion";
import { DESIGNATION_COLORS } from "@/components/charts/chart-colors";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";

interface TechnicalControl {
  controlId: string;
  controlName?: string;
  description?: string;
  designation: string;
  reasoning?: string[];
  implementationSteps?: string[];
  implementationGuide?: string;
  owner?: string;
  vendorGuidance?: Record<string, unknown>;
}

interface TechnicalControlsProps {
  technicalControls: TechnicalControl[];
}

const designationConfig: Record<
  string,
  { badgeVariant: "destructive" | "secondary" | "outline"; order: number }
> = {
  REQUIRED: { badgeVariant: "destructive", order: 0 },
  RECOMMENDED: { badgeVariant: "outline", order: 1 },
  OPTIONAL: { badgeVariant: "secondary", order: 2 },
};

function ControlCard({ control }: { control: TechnicalControl }) {
  const [expanded, setExpanded] = useState(false);
  const config = designationConfig[control.designation] ??
    designationConfig.OPTIONAL;
  const displayName = control.controlName || control.controlId;
  const hasSteps =
    Array.isArray(control.implementationSteps) &&
    control.implementationSteps.length > 0;
  const hasLegacyGuide =
    control.implementationGuide && control.implementationGuide.trim() !== "";
  const hasImplementationContent = hasSteps || hasLegacyGuide;
  const reasoningList = Array.isArray(control.reasoning)
    ? control.reasoning
    : control.reasoning
      ? [control.reasoning]
      : [];

  return (
    <Card
      className="transition-card hover-lift overflow-hidden"
      style={{
        borderLeft: `4px solid ${DESIGNATION_COLORS[control.designation] ?? "#94a3b8"}`,
      }}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {control.controlId}
            </p>
            {control.description && (
              <p className="text-sm text-muted-foreground mt-1.5">
                {control.description}
              </p>
            )}
            {control.owner?.trim() && (
              <p className="text-sm text-muted-foreground mt-1">
                Owner: {control.owner}
              </p>
            )}
          </div>
          <Badge variant={config.badgeVariant} className="shrink-0">
            {control.designation}
          </Badge>
        </div>

        {reasoningList.length > 0 && (
          <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Why this applies
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {reasoningList.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {hasImplementationContent && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="px-0 text-muted-foreground hover:text-foreground"
            >
              {expanded ? "Hide" : "Show"} Implementation Guide
            </Button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 text-sm text-muted-foreground rounded-lg border border-border bg-muted/10 p-3">
                    {hasSteps ? (
                      <ol className="list-decimal list-inside space-y-1.5">
                        {control.implementationSteps!.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {control.implementationGuide}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TechnicalControls({
  technicalControls,
}: TechnicalControlsProps) {
  const controls = technicalControls ?? [];

  const sorted = [...controls].sort((a, b) => {
    const orderA = designationConfig[a.designation]?.order ?? 99;
    const orderB = designationConfig[b.designation]?.order ?? 99;
    return orderA - orderB;
  });

  const grouped = sorted.reduce<Record<string, TechnicalControl[]>>(
    (acc, control) => {
      const key = control.designation;
      if (!acc[key]) acc[key] = [];
      acc[key].push(control);
      return acc;
    },
    {}
  );

  const groupOrder = ["REQUIRED", "RECOMMENDED", "OPTIONAL"];

  // Donut chart data
  const donutData = groupOrder
    .map((key) => ({
      name: key.charAt(0) + key.slice(1).toLowerCase(),
      value: grouped[key]?.length ?? 0,
      color: DESIGNATION_COLORS[key] ?? "#94a3b8",
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <FadeIn>
        <ResultsSectionIntro
          description="Technical controls recommended for this product by risk tier. Required controls must be implemented before release; recommended and optional strengthen resilience."
        />
      </FadeIn>

      {controls.length === 0 ? (
        <FadeIn delay={0.05}>
          <div className="rounded-lg border border-border bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No technical controls specified yet.
            </p>
          </div>
        </FadeIn>
      ) : (
        <>
          {/* Distribution Chart */}
          {donutData.length > 0 && (
            <FadeIn delay={0.05}>
              <Card className="transition-card hover-lift">
                <CardContent className="py-6">
                  <div className="max-w-xs mx-auto">
                    <DonutChart data={donutData} centerLabel="Controls" height={220} />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {groupOrder.map((designation, groupIdx) => {
        const groupControls = grouped[designation];
        if (!groupControls || groupControls.length === 0) return null;

        return (
          <FadeIn key={designation} delay={groupIdx * 0.1}>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {designation}
                <Badge
                  variant={
                    designationConfig[designation]?.badgeVariant ?? "secondary"
                  }
                >
                  {groupControls.length}
                </Badge>
              </h3>
              <StaggeredList className="grid gap-3">
                {groupControls.map((control, i) => (
                  <StaggeredItem key={i}>
                    <ControlCard control={control} />
                  </StaggeredItem>
                ))}
              </StaggeredList>
            </div>
          </FadeIn>
        );
      })}
        </>
      )}
    </div>
  );
}
