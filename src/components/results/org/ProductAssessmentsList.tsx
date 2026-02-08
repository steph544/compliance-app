import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { RiskTierBadge } from "@/components/results/shared/RiskTierBadge";

interface ProductAssessment {
  id: string;
  projectName: string;
  status: string;
  result?: {
    riskTier: "LOW" | "MEDIUM" | "HIGH" | "REGULATED";
  } | null;
}

interface ProductAssessmentsListProps {
  products: ProductAssessment[];
  orgId: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
  },
};

export function ProductAssessmentsList({
  products,
  orgId,
}: ProductAssessmentsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Assessments</h3>
        <Button asChild>
          <Link href={`/org/${orgId}/product/new`}>
            New Product Assessment
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No product assessments yet. Create one to evaluate individual AI
              products.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => {
            const status = statusConfig[product.status] ?? {
              label: product.status,
              className: "bg-gray-100 text-gray-800 border-gray-200",
            };

            const href = product.result
              ? `/org/${orgId}/product/${product.id}/results`
              : `/org/${orgId}/product/${product.id}`;

            return (
              <Link key={product.id} href={href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        {product.projectName}
                      </span>
                      <Badge className={status.className}>
                        {status.label}
                      </Badge>
                    </div>
                    {product.result && (
                      <RiskTierBadge tier={product.result.riskTier} size="sm" />
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
