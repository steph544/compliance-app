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

export function ReleaseCriteriaMatrix({
  releaseCriteria,
}: ReleaseCriteriaMatrixProps) {
  const criteria = releaseCriteria ?? [];
  const blockCount = criteria.filter(
    (c) => c.authority === "Block Release"
  ).length;

  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Release Criteria Matrix</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {criteria.length} criteria
              </Badge>
              {blockCount > 0 && (
                <Badge className="bg-red-100 text-red-800">
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
                    <Badge
                      className={
                        criterion.type === "ROI"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                      }
                    >
                      {criterion.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{criterion.threshold}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {criterion.dataSource}
                  </TableCell>
                  <TableCell>{criterion.owner}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        criterion.authority === "Block Release"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      }
                    >
                      {criterion.authority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
