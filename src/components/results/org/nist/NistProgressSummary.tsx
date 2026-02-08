"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2 } from "lucide-react";
import type { NistMappingEntry } from "@/lib/scoring/nist-mapper";

interface NistProgressSummaryProps {
  entries: NistMappingEntry[];
  implementedControlIds: Set<string>;
}

const functionLabels: Record<string, string> = {
  GOVERN: "Govern",
  MAP: "Map",
  MEASURE: "Measure",
  MANAGE: "Manage",
};

const functionColors: Record<string, string> = {
  GOVERN: "bg-blue-100 text-blue-800",
  MAP: "bg-emerald-100 text-emerald-800",
  MEASURE: "bg-amber-100 text-amber-800",
  MANAGE: "bg-purple-100 text-purple-800",
};

const designationColors: Record<string, string> = {
  REQUIRED: "bg-red-100 text-red-800",
  RECOMMENDED: "bg-amber-100 text-amber-800",
  OPTIONAL: "bg-gray-100 text-gray-700",
};

function getNistFunction(nistRef: string): string {
  const ref = nistRef.toUpperCase();
  if (ref.startsWith("GOVERN")) return "GOVERN";
  if (ref.startsWith("MAP")) return "MAP";
  if (ref.startsWith("MEASURE")) return "MEASURE";
  if (ref.startsWith("MANAGE")) return "MANAGE";
  return "OTHER";
}

export function NistProgressSummary({
  entries,
  implementedControlIds,
}: NistProgressSummaryProps) {
  // Deduplicate controls (same control can map to multiple NIST refs)
  const uniqueControls = new Map<string, NistMappingEntry>();
  for (const entry of entries) {
    if (!uniqueControls.has(entry.controlId)) {
      uniqueControls.set(entry.controlId, entry);
    }
  }

  const totalControls = uniqueControls.size;
  const implementedCount = [...uniqueControls.keys()].filter((id) =>
    implementedControlIds.has(id)
  ).length;
  const progressPercent =
    totalControls > 0 ? Math.round((implementedCount / totalControls) * 100) : 0;

  // Per-function stats
  const functionStats: Record<string, { total: number; implemented: number }> = {};
  for (const [controlId, entry] of uniqueControls) {
    const func = getNistFunction(entry.nistRef);
    if (!functionStats[func]) functionStats[func] = { total: 0, implemented: 0 };
    functionStats[func].total++;
    if (implementedControlIds.has(controlId)) {
      functionStats[func].implemented++;
    }
  }

  // Per-designation stats
  const designationStats: Record<string, { total: number; implemented: number }> = {};
  for (const [controlId, entry] of uniqueControls) {
    const d = entry.designation;
    if (!designationStats[d]) designationStats[d] = { total: 0, implemented: 0 };
    designationStats[d].total++;
    if (implementedControlIds.has(controlId)) {
      designationStats[d].implemented++;
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            NIST AI RMF Compliance Progress
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-semibold">
              {implementedCount}/{totalControls}
            </span>
            <span className="text-muted-foreground">controls implemented</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* By Function */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              By Function
            </p>
            <div className="flex flex-wrap gap-2">
              {["GOVERN", "MAP", "MEASURE", "MANAGE"].map((func) => {
                const stat = functionStats[func];
                if (!stat) return null;
                return (
                  <Badge
                    key={func}
                    className={functionColors[func]}
                  >
                    {functionLabels[func]} {stat.implemented}/{stat.total}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* By Designation */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              By Priority
            </p>
            <div className="flex flex-wrap gap-2">
              {["REQUIRED", "RECOMMENDED", "OPTIONAL"].map((d) => {
                const stat = designationStats[d];
                if (!stat) return null;
                return (
                  <Badge
                    key={d}
                    className={designationColors[d]}
                  >
                    {d.charAt(0) + d.slice(1).toLowerCase()} {stat.implemented}/
                    {stat.total}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
