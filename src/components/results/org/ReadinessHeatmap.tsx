"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart } from "@/components/charts/RadarChart";
import { StatCard } from "@/components/ui/stat-card";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";

const scoreLabels: Record<number, string> = {
  1: "Not Started",
  2: "Beginning",
  3: "Developing",
  4: "Mature",
};

const scoreColors: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
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

  const radarData = dimensions.map((d) => ({
    name: dimensionLabels[d.name] ?? d.name,
    value: d.score,
    fullMark: 4,
  }));

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Readiness Heatmap</h3>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Maturity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart dimensions={radarData} height={340} />
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Dimension Stat Cards */}
      <StaggeredList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {dimensions.map((dimension) => (
          <StaggeredItem key={dimension.name}>
            <StatCard
              value={`${dimension.score}/4`}
              label={dimensionLabels[dimension.name] ?? dimension.name}
              accentColor={scoreColors[dimension.score] ?? "#94a3b8"}
            />
          </StaggeredItem>
        ))}
      </StaggeredList>

      {/* Dimension Recommendations */}
      <StaggeredList className="space-y-4">
        {dimensions.map((dimension) => (
          <StaggeredItem key={dimension.name}>
            <Card className="transition-card hover-lift">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        scoreColors[dimension.score] ?? "#94a3b8",
                    }}
                  />
                  <h4 className="text-sm font-medium">
                    {dimensionLabels[dimension.name] ?? dimension.name}
                  </h4>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {scoreLabels[dimension.score] ?? `Score: ${dimension.score}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {dimension.recommendation}
                </p>
              </CardContent>
            </Card>
          </StaggeredItem>
        ))}
      </StaggeredList>

      {/* Overall Recommendations */}
      {heatmap.recommendations?.length > 0 && (
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Overall Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {heatmap.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-0.5 shrink-0">
                      &#8594;
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
