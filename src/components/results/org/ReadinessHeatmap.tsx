"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animation/FadeIn";
import { cn } from "@/lib/utils";

const MATURITY_LEVELS: { score: number; label: string; short: string }[] = [
  { score: 1, label: "Not Started", short: "Not started" },
  { score: 2, label: "Beginning", short: "Beginning" },
  { score: 3, label: "Developing", short: "Developing" },
  { score: 4, label: "Mature", short: "Mature" },
];

const SCORE_COLORS: Record<number, string> = {
  1: "var(--muted-foreground)",
  2: "var(--accent-primary)",
  3: "#eab308",
  4: "#22c55e",
};

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  governance: "Policies, roles, and decision rights for AI",
  data: "Data quality, pipelines, and governance",
  technology: "Infrastructure, tools, and integration",
  people: "Skills, training, and change management",
  riskCompliance: "Risk controls and regulatory alignment",
};

const dimensionLabels: Record<string, string> = {
  governance: "Governance",
  data: "Data",
  technology: "Technology",
  people: "People",
  riskCompliance: "Risk & Compliance",
};

interface Dimension {
  name: string;
  score: number;
  recommendation: string;
}

interface ReadinessHeatmapProps {
  heatmap: {
    dimensions: Dimension[];
    recommendations: string[];
  };
}

export function ReadinessHeatmap({ heatmap }: ReadinessHeatmapProps) {
  const dimensions = heatmap.dimensions ?? [];

  return (
    <div className="space-y-8">
      {/* Section title and explainer */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Readiness Heatmap</h3>
        <p className="text-sm text-muted-foreground max-w-2xl">
          This view shows how mature your organization is across five key areas for AI governance.
          Each area is scored from 1 (Not started) to 4 (Mature). Use the bars and recommendations
          below to see where to focus next.
        </p>
        {/* Scale legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Maturity scale
          </span>
          <div className="flex flex-wrap gap-3">
            {MATURITY_LEVELS.map(({ score, label }) => (
              <div key={score} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: SCORE_COLORS[score] ?? "#94a3b8" }}
                />
                <span className="text-xs text-muted-foreground">
                  {score} = {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maturity bars (replaces radar) */}
      {dimensions.length > 0 && (
        <FadeIn>
          <Card className="border-border bg-card-gradient overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Maturity by area</CardTitle>
              <p className="text-muted-foreground text-sm font-normal">
                Each bar shows your current level (1–4) for that area.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {dimensions.map((dim) => {
                const label = dimensionLabels[dim.name] ?? dim.name;
                const desc = DIMENSION_DESCRIPTIONS[dim.name];
                const color = SCORE_COLORS[dim.score] ?? "#94a3b8";
                const level = MATURITY_LEVELS.find((l) => l.score === dim.score)?.label ?? `Score ${dim.score}`;
                return (
                  <div key={dim.name} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-sm font-medium">{label}</span>
                        {desc && (
                          <span className="text-muted-foreground text-xs ml-2">— {desc}</span>
                        )}
                      </div>
                      <span
                        className="text-xs font-medium tabular-nums shrink-0"
                        style={{ color }}
                      >
                        {dim.score}/4 · {level}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={cn(
                            "h-2 flex-1 rounded-sm transition-colors",
                            step > dim.score && "bg-muted"
                          )}
                          style={
                            step <= dim.score
                              ? { backgroundColor: color }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Overall recommendations */}
      {heatmap.recommendations?.length > 0 && (
        <FadeIn delay={0.2}>
          <Card className="border-border bg-card-gradient">
            <CardHeader>
              <CardTitle className="text-base">Overall recommendations</CardTitle>
              <p className="text-muted-foreground text-sm font-normal">
                Priority actions across all areas.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {heatmap.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-accent-primary mt-0.5 shrink-0 font-bold">
                      →
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
