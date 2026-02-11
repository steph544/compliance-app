"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface ReleaseApprovalState {
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy: string | null;
  approvedAt: string | null;
  comment: string | null;
}

interface ReleaseApprovalCardProps {
  orgId: string;
  productId: string;
}

export function ReleaseApprovalCard({ orgId, productId }: ReleaseApprovalCardProps) {
  const [state, setState] = useState<ReleaseApprovalState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [action, setAction] = useState<"APPROVED" | "REJECTED" | null>(null);

  const baseUrl = `/api/org-assessments/${orgId}/products/${productId}/release-approval`;

  const fetchApproval = async () => {
    setLoading(true);
    try {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setState({
        status: data.status,
        approvedBy: data.approvedBy ?? null,
        approvedAt: data.approvedAt ?? null,
        comment: data.comment ?? null,
      });
    } catch {
      setState({ status: "PENDING", approvedBy: null, approvedAt: null, comment: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproval();
  }, [orgId, productId]);

  const handleSubmit = async (status: "APPROVED" | "REJECTED") => {
    setSubmitting(true);
    setAction(status);
    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comment: comment.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setComment("");
      await fetchApproval();
    } finally {
      setSubmitting(false);
      setAction(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isPending = state?.status === "PENDING";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Release approval</CardTitle>
        <p className="text-sm text-muted-foreground">
          Mark release criteria as approved or rejected and record who signed off.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge
            variant={
              state?.status === "APPROVED"
                ? "default"
                : state?.status === "REJECTED"
                  ? "destructive"
                  : "secondary"
            }
          >
            {state?.status ?? "PENDING"}
          </Badge>
          {state?.approvedAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(state.approvedAt).toLocaleString()}
              {state.approvedBy ? ` by ${state.approvedBy}` : ""}
            </span>
          )}
        </div>
        {state?.comment && (
          <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
            {state.comment}
          </p>
        )}
        {isPending && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="approval-comment">Comment (optional)</Label>
              <Input
                id="approval-comment"
                placeholder="e.g. All criteria met; approved for release"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmit("APPROVED")}
                disabled={submitting}
              >
                {submitting && action === "APPROVED" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve release
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleSubmit("REJECTED")}
                disabled={submitting}
              >
                {submitting && action === "REJECTED" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
