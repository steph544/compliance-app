"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { RISK_TIER_COLORS } from "@/components/charts/chart-colors";
import {
  Building2,
  CheckCircle,
  Boxes,
  ShieldAlert,
  ChevronRight,
  Trash2,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DashboardAssessment = {
  id: string;
  orgName: string;
  answers?: Record<string, unknown> | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  result?: { riskTier: string; riskScore: number } | null;
  products: Array<{
    id: string;
    projectName: string;
    answers?: Record<string, unknown> | null;
    status: string;
  }>;
};

function displayOrgName(a: DashboardAssessment): string {
  const step1 = a.answers?.step1 as { orgName?: string } | undefined;
  const name = step1?.orgName?.trim();
  return name || a.orgName;
}

function displayProductName(p: { projectName: string; answers?: Record<string, unknown> | null }): string {
  const step1 = p.answers?.step1 as { projectName?: string } | undefined;
  const name = step1?.projectName?.trim();
  return name || p.projectName;
}

interface DashboardViewProps {
  assessments: DashboardAssessment[];
  totalAssessments: number;
  completedAssessments: number;
  totalProducts: number;
  riskDistribution: Record<string, number>;
}

export function DashboardView({
  assessments,
  totalAssessments,
  completedAssessments,
  totalProducts,
  riskDistribution,
}: DashboardViewProps) {
  const router = useRouter();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(
    assessments.length > 0 ? assessments[0].id : null
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedAssessment = useMemo(
    () => assessments.find((a) => a.id === selectedAssessmentId) ?? null,
    [assessments, selectedAssessmentId]
  );
  const selectedProduct = useMemo(() => {
    if (!selectedAssessment) return null;
    if (!selectedProductId) return null;
    return selectedAssessment.products.find((p) => p.id === selectedProductId) ?? null;
  }, [selectedAssessment, selectedProductId]);

  // Reset product when assessment changes
  const handleAssessmentChange = (id: string) => {
    setSelectedAssessmentId(id);
    setSelectedProductId(null);
  };

  const completionPct = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;
  const statusBreakdown = useMemo(() => {
    const inProgress = assessments.filter((a) => a.status !== "COMPLETED").length;
    const completed = assessments.filter((a) => a.status === "COMPLETED").length;
    return [
      { name: "Completed", value: completed, color: "#22c55e" },
      { name: "In progress", value: inProgress, color: "var(--accent-primary)" },
    ].filter((d) => d.value > 0);
  }, [assessments]);

  const RISK_TIER_ORDER = ["LOW", "MEDIUM", "HIGH", "REGULATED"] as const;
  const riskBarData = useMemo(
    () =>
      RISK_TIER_ORDER.filter((tier) => (riskDistribution[tier] ?? 0) > 0).map((tier) => ({
        name: `${tier} risk`,
        value: riskDistribution[tier] ?? 0,
        description: `${riskDistribution[tier]} assessment${(riskDistribution[tier] ?? 0) !== 1 ? "s" : ""}`,
      })),
    [riskDistribution]
  );

  const donutData = useMemo(
    () =>
      Object.entries(riskDistribution)
        .filter(([, count]) => count > 0)
        .map(([tier, count]) => ({
          name: `${tier} Risk`,
          value: count,
          color: RISK_TIER_COLORS[tier] ?? "#94a3b8",
        })),
    [riskDistribution]
  );

  async function confirmDelete() {
    if (!selectedAssessment) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/org-assessments/${selectedAssessment.id}`, { method: "DELETE" });
      if (!res.ok) return;
      setDeleteOpen(false);
      setSelectedAssessmentId(null);
      setSelectedProductId(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (assessments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stat cards: blue, gray, green, accent orange */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          value={totalAssessments}
          label="Total assessments"
          icon={Building2}
          accentColor="var(--accent-primary)"
        />
        <StatCard
          value={completedAssessments}
          label="Completed"
          icon={CheckCircle}
          accentColor="#22c55e"
        />
        <StatCard
          value={totalProducts}
          label="Product assessments"
          icon={Boxes}
          accentColor="var(--muted-foreground)"
        />
        <StatCard
          value={Object.keys(riskDistribution).filter((k) => (riskDistribution[k] ?? 0) > 0).length}
          label="Risk tiers active"
          icon={ShieldAlert}
          accentColor="var(--accent-orange)"
        />
      </div>

      {/* Analytics row: cards with subtle gradients */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Completion rate */}
        <Card className="border-border bg-card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{completionPct}%</span>
              <span className="text-muted-foreground text-sm">
                {completedAssessments} of {totalAssessments} completed
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-progress-gradient transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status breakdown */}
        {statusBreakdown.length > 0 && (
          <Card className="border-border overflow-visible bg-card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mx-auto w-full max-w-[240px]" style={{ minHeight: 260 }}>
                <DonutChart
                  data={statusBreakdown}
                  centerLabel=""
                  height={260}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk tier distribution (horizontal bar) */}
        {riskBarData.length > 0 && (
          <Card className="border-border bg-card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Risk tier distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <HorizontalBarChart data={riskBarData} height={Math.max(120, riskBarData.length * 36)} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assessment & product selectors */}
      <Card className="border-border bg-card-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">View assessment</CardTitle>
          <p className="text-muted-foreground text-xs">
            Choose an assessment and optionally a product to open or manage.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="assessment-select" className="text-muted-foreground text-sm whitespace-nowrap">
                Assessment
              </label>
              <Select
                value={selectedAssessmentId ?? ""}
                onValueChange={handleAssessmentChange}
              >
                <SelectTrigger id="assessment-select" className="min-w-[220px]">
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {displayOrgName(a)} · {new Date(a.createdAt).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedAssessment && selectedAssessment.products.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="product-select" className="text-muted-foreground text-sm whitespace-nowrap">
                  Product
                </label>
                <Select
                  value={selectedProductId ?? "__all__"}
                  onValueChange={(v) => setSelectedProductId(v === "__all__" ? null : v)}
                >
                  <SelectTrigger id="product-select" className="min-w-[200px]">
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All products</SelectItem>
                    {selectedAssessment.products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {displayProductName(p)} · {p.status === "COMPLETED" ? "Completed" : "In progress"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Selected assessment/product card */}
          {selectedAssessment && (
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              {selectedProduct ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Product assessment</p>
                      <p className="font-medium">{displayProductName(selectedProduct)}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <StatusIndicator
                          variant={{ type: "assessmentStatus", value: selectedProduct.status }}
                        />
                        <span>Under {displayOrgName(selectedAssessment)}</span>
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link
                        href={
                          selectedProduct.status === "COMPLETED"
                            ? `/org/${selectedAssessment.id}/product/${selectedProduct.id}/results`
                            : `/org/${selectedAssessment.id}/product/${selectedProduct.id}/wizard`
                        }
                      >
                        {selectedProduct.status === "COMPLETED" ? "View results" : "Continue wizard"}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Organization assessment</p>
                      <p className="font-medium">{displayOrgName(selectedAssessment)}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <StatusIndicator
                          variant={{ type: "assessmentStatus", value: selectedAssessment.status }}
                        />
                        {selectedAssessment.result?.riskTier && (
                          <StatusIndicator
                            variant={{
                              type: "riskTier",
                              value: selectedAssessment.result.riskTier as "LOW" | "MEDIUM" | "HIGH" | "REGULATED",
                            }}
                          />
                        )}
                        <span>
                          {new Date(selectedAssessment.createdAt).toLocaleDateString()}
                          {" · "}
                          {selectedAssessment.products.length} product
                          {selectedAssessment.products.length !== 1 ? "s" : ""}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/org/${selectedAssessment.id}/results`}>
                          <FileText className="mr-1 h-4 w-4" />
                          Results
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link
                          href={
                            selectedAssessment.status === "COMPLETED"
                              ? `/org/${selectedAssessment.id}/results`
                              : `/org/${selectedAssessment.id}/wizard`
                          }
                        >
                          {selectedAssessment.status === "COMPLETED" ? "View results" : "Continue wizard"}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label="Delete assessment"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md border-border" showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete assessment</DialogTitle>
            <DialogDescription>
              This will permanently delete this assessment and all its products and results. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
