"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { FadeIn } from "@/components/animation/FadeIn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { NistProgressSummary } from "./nist/NistProgressSummary";
import { NistFunctionSection } from "./nist/NistFunctionSection";
import type { NistMappingEntry } from "@/lib/scoring/nist-mapper";

interface NistHierarchySubcategory {
  id: string;
  description: string;
  categoryId: string;
}

interface NistHierarchyCategory {
  id: string;
  name: string;
  description: string;
  functionId: string;
  subcategories: NistHierarchySubcategory[];
}

interface NistHierarchyFunction {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  categories: NistHierarchyCategory[];
}

interface OrgNistMappingProps {
  nistMapping: NistMappingEntry[];
  nistHierarchy: NistHierarchyFunction[];
  assessmentId: string;
  primaryCloudInfrastructure?: "aws" | "azure" | "gcp" | "multi" | "on_prem_only" | "hybrid";
}

function getNistFunction(nistRef: string): string {
  const ref = nistRef.toUpperCase();
  if (ref.startsWith("GOVERN")) return "GOVERN";
  if (ref.startsWith("MAP")) return "MAP";
  if (ref.startsWith("MEASURE")) return "MEASURE";
  if (ref.startsWith("MANAGE")) return "MANAGE";
  return "OTHER";
}

export function OrgNistMapping({
  nistMapping,
  nistHierarchy,
  assessmentId,
  primaryCloudInfrastructure,
}: OrgNistMappingProps) {
  const [implementedControlIds, setImplementedControlIds] = useState<
    Set<string>
  >(new Set());
  const [controlNotes, setControlNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const patchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load progress on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/org-assessments/${assessmentId}/nist-progress`
        );
        if (!res.ok) return;
        const data = await res.json();
        setImplementedControlIds(
          new Set(data.implementedControlIds ?? [])
        );
        setControlNotes(data.controlNotes ?? {});
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [assessmentId]);

  const saveProgress = useCallback(
    (ids: Set<string>, notes: Record<string, string>) => {
      if (patchDebounceRef.current) clearTimeout(patchDebounceRef.current);
      patchDebounceRef.current = setTimeout(async () => {
        await fetch(
          `/api/org-assessments/${assessmentId}/nist-progress`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              implementedControlIds: [...ids],
              controlNotes: notes,
            }),
          }
        );
      }, 300);
    },
    [assessmentId]
  );

  const handleToggle = useCallback(
    (controlId: string) => {
      setImplementedControlIds((prev) => {
        const next = new Set(prev);
        if (next.has(controlId)) {
          next.delete(controlId);
        } else {
          next.add(controlId);
        }
        saveProgress(next, controlNotes);
        return next;
      });
    },
    [controlNotes, saveProgress]
  );

  const handleNoteChange = useCallback(
    (controlId: string, note: string) => {
      setControlNotes((prev) => {
        const next = { ...prev, [controlId]: note };
        saveProgress(implementedControlIds, next);
        return next;
      });
    },
    [implementedControlIds, saveProgress]
  );

  // Group entries by NIST function
  const entriesByFunction = useMemo(() => {
    const map = new Map<string, NistMappingEntry[]>();
    for (const entry of nistMapping ?? []) {
      const func = getNistFunction(entry.nistRef);
      if (!map.has(func)) map.set(func, []);
      map.get(func)!.push(entry);
    }
    return map;
  }, [nistMapping]);

  // Per-function implemented/total for section tab badges
  const functionBadges = useMemo(() => {
    const badges: Record<string, { implemented: number; total: number }> = {};
    for (const func of nistHierarchy) {
      const entries = entriesByFunction.get(func.id) ?? [];
      const uniqueControls = new Map<string, NistMappingEntry>();
      for (const e of entries) {
        if (!uniqueControls.has(e.controlId)) uniqueControls.set(e.controlId, e);
      }
      const total = uniqueControls.size;
      const implemented = [...uniqueControls.keys()].filter((id) =>
        implementedControlIds.has(id)
      ).length;
      badges[func.id] = { implemented, total };
    }
    return badges;
  }, [nistHierarchy, entriesByFunction, implementedControlIds]);

  const defaultSection = nistHierarchy[0]?.id ?? "GOVERN";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[20vh]">
        <div className="text-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Loading compliance tracker...
          </p>
        </div>
      </div>
    );
  }

  if (nistHierarchy.length === 0) {
    return (
      <FadeIn>
        <div className="space-y-6">
          <NistProgressSummary
            entries={nistMapping ?? []}
            implementedControlIds={implementedControlIds}
          />
          <div className="text-center py-8 text-muted-foreground">
            <p>No NIST AI RMF hierarchy data found.</p>
            <p className="text-sm mt-1">
              Ensure the NIST reference data has been seeded in the database.
            </p>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Single context card: intro, glossary, badge legend, cloud callout */}
        <Card className="border-muted bg-muted/20">
          <CardContent className="py-4 space-y-3">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">How these controls were chosen:</strong> They were selected from your organization assessment based on your answers (risk profile, use cases, and context) and mapped to the NIST AI RMF so you can track them in a standard framework.
              </p>
              <p>
                <strong className="text-foreground">What to do:</strong> Use this as your implementation checklist. When a control is in place, mark it as implemented and add notes (e.g. owner, evidence, or links) to support audits and follow-up.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Govern</strong> = policies &amp; accountability
              <span className="mx-1.5">·</span>
              <strong className="text-foreground">Map</strong> = context &amp; classification
              <span className="mx-1.5">·</span>
              <strong className="text-foreground">Measure</strong> = testing &amp; monitoring
              <span className="mx-1.5">·</span>
              <strong className="text-foreground">Manage</strong> = risk &amp; operations
            </p>
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="group text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-90" />
                What do these badges mean?
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 border-l border-muted text-xs space-y-2">
                  <p>
                    <strong className="text-foreground">Priority:</strong> Required = must implement; Recommended = should; Optional = consider.
                  </p>
                  <p>
                    <strong className="text-foreground">Level:</strong> Baseline = minimum for all; Enhanced = higher risk; High stakes = regulated.
                  </p>
                  <p>
                    <strong className="text-foreground">Type:</strong> Technical = systems &amp; tools; Process = procedures; Legal = compliance.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Progress strip + tabs in one block */}
        <div className="space-y-3">
          <NistProgressSummary
            entries={nistMapping ?? []}
            implementedControlIds={implementedControlIds}
            variant="compact"
          />
          <Tabs defaultValue={defaultSection} className="w-full">
            <TabsList className="flex flex-wrap w-full h-auto gap-1">
              {nistHierarchy.map((func) => {
                const badge = functionBadges[func.id];
                const label =
                  badge && badge.total > 0
                    ? `${func.name} (${badge.implemented}/${badge.total})`
                    : func.name;
                return (
                  <TabsTrigger key={func.id} value={func.id}>
                    {label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {nistHierarchy.map((func) => (
              <TabsContent key={func.id} value={func.id} className="mt-6">
                <NistFunctionSection
                  functionId={func.id}
                  functionName={func.name}
                  functionDescription={func.description}
                  entries={entriesByFunction.get(func.id) ?? []}
                  implementedControlIds={implementedControlIds}
                  controlNotes={controlNotes}
                  onToggle={handleToggle}
                  onNoteChange={handleNoteChange}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </FadeIn>
  );
}
