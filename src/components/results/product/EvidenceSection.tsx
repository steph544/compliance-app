"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FileText, ExternalLink, Loader2 } from "lucide-react";

export interface EvidenceItemRow {
  id: string;
  controlId: string | null;
  taskIdentifier: string | null;
  requestedArtifact: string;
  status: "REQUESTED" | "COLLECTED" | "VERIFIED";
  linkUrl: string | null;
  note: string | null;
  createdAt: string;
}

interface EvidenceSectionProps {
  orgId: string;
  productId: string;
}

const STATUS_OPTIONS: EvidenceItemRow["status"][] = ["REQUESTED", "COLLECTED", "VERIFIED"];

export function EvidenceSection({ orgId, productId }: EvidenceSectionProps) {
  const [items, setItems] = useState<EvidenceItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newArtifact, setNewArtifact] = useState("");
  const [newControlId, setNewControlId] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newNote, setNewNote] = useState("");

  const baseUrl = `/api/org-assessments/${orgId}/products/${productId}/evidence`;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    const requestedArtifact = newArtifact.trim();
    if (!requestedArtifact) return;
    setAdding(true);
    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedArtifact,
          controlId: newControlId.trim() || undefined,
          linkUrl: newLink.trim() || undefined,
          note: newNote.trim() || undefined,
          status: "REQUESTED",
        }),
      });
      if (!res.ok) throw new Error("Failed to add");
      setNewArtifact("");
      setNewControlId("");
      setNewLink("");
      setNewNote("");
      await fetchItems();
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (eid: string, status: EvidenceItemRow["status"]) => {
    try {
      const res = await fetch(`${baseUrl}/${eid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchItems();
    } catch {
      // ignore
    }
  };

  if (loading) {
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
        description="Requested and collected evidence for controls and checklist tasks. Add links or notes and mark items as collected or verified."
      />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Add evidence request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="artifact">Requested artifact</Label>
              <Input
                id="artifact"
                placeholder="e.g. Test report, Security review"
                value={newArtifact}
                onChange={(e) => setNewArtifact(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="controlId">Control ID (optional)</Label>
              <Input
                id="controlId"
                placeholder="e.g. CTL-GOV-001"
                value={newControlId}
                onChange={(e) => setNewControlId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="Brief note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
            <Button onClick={handleAdd} disabled={adding || !newArtifact.trim()}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add evidence item"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evidence list</CardTitle>
            <p className="text-sm text-muted-foreground">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No evidence items yet. Add one above or derive requested artifacts from your Technical Controls and Implementation Checklist.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Control / Task</TableHead>
                    <TableHead>Artifact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link / Note</TableHead>
                    <TableHead className="w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">
                        {row.controlId || row.taskIdentifier || "—"}
                      </TableCell>
                      <TableCell>{row.requestedArtifact}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "VERIFIED"
                              ? "default"
                              : row.status === "COLLECTED"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {row.linkUrl ? (
                          <a
                            href={row.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary inline-flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Link
                          </a>
                        ) : null}
                        {row.note ? (
                          <span className="text-muted-foreground text-xs block truncate" title={row.note}>
                            {row.note}
                          </span>
                        ) : null}
                        {!row.linkUrl && !row.note ? "—" : null}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.status}
                          onValueChange={(v) => handleStatusChange(row.id, v as EvidenceItemRow["status"])}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </TabContentFadeIn>
  );
}
