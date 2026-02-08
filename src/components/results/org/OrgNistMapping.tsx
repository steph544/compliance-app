"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { FadeIn } from "@/components/animation/FadeIn";
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
  const entriesByFunction = new Map<string, NistMappingEntry[]>();
  for (const entry of nistMapping ?? []) {
    const func = getNistFunction(entry.nistRef);
    if (!entriesByFunction.has(func)) {
      entriesByFunction.set(func, []);
    }
    entriesByFunction.get(func)!.push(entry);
  }

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

  return (
    <FadeIn>
      <div className="space-y-6">
        <NistProgressSummary
          entries={nistMapping ?? []}
          implementedControlIds={implementedControlIds}
        />

        {nistHierarchy.map((func) => (
          <NistFunctionSection
            key={func.id}
            functionId={func.id}
            functionName={func.name}
            functionDescription={func.description}
            categories={func.categories}
            entries={entriesByFunction.get(func.id) ?? []}
            implementedControlIds={implementedControlIds}
            controlNotes={controlNotes}
            onToggle={handleToggle}
            onNoteChange={handleNoteChange}
          />
        ))}

        {nistHierarchy.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No NIST AI RMF hierarchy data found.</p>
            <p className="text-sm mt-1">
              Ensure the NIST reference data has been seeded in the database.
            </p>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
