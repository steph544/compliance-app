"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { AnimatePresence, motion } from "framer-motion";
import { DESIGNATION_COLORS } from "@/components/charts/chart-colors";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";
import { Sparkles } from "lucide-react";

interface TechnicalControl {
  controlId: string;
  controlName?: string;
  description?: string;
  designation: string;
  reasoning?: string[];
  ruleIds?: string[];
  implementationSteps?: string[];
  implementationGuide?: string;
  owner?: string;
  vendorGuidance?: Record<string, unknown>;
  aiGenerated?: boolean;
  accepted?: boolean;
}

interface TechnicalControlsProps {
  technicalControls: TechnicalControl[];
  orgId?: string;
  productId?: string;
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
            <p className="text-sm font-medium inline-flex items-center gap-2 flex-wrap">
              {displayName}
              {control.aiGenerated && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-normal px-1.5 py-0"
                >
                  AI
                </Badge>
              )}
            </p>
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

        {Array.isArray(control.ruleIds) && control.ruleIds.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Rules: {control.ruleIds.join(", ")}
          </p>
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

function AddRecommendationButton({
  orgId,
  productId,
  controlId,
  compact,
  onSuccess,
}: {
  orgId: string;
  productId: string;
  /** When set, "Add" accepts this recommendation (removes from suggestions, adds to list). When unset, generates a new suggestion. */
  controlId?: string;
  compact?: boolean;
  onSuccess?: (updatedControls: TechnicalControl[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = controlId
        ? `/api/org-assessments/${orgId}/products/${productId}/accept-technical-control-recommendation`
        : `/api/org-assessments/${orgId}/products/${productId}/add-technical-control-recommendation`;
      const res = await fetch(url, {
        method: "POST",
        headers: controlId ? { "Content-Type": "application/json" } : undefined,
        body: controlId ? JSON.stringify({ controlId }) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? (controlId ? "Failed to add" : "Failed to add recommendation"));
        return;
      }
      if (Array.isArray(data.technicalControls) && onSuccess) {
        onSuccess(data.technicalControls as TechnicalControl[]);
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const label = compact ? "Add" : "Add recommendation";
  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={compact ? "h-6 text-xs" : undefined}
        onClick={handleAdd}
        disabled={loading}
      >
        {loading ? "Adding…" : label}
      </Button>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

export function TechnicalControls({
  technicalControls,
  orgId,
  productId,
}: TechnicalControlsProps) {
  const initialControls = technicalControls ?? [];
  const [controls, setControls] = useState<TechnicalControl[]>(initialControls);

  useEffect(() => {
    setControls(initialControls);
  }, [initialControls]);

  const suggestionControls = controls.filter(
    (c) => c.aiGenerated === true && !c.accepted
  );
  const listedControls = controls.filter(
    (c) => !c.aiGenerated || Boolean(c.accepted)
  );

  const sorted = [...listedControls].sort((a, b) => {
    const orderA = designationConfig[a.designation]?.order ?? 99;
    const orderB = designationConfig[b.designation]?.order ?? 99;
    return orderA - orderB;
  });

  const groupOrder = ["REQUIRED", "RECOMMENDED", "OPTIONAL"] as const;
  type DesignationFilter = (typeof groupOrder)[number];

  const grouped = sorted.reduce<Record<string, TechnicalControl[]>>(
    (acc, control) => {
      const raw = String(control.designation ?? "").toUpperCase().trim();
      const key =
        raw === "REQUIRED" || raw === "RECOMMENDED" || raw === "OPTIONAL"
          ? raw
          : "OPTIONAL";
      if (!acc[key]) acc[key] = [];
      acc[key].push(control);
      return acc;
    },
    {}
  );

  const defaultFilter: DesignationFilter =
    groupOrder.find((d) => (grouped[d]?.length ?? 0) > 0) ?? "REQUIRED";
  const [filter, setFilter] = useState<DesignationFilter>(defaultFilter);
  const filteredControls = grouped[filter] ?? [];

  useEffect(() => {
    if (filteredControls.length === 0 && listedControls.length > 0) {
      setFilter(defaultFilter);
    }
  }, [filteredControls.length, listedControls.length, defaultFilter]);

  return (
    <div className="space-y-8">
      {/* AI suggestions style block - up top */}
      <FadeIn>
        <section className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Technical control recommendations
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suggested controls from this assessment. Add any with the button on each card.
            </p>
          </div>
          {suggestionControls.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestionControls.map((control, i) => {
                const displayName = control.controlName || control.controlId;
                const reasonLine = control.reasoning?.[0] ?? control.description ?? "";
                const detailLine = control.designation
                  ? `Designation: ${control.designation}`
                  : control.implementationSteps?.[0] ?? "";
                return (
                  <div
                    key={control.controlId ?? `ai-${i}`}
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    <div className="font-medium text-foreground inline-flex items-center gap-1 flex-wrap">
                      {displayName}
                      <Badge
                        variant="secondary"
                        className="ml-2 text-[10px] font-normal px-1.5 py-0"
                      >
                        AI
                      </Badge>
                    </div>
                    {reasonLine && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {reasonLine}
                      </div>
                    )}
                    {detailLine && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {detailLine}
                      </div>
                    )}
                    {orgId && productId && (
                      <div className="mt-2">
                        <AddRecommendationButton
                          orgId={orgId}
                          productId={productId}
                          controlId={control.controlId}
                          compact
                          onSuccess={setControls}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                No AI-suggested controls yet. Add one below or recompute results to generate suggestions.
              </p>
              {orgId && productId && (
                <AddRecommendationButton
                  orgId={orgId}
                  productId={productId}
                  onSuccess={setControls}
                />
              )}
            </div>
          )}
        </section>
      </FadeIn>

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
        <FadeIn>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-1">
                Show:
              </span>
              {groupOrder.map((designation) => {
                const count = grouped[designation]?.length ?? 0;
                const isActive = filter === designation;
                const label =
                  designation === "REQUIRED"
                    ? "Required"
                    : designation === "RECOMMENDED"
                      ? "Recommended"
                      : "Optional";
                return (
                  <Button
                    key={designation}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(designation)}
                    className="gap-1.5"
                  >
                    {label}
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className="ml-0.5 h-5 min-w-5 px-1.5 text-xs"
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {filteredControls.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/20 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No {filter === "REQUIRED" ? "required" : filter === "RECOMMENDED" ? "recommended" : "optional"} controls in this category.
                </p>
              </div>
            ) : (
              <StaggeredList key={filter} className="grid gap-4 sm:grid-cols-2">
                {filteredControls.map((control, i) => (
                  <StaggeredItem key={control.controlId ?? i}>
                    <ControlCard control={control} />
                  </StaggeredItem>
                ))}
              </StaggeredList>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
