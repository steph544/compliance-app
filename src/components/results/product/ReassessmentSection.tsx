"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";
import { TabContentFadeIn } from "@/components/results/shared/TabContentFadeIn";
import { Loader2, Calendar, Trash2, RefreshCw } from "lucide-react";

export interface ReassessmentTriggerRow {
  id: string;
  triggerType: string;
  config: { intervalDays?: number; cron?: string };
  nextDueAt: string | null;
  lastCheckedAt: string | null;
  createdAt: string;
}

interface ReassessmentSectionProps {
  orgId: string;
  productId: string;
}

export function ReassessmentSection({ orgId, productId }: ReassessmentSectionProps) {
  const [triggers, setTriggers] = useState<ReassessmentTriggerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [intervalDays, setIntervalDays] = useState("90");
  const [reassessingId, setReassessingId] = useState<string | null>(null);

  const baseUrl = `/api/org-assessments/${orgId}/products/${productId}`;
  const triggersUrl = `${baseUrl}/reassessment-triggers`;

  const fetchTriggers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(triggersUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTriggers(data);
    } catch {
      setTriggers([]);
    } finally {
      setLoading(false);
    }
  }, [triggersUrl]);

  useEffect(() => {
    fetchTriggers();
  }, [fetchTriggers]);

  const handleAdd = async () => {
    const days = Math.max(1, Math.min(365, Number(intervalDays) || 90));
    setAdding(true);
    try {
      const res = await fetch(triggersUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType: "SCHEDULE",
          config: { intervalDays: days },
        }),
      });
      if (!res.ok) throw new Error("Failed to add");
      setIntervalDays("90");
      await fetchTriggers();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (tid: string) => {
    try {
      const res = await fetch(`${triggersUrl}/${tid}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchTriggers();
    } catch {
      // ignore
    }
  };

  const handleReassessNow = async (trigger: ReassessmentTriggerRow) => {
    setReassessingId(trigger.id);
    try {
      const computeRes = await fetch(`${baseUrl}/compute`, { method: "POST" });
      if (!computeRes.ok) throw new Error("Compute failed");

      const config = trigger.config as { intervalDays?: number };
      const intervalDaysNum = Number(config?.intervalDays) || 90;
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + intervalDaysNum);

      await fetch(`${triggersUrl}/${trigger.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastCheckedAt: new Date().toISOString(),
          nextDueAt: nextDue.toISOString(),
        }),
      });
      await fetchTriggers();
      window.location.reload();
    } catch {
      setReassessingId(null);
    } finally {
      setReassessingId(null);
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
        description="Schedule or track when this product assessment should be recomputed. Reassess now to run compute and set the next due date."
      />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Add trigger
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="grid gap-2">
              <Label htmlFor="intervalDays">Interval (days)</Label>
              <Input
                id="intervalDays"
                type="number"
                min={1}
                max={365}
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
              />
            </div>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add schedule"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Triggers</CardTitle>
            <p className="text-sm text-muted-foreground">
              {triggers.length} trigger{triggers.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardContent>
            {triggers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No reassessment triggers. Add one above (e.g. every 90 days).
              </p>
            ) : (
              <ul className="space-y-3">
                {triggers.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t.triggerType}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Every {(t.config as { intervalDays?: number })?.intervalDays ?? 90} days
                      </span>
                      {t.nextDueAt && (
                        <span className="text-xs text-muted-foreground">
                          Next due: {new Date(t.nextDueAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReassessNow(t)}
                        disabled={reassessingId !== null}
                      >
                        {reassessingId === t.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Reassess now
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(t.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </TabContentFadeIn>
  );
}
