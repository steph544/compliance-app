"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Map as MapIcon,
  BarChart3,
  Settings,
  Lightbulb,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NistControlCard } from "./NistControlCard";
import type { NistMappingEntry } from "@/lib/scoring/nist-mapper";

interface NistFunctionSectionProps {
  functionId: string;
  functionName: string;
  functionDescription: string;
  entries: NistMappingEntry[];
  implementedControlIds: Set<string>;
  controlNotes: Record<string, string>;
  onToggle: (controlId: string) => void;
  onNoteChange: (controlId: string, note: string) => void;
}

const functionIcons: Record<string, React.ReactNode> = {
  GOVERN: <Shield className="h-5 w-5" />,
  MAP: <MapIcon className="h-5 w-5" />,
  MEASURE: <BarChart3 className="h-5 w-5" />,
  MANAGE: <Settings className="h-5 w-5" />,
};

const functionColors: Record<string, { header: string; accent: string }> = {
  GOVERN: {
    header: "bg-blue-50 border-blue-200",
    accent: "text-blue-700",
  },
  MAP: {
    header: "bg-emerald-50 border-emerald-200",
    accent: "text-emerald-700",
  },
  MEASURE: {
    header: "bg-amber-50 border-amber-200",
    accent: "text-amber-700",
  },
  MANAGE: {
    header: "bg-purple-50 border-purple-200",
    accent: "text-purple-700",
  },
};

const functionGuidance: Record<string, string> = {
  GOVERN:
    "Establish policies, roles, and accountability structures for AI risk management. Focus on executive buy-in, governance committees, and clear ownership of AI systems.",
  MAP:
    "Identify and classify your AI systems, their contexts, stakeholders, and potential impacts. Document data provenance and assess regulatory applicability.",
  MEASURE:
    "Define and monitor metrics for AI trustworthiness \u2014 accuracy, fairness, robustness, explainability. Establish testing procedures, baselines, and alert thresholds.",
  MANAGE:
    "Implement risk treatment plans, technical controls, monitoring dashboards, and incident response procedures. Ensure ongoing compliance and audit readiness.",
};

export function NistFunctionSection({
  functionId,
  functionName,
  functionDescription,
  entries,
  implementedControlIds,
  controlNotes,
  onToggle,
  onNoteChange,
}: NistFunctionSectionProps) {
  const colors = functionColors[functionId] ?? functionColors.GOVERN;

  // Deduplicate controls within this function; one list per function
  const controlList = useMemo(() => {
    const unique = new Map<string, NistMappingEntry>();
    for (const entry of entries) {
      if (!unique.has(entry.controlId)) unique.set(entry.controlId, entry);
    }
    return [...unique.values()].sort((a, b) =>
      a.controlId.localeCompare(b.controlId)
    );
  }, [entries]);

  const totalControls = controlList.length;
  const implementedCount = controlList.filter((entry) =>
    implementedControlIds.has(entry.controlId)
  ).length;

  return (
    <div className="space-y-3">
      {/* Single-line function header */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={colors.accent}>{functionIcons[functionId]}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className={`text-base font-semibold ${colors.accent}`}>
                {functionName}
              </h3>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm">
              <p className="text-sm">{functionDescription}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Badge variant="outline" className="font-medium text-xs">
          {implementedCount}/{totalControls} implemented
        </Badge>
      </div>

      {/* Compact guidance line */}
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <span>{functionGuidance[functionId]}</span>
      </p>

      {/* Single flat list of controls */}
      <div className="space-y-2">
        {controlList.map((entry) => (
          <NistControlCard
            key={entry.controlId}
            entry={entry}
            isImplemented={implementedControlIds.has(entry.controlId)}
            note={controlNotes[entry.controlId] ?? ""}
            onToggle={onToggle}
            onNoteChange={onNoteChange}
          />
        ))}
      </div>
    </div>
  );
}
