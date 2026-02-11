"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";
import { TabContentFadeIn } from "@/components/results/shared/TabContentFadeIn";
import { Loader2, History } from "lucide-react";

export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorEmail: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

interface AuditLogSectionProps {
  orgId: string;
  productId: string;
}

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "accept_ai_control", label: "Accept AI control" },
  { value: "add_recommendation", label: "Add recommendation" },
  { value: "release_approval", label: "Release approval" },
  { value: "evidence_submitted", label: "Evidence submitted" },
];

function formatAction(action: string): string {
  return action.replace(/_/g, " ");
}

export function AuditLogSection({ orgId, productId }: AuditLogSectionProps) {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  const baseUrl = `/api/org-assessments/${orgId}/products/${productId}/audit-log`;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const action = actionFilter === "_all" ? "" : actionFilter;
      const url = action ? `${baseUrl}?action=${encodeURIComponent(action)}` : baseUrl;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (loading && items.length === 0) {
    return (
      <TabContentFadeIn>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </TabContentFadeIn>
    );
  }

  return (
    <TabContentFadeIn>
      <ResultsSectionIntro
        description="Audit trail of key actions for this product: AI control acceptance, recommendations, release approval, and evidence."
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit log
          </CardTitle>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value || "_all"} value={opt.value || "_all"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">
              No audit entries yet. Actions such as accepting an AI control or approving release will appear here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium capitalize">
                      {formatAction(row.action)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.actorEmail || row.actorId}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[240px] truncate">
                      {row.payload && typeof row.payload === "object"
                        ? JSON.stringify(row.payload)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TabContentFadeIn>
  );
}
