"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FadeIn } from "@/components/animation/FadeIn";

interface NistMappingEntry {
  finding: string;
  nistRef: string;
  controls: string;
  evidence: string;
}

interface ProductNistMappingProps {
  nistMapping: NistMappingEntry[];
}

const nistFunctionColor: Record<string, string> = {
  GV: "bg-blue-100 text-blue-800",
  MP: "bg-green-100 text-green-800",
  MS: "bg-orange-100 text-orange-800",
  MG: "bg-purple-100 text-purple-800",
};

function getNistBadgeColor(ref: string): string {
  const prefix = ref?.slice(0, 2)?.toUpperCase() ?? "";
  return nistFunctionColor[prefix] ?? "bg-gray-100 text-gray-800";
}

export function ProductNistMapping({ nistMapping }: ProductNistMappingProps) {
  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>NIST AI RMF Mapping</CardTitle>
            <Badge variant="outline" className="text-sm">
              {(nistMapping ?? []).length} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finding</TableHead>
                <TableHead>NIST Ref</TableHead>
                <TableHead>Controls</TableHead>
                <TableHead>Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(nistMapping ?? []).map((entry, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium max-w-[200px]">
                    {entry.finding}
                  </TableCell>
                  <TableCell>
                    <Badge className={getNistBadgeColor(entry.nistRef)}>
                      {entry.nistRef}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {entry.controls}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px]">
                    {entry.evidence}
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
