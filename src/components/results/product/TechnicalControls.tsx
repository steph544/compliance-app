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

interface TechnicalControl {
  controlId: string;
  designation: string;
  implementationGuide: string;
  owner: string;
}

interface TechnicalControlsProps {
  technicalControls: TechnicalControl[];
}

const designationConfig: Record<
  string,
  { className: string; order: number }
> = {
  REQUIRED: { className: "bg-red-100 text-red-800 hover:bg-red-200", order: 0 },
  RECOMMENDED: {
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    order: 1,
  },
  OPTIONAL: {
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    order: 2,
  },
};

function ControlCard({ control }: { control: TechnicalControl }) {
  const [expanded, setExpanded] = useState(false);
  const config = designationConfig[control.designation] ??
    designationConfig.OPTIONAL;

  return (
    <Card
      className="transition-card hover-lift overflow-hidden"
      style={{
        borderLeft: `4px solid ${DESIGNATION_COLORS[control.designation] ?? "#94a3b8"}`,
      }}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-sm font-medium">{control.controlId}</p>
            <p className="text-sm text-muted-foreground">
              Owner: {control.owner}
            </p>
          </div>
          <Badge className={config.className}>{control.designation}</Badge>
        </div>
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
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {control.implementationGuide}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
      {/* Distribution Chart */}
      {donutData.length > 0 && (
        <FadeIn>
          <Card>
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
                  className={
                    designationConfig[designation]?.className ??
                    "bg-gray-100 text-gray-800"
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
    </div>
  );
}
