"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  Shield,
  Map as MapIcon,
  BarChart3,
  Settings,
  Lightbulb,
} from "lucide-react";
import { NistControlCard } from "./NistControlCard";
import type { NistMappingEntry } from "@/lib/scoring/nist-mapper";

interface NistCategory {
  id: string;
  name: string;
  description: string;
  subcategories: Array<{
    id: string;
    description: string;
  }>;
}

interface NistFunctionSectionProps {
  functionId: string;
  functionName: string;
  functionDescription: string;
  categories: NistCategory[];
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
  categories,
  entries,
  implementedControlIds,
  controlNotes,
  onToggle,
  onNoteChange,
}: NistFunctionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const colors = functionColors[functionId] ?? functionColors.GOVERN;

  // Deduplicate controls within this function
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

  // Group entries by category
  const entriesByCategory = new Map<string, NistMappingEntry[]>();
  for (const entry of entries) {
    // Extract category from nistRef (e.g., "GOVERN-1.1" -> "GOVERN-1")
    const parts = entry.nistRef.split(".");
    const categoryId = parts[0]; // "GOVERN-1"
    if (!entriesByCategory.has(categoryId)) {
      entriesByCategory.set(categoryId, []);
    }
    entriesByCategory.get(categoryId)!.push(entry);
  }

  return (
    <div className="space-y-3">
      {/* Function Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full rounded-lg border p-4 ${colors.header} hover:shadow-sm transition-all`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={colors.accent}>
              {functionIcons[functionId]}
            </span>
            <div className="text-left">
              <h3 className={`text-lg font-semibold ${colors.accent}`}>
                {functionName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {functionDescription}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-medium">
              {implementedCount}/{totalControls} implemented
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-4 pl-2">
          {/* Guidance */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="flex gap-3 py-3">
              <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                {functionGuidance[functionId]}
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          {categories.map((category) => {
            const categoryEntries = entriesByCategory.get(category.id) ?? [];

            // Deduplicate controls within this category
            const categoryControls = new Map<string, NistMappingEntry>();
            for (const entry of categoryEntries) {
              if (!categoryControls.has(entry.controlId)) {
                categoryControls.set(entry.controlId, entry);
              }
            }

            return (
              <CategorySection
                key={category.id}
                category={category}
                controls={[...categoryControls.values()]}
                implementedControlIds={implementedControlIds}
                controlNotes={controlNotes}
                onToggle={onToggle}
                onNoteChange={onNoteChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategorySection({
  category,
  controls,
  implementedControlIds,
  controlNotes,
  onToggle,
  onNoteChange,
}: {
  category: NistCategory;
  controls: NistMappingEntry[];
  implementedControlIds: Set<string>;
  controlNotes: Record<string, string>;
  onToggle: (controlId: string) => void;
  onNoteChange: (controlId: string, note: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(controls.length > 0);

  const coveredSubcatIds = new Set(controls.map((c) => c.nistRef));

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-medium text-sm">{category.id}</span>
        <span className="text-sm text-muted-foreground">
          {category.name}
        </span>
        {controls.length > 0 && (
          <Badge variant="outline" className="text-xs ml-auto">
            {controls.length} control{controls.length !== 1 ? "s" : ""}
          </Badge>
        )}
        {controls.length === 0 && (
          <Badge variant="outline" className="text-xs ml-auto text-muted-foreground">
            No controls mapped
          </Badge>
        )}
      </button>

      {isOpen && (
        <div className="pl-6 space-y-2">
          {/* Subcategory coverage */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {category.subcategories.map((sub) => (
              <span
                key={sub.id}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  coveredSubcatIds.has(sub.id)
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-400"
                }`}
                title={sub.description}
              >
                {sub.id}
              </span>
            ))}
          </div>

          {/* Control Cards */}
          {controls.map((entry) => (
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
      )}
    </div>
  );
}
