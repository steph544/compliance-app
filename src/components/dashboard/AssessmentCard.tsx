"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/animation/AnimatedCard";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { RISK_TIER_COLORS } from "@/components/charts/chart-colors";

function riskTierColor(tier: string) {
  switch (tier) {
    case "LOW":
      return "bg-green-100 text-green-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800";
    case "HIGH":
      return "bg-red-100 text-red-800";
    case "REGULATED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function statusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
    case "IN_PROGRESS":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

interface AssessmentCardProps {
  assessment: {
    id: string;
    orgName: string;
    status: string;
    createdAt: Date;
    result?: { riskTier: string } | null;
    products: Array<{
      id: string;
      projectName: string;
      status: string;
    }>;
  };
  index: number;
}

export function AssessmentCard({ assessment, index }: AssessmentCardProps) {
  const href =
    assessment.status === "COMPLETED"
      ? `/org/${assessment.id}/results`
      : `/org/${assessment.id}/wizard`;

  const riskTier = assessment.result?.riskTier;

  return (
    <AnimatedCard
      delay={index * 0.06}
      accentColor={riskTier ? RISK_TIER_COLORS[riskTier] ?? "#94a3b8" : undefined}
    >
      <Link href={href}>
        <CardHeader className="pb-3 hover:bg-muted/50 transition-colors rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{assessment.orgName}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Created{" "}
                {new Date(assessment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={statusColor(assessment.status)}
              >
                {assessment.status.replace("_", " ")}
              </Badge>
              {riskTier && (
                <Badge
                  variant="secondary"
                  className={riskTierColor(riskTier)}
                >
                  {riskTier} RISK
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {assessment.products.length} product
            {assessment.products.length !== 1 ? "s" : ""}
          </p>
        </CardHeader>
      </Link>

      {/* Product sub-cards */}
      {assessment.products.length > 0 && (
        <CardContent className="border-t bg-muted/30 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Product Assessments
          </p>
          <StaggeredList className="space-y-2">
            {assessment.products.map((product) => {
              const productHref =
                product.status === "COMPLETED"
                  ? `/org/${assessment.id}/product/${product.id}/results`
                  : `/org/${assessment.id}/product/${product.id}/wizard`;

              return (
                <StaggeredItem key={product.id}>
                  <Link href={productHref}>
                    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-all hover:bg-muted/50 hover:shadow-sm">
                      <span className="text-sm font-medium">
                        {product.projectName}
                      </span>
                      <Badge
                        variant="secondary"
                        className={statusColor(product.status)}
                      >
                        {product.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                </StaggeredItem>
              );
            })}
          </StaggeredList>
        </CardContent>
      )}
    </AnimatedCard>
  );
}
