import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Pencil } from "lucide-react";

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
            const viewHref = product.result
              ? `/org/${orgId}/product/${product.id}/results`
              : `/org/${orgId}/product/${product.id}/wizard`;
            const editHref = `/org/${orgId}/product/${product.id}/wizard`;

            return (
              <Card key={product.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <Link href={viewHref} className="min-w-0 flex-1 flex items-center gap-4 hover:opacity-90">
                    <span className="font-medium truncate">
                      {product.projectName}
                    </span>
                    <StatusIndicator
                      variant={{ type: "assessmentStatus", value: product.status }}
                    />
                    {product.result && (
                      <StatusIndicator
                        variant={{ type: "riskTier", value: product.result.riskTier }}
                      />
                    )}
                  </Link>
                  <Button variant="ghost" size="sm" asChild className="shrink-0">
                    <Link href={editHref} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
