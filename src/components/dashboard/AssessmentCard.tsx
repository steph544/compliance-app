"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";

interface AssessmentCardProps {
  assessment: {
    id: string;
    orgName: string;
    answers?: Record<string, unknown> | null;
    status: string;
    createdAt: Date;
    result?: { riskTier: string } | null;
    products: Array<{
      id: string;
      projectName: string;
      answers?: Record<string, unknown> | null;
      status: string;
    }>;
  };
}

function displayOrgName(assessment: AssessmentCardProps["assessment"]): string {
  const step1 = assessment.answers?.step1 as { orgName?: string } | undefined;
  const name = step1?.orgName?.trim();
  return name || assessment.orgName;
}

function displayProjectName(product: { projectName: string; answers?: Record<string, unknown> | null }): string {
  const step1 = product.answers?.step1 as { projectName?: string } | undefined;
  const name = step1?.projectName?.trim();
  return name || product.projectName;
}

export function AssessmentCard({ assessment }: AssessmentCardProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const href =
    assessment.status === "COMPLETED"
      ? `/org/${assessment.id}/results`
      : `/org/${assessment.id}/wizard`;

  const riskTier = assessment.result?.riskTier;
  const title = displayOrgName(assessment);

  function openDeleteModal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/org-assessments/${assessment.id}`, { method: "DELETE" });
      if (!res.ok) return;
      setDeleteOpen(false);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="py-4 px-4 pb-3 transition-colors rounded-t-xl">
        <div className="flex items-start justify-between gap-4">
          <Link href={href} className="min-w-0 flex-1 hover:bg-muted/50 -m-2 p-2 rounded-lg">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Date(assessment.createdAt).toLocaleDateString()}
              {" · "}
              {assessment.products.length} product{assessment.products.length !== 1 ? "s" : ""}
            </p>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <StatusIndicator
              variant={{ type: "assessmentStatus", value: assessment.status }}
            />
            {riskTier && (
              <StatusIndicator
                variant={{
                  type: "riskTier",
                  value: riskTier as "LOW" | "MEDIUM" | "HIGH" | "REGULATED",
                }}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete assessment"
              onClick={openDeleteModal}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md border-border" showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete assessment</DialogTitle>
            <DialogDescription>
              This will permanently delete this assessment and all its products and results. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product sub-cards */}
      {assessment.products.length > 0 && (
        <CardContent className="border-t border-border bg-muted/30 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Product assessments
          </p>
          <div className="space-y-1.5">
            {assessment.products.map((product) => {
              const viewHref =
                product.status === "COMPLETED"
                  ? `/org/${assessment.id}/product/${product.id}/results`
                  : `/org/${assessment.id}/product/${product.id}/wizard`;
              const editHref = `/org/${assessment.id}/product/${product.id}/wizard`;

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <Link href={viewHref} className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {displayProjectName(product)}
                    </span>
                    <StatusIndicator
                      variant={{ type: "assessmentStatus", value: product.status }}
                    />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Edit product assessment"
                    asChild
                  >
                    <Link href={editHref}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
