"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FadeIn } from "@/components/animation/FadeIn";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";

interface ReleaseCriterion {
  metric: string;
  type: string;
  threshold: string;
  dataSource: string;
  owner: string;
  authority: string;
}

interface ReleaseCriteriaMatrixProps {
  releaseCriteria: ReleaseCriterion[];
}

function isBlockRelease(authority: string | undefined): boolean {
  if (!authority) return false;
  const n = authority.toLowerCase().replace(/\s+/g, "_");
  return n === "block_release" || n === "block release";
}

function formatAuthority(authority: string | undefined): string {
  if (!authority) return "—";
  const n = authority.toLowerCase().replace(/\s+/g, "_");
  if (n === "block_release") return "Block Release";
  if (n === "allow_with_controls") return "Allow with controls";
  return authority;
}

export function ReleaseCriteriaMatrix({
  releaseCriteria,
}: ReleaseCriteriaMatrixProps) {
  const criteria = releaseCriteria ?? [];
  const blockCount = criteria.filter((c) => isBlockRelease(c.authority)).length;

  return (
    <div className="space-y-6">
      <FadeIn>
        <ResultsSectionIntro
          description="Conditions that must be met before release (or that inform go/no-go). Block-release criteria are mandatory."
        />
      </FadeIn>

      {criteria.length === 0 ? (
        <FadeIn delay={0.05}>
          <div className="rounded-lg border border-border bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No release criteria defined yet.
            </p>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.05}>
          <Card className="transition-card hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Release Criteria Matrix</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {criteria.length} criteria
                  </Badge>
                  {blockCount > 0 && (
                    <Badge variant="destructive" className="text-sm">
                      {blockCount} block release
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Data Source</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Authority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((criterion, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {criterion.metric}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{criterion.type}</Badge>
                      </TableCell>
                      <TableCell>{criterion.threshold}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {criterion.dataSource}
                      </TableCell>
                      <TableCell>{criterion.owner}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isBlockRelease(criterion.authority)
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {formatAuthority(criterion.authority)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
