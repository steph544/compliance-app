"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";
import { CHART_COLORS } from "@/components/charts/chart-colors";
import { FileText } from "lucide-react";

/** Supports both full mapper shape (controlId, evidence[]) and legacy flat shape (controls, evidence string). */
interface NistMappingEntry {
  finding: string;
  nistRef: string;
  controlId?: string;
  controlName?: string;
  controls?: string;
  evidence?: string[] | string;
  designation?: string;
}

interface ProductNistMappingProps {
  nistMapping: NistMappingEntry[];
}

const NIST_PREFIX_INDEX: Record<string, number> = {
  GV: 0,
  MP: 1,
  MS: 2,
  MG: 3,
};

function getNistBadgeStyle(ref: string): { backgroundColor: string; color: string } {
  const prefix = ref?.slice(0, 2)?.toUpperCase() ?? "";
  const color = CHART_COLORS[NIST_PREFIX_INDEX[prefix] ?? 4] ?? CHART_COLORS[0];
  return {
    backgroundColor: `${color}20`,
    color: color,
  };
}

function evidenceToList(evidence: string[] | string | undefined): string[] {
  if (!evidence) return [];
  if (Array.isArray(evidence)) return evidence.filter(Boolean);
  return evidence.trim() ? [evidence.trim()] : [];
}

interface ControlBlock {
  controlId: string | null;
  controlName: string | null;
  nistRefs: string[];
  evidence: string[];
}

/** Group by finding text first so the same finding is never repeated; under each finding, list controls with their NIST refs and evidence. */
function groupByFinding(entries: NistMappingEntry[]): { finding: string; controls: ControlBlock[] }[] {
  const findingToControls = new Map<string, Map<string, ControlBlock>>();

  for (const entry of entries) {
    const findingKey = entry.finding.trim() || "—";
    let controlMap = findingToControls.get(findingKey);
    if (!controlMap) {
      controlMap = new Map();
      findingToControls.set(findingKey, controlMap);
    }

    const controlKey = entry.controlId ?? entry.controlName ?? `__finding__${findingKey}`;
    let block = controlMap.get(controlKey);
    if (!block) {
      block = {
        controlId: entry.controlId ?? null,
        controlName: entry.controlName ?? null,
        nistRefs: [],
        evidence: evidenceToList(entry.evidence),
      };
      controlMap.set(controlKey, block);
    }
    if (!block.nistRefs.includes(entry.nistRef)) block.nistRefs.push(entry.nistRef);
    evidenceToList(entry.evidence).forEach((e) => {
      if (!block!.evidence.includes(e)) block!.evidence.push(e);
    });
  }

  return Array.from(findingToControls.entries()).map(([finding, controlMap]) => ({
    finding,
    controls: Array.from(controlMap.values()).map((b) => ({
      ...b,
      nistRefs: b.nistRefs.sort(),
    })),
  }));
}

export function ProductNistMapping({ nistMapping }: ProductNistMappingProps) {
  const entries = nistMapping ?? [];
  const groups = groupByFinding(entries);

  return (
    <div className="space-y-6">
      <FadeIn>
        <ResultsSectionIntro
          description="This section maps your product's technical controls to the NIST AI Risk Management Framework (RMF). It shows which framework areas each control supports and what evidence to maintain for compliance and audit. Driven by your product's Technical Controls and the control library's NIST links."
        />
      </FadeIn>

      {entries.length === 0 ? (
        <FadeIn delay={0.05}>
          <div className="rounded-lg border border-border bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No NIST mapping entries yet.
            </p>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.05}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">NIST AI RMF Mapping</h2>
              <Badge variant="outline" className="text-sm">
                {groups.length} finding{groups.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <StaggeredList className="space-y-4">
              {groups.map((group, idx) => (
                <StaggeredItem key={idx}>
                  <Card className="transition-card hover-lift overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium leading-snug">
                        {group.finding}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {group.controls.map((control, cIdx) => (
                        <div
                          key={cIdx}
                          className="rounded-lg border border-border bg-muted/10 p-3 space-y-2"
                        >
                          {(control.controlId || control.controlName) && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {control.controlName && (
                                <span className="font-medium text-foreground/80">{control.controlName}</span>
                              )}
                              {control.controlName && control.controlId && " · "}
                              {control.controlId && <span>{control.controlId}</span>}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {control.nistRefs.map((ref) => (
                              <Badge
                                key={ref}
                                variant="secondary"
                                className="border-0 text-xs"
                                style={getNistBadgeStyle(ref)}
                              >
                                {ref}
                              </Badge>
                            ))}
                          </div>
                          {control.evidence.length > 0 && (
                            <>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">
                                Evidence
                              </p>
                              <ul className="space-y-1.5">
                                {control.evidence.map((item, j) => (
                                  <li
                                    key={j}
                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                  >
                                    <FileText className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/70" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </StaggeredItem>
              ))}
            </StaggeredList>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
