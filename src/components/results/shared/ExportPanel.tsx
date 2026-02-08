"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExportPanelProps {
  type: "org" | "product";
  exportUrl: string;
}

export function ExportPanel({ type, exportUrl }: ExportPanelProps) {
  const formats = [
    { label: "PDF Report", format: "pdf" },
    { label: "JSON Data", format: "json" },
    { label: "CSV Summary", format: "csv" },
    { label: "Markdown", format: "md" },
  ];

  const handleExport = (format: string) => {
    const url = `${exportUrl}?format=${format}`;
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Export {type === "org" ? "Organization" : "Product"} Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Download the {type === "org" ? "organization" : "product"} assessment
          results in your preferred format.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {formats.map(({ label, format }) => (
            <Button
              key={format}
              variant="outline"
              onClick={() => handleExport(format)}
              className="w-full"
            >
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
