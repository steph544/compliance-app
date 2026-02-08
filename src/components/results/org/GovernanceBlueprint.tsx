"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";

interface ThreeLoD {
  line: number;
  role: string;
  description: string;
  assignedTo: string;
}

interface Role {
  title: string;
  description: string;
  line: number;
}

interface Committee {
  name: string;
  members: string[];
  cadence: string;
  charter: string;
}

interface DecisionRight {
  decision: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
}

interface HumanAiPattern {
  pattern: string;
  description: string;
  whenToApply: string;
}

interface Whistleblower {
  channel: string;
  process: string;
  sla: string;
}

interface EscalationLevel {
  level: number;
  trigger: string;
  owner: string;
  timeline: string;
}

interface GovernanceBlueprintProps {
  blueprint: {
    threeLoD: ThreeLoD[];
    roles: Role[];
    committees: Committee[];
    decisionRights: DecisionRight[];
    reviewCadence: string;
    humanAiPatterns: HumanAiPattern[];
    whistleblower: Whistleblower;
    escalation: EscalationLevel[];
  };
}

const raciColors: Record<string, string> = {
  R: "bg-blue-50 text-blue-800 font-medium",
  A: "bg-green-50 text-green-800 font-medium",
  C: "bg-yellow-50 text-yellow-800",
  I: "bg-gray-50 text-gray-600",
};

function RaciCell({ value, type }: { value: string; type: string }) {
  const letter = type.charAt(0).toUpperCase();
  const colorClass = raciColors[letter] ?? "";
  return (
    <TableCell className={colorClass}>
      {value}
    </TableCell>
  );
}

const escalationColors: Record<number, string> = {
  1: "#eab308",
  2: "#f97316",
  3: "#475569",
};

export function GovernanceBlueprint({ blueprint }: GovernanceBlueprintProps) {
  return (
    <div className="space-y-10">
      {/* Three Lines of Defense */}
      <FadeIn>
        <section>
          <h3 className="text-lg font-semibold mb-4">Three Lines of Defense</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(blueprint.threeLoD ?? []).map((line) => (
                <TableRow
                  key={line.line}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{line.line}</TableCell>
                  <TableCell>{line.role}</TableCell>
                  <TableCell className="max-w-md whitespace-normal">
                    {line.description}
                  </TableCell>
                  <TableCell>{line.assignedTo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </FadeIn>

      <Separator />

      {/* Roles */}
      <FadeIn delay={0.1}>
        <section>
          <h3 className="text-lg font-semibold mb-4">Roles</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Line</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(blueprint.roles ?? []).map((role) => (
                <TableRow
                  key={role.title}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{role.title}</TableCell>
                  <TableCell className="max-w-md whitespace-normal">
                    {role.description}
                  </TableCell>
                  <TableCell>{role.line}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </FadeIn>

      <Separator />

      {/* Committees */}
      <FadeIn delay={0.15}>
        <section>
          <h3 className="text-lg font-semibold mb-4">Committees</h3>
          <StaggeredList className="grid gap-4 md:grid-cols-2">
            {(blueprint.committees ?? []).map((committee) => (
              <StaggeredItem key={committee.name}>
                <Card className="transition-card hover-lift">
                  <CardHeader>
                    <CardTitle className="text-base">{committee.name}</CardTitle>
                    <CardDescription>Cadence: {committee.cadence}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Members</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {(Array.isArray(committee.members)
                          ? committee.members
                          : [committee.members].filter(Boolean)
                        ).map((member) => (
                          <li key={member}>{member}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Charter</p>
                      <p className="text-sm text-muted-foreground">
                        {committee.charter}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </section>
      </FadeIn>

      <Separator />

      {/* Decision Rights (RACI) */}
      <FadeIn delay={0.2}>
        <section>
          <h3 className="text-lg font-semibold mb-4">
            Decision Rights (RACI Matrix)
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Decision</TableHead>
                <TableHead className="bg-blue-50/50">Responsible</TableHead>
                <TableHead className="bg-green-50/50">Accountable</TableHead>
                <TableHead className="bg-yellow-50/50">Consulted</TableHead>
                <TableHead className="bg-gray-50/50">Informed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(blueprint.decisionRights ?? []).map((dr) => (
                <TableRow
                  key={dr.decision}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium max-w-xs whitespace-normal">
                    {dr.decision}
                  </TableCell>
                  <RaciCell value={dr.responsible} type="R" />
                  <RaciCell value={dr.accountable} type="A" />
                  <RaciCell value={dr.consulted} type="C" />
                  <RaciCell value={dr.informed} type="I" />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </FadeIn>

      <Separator />

      {/* Review Cadence */}
      <FadeIn delay={0.25}>
        <section>
          <h3 className="text-lg font-semibold mb-2">Review Cadence</h3>
          <p className="text-sm text-muted-foreground">
            {blueprint.reviewCadence}
          </p>
        </section>
      </FadeIn>

      <Separator />

      {/* Human-AI Patterns */}
      <FadeIn delay={0.3}>
        <section>
          <h3 className="text-lg font-semibold mb-4">
            Human-AI Interaction Patterns
          </h3>
          <StaggeredList className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(blueprint.humanAiPatterns ?? []).map((pattern) => (
              <StaggeredItem key={pattern.pattern}>
                <Card className="transition-card hover-lift">
                  <CardHeader>
                    <CardTitle className="text-base">{pattern.pattern}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {pattern.description}
                    </p>
                    <div>
                      <p className="text-sm font-medium">When to Apply</p>
                      <p className="text-sm text-muted-foreground">
                        {pattern.whenToApply}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </section>
      </FadeIn>

      <Separator />

      {/* Whistleblower */}
      <FadeIn delay={0.35}>
        <section>
          <h3 className="text-lg font-semibold mb-4">Whistleblower Mechanism</h3>
          <Card className="transition-card hover-lift">
            <CardContent className="grid gap-4 md:grid-cols-3 pt-6">
              <div>
                <p className="text-sm font-medium mb-1">Channel</p>
                <p className="text-sm text-muted-foreground">
                  {blueprint.whistleblower?.channel}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Process</p>
                <p className="text-sm text-muted-foreground">
                  {blueprint.whistleblower?.process}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">SLA</p>
                <p className="text-sm text-muted-foreground">
                  {blueprint.whistleblower?.sla}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </FadeIn>

      <Separator />

      {/* Escalation */}
      <FadeIn delay={0.4}>
        <section>
          <h3 className="text-lg font-semibold mb-4">Escalation Matrix</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Timeline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(blueprint.escalation ?? []).map((level) => (
                <TableRow
                  key={level.level}
                  className="hover:bg-muted/50 transition-colors"
                  style={{
                    borderLeft: `4px solid ${escalationColors[level.level] ?? "#94a3b8"}`,
                  }}
                >
                  <TableCell className="font-medium">{level.level}</TableCell>
                  <TableCell className="max-w-sm whitespace-normal">
                    {level.trigger}
                  </TableCell>
                  <TableCell>{level.owner}</TableCell>
                  <TableCell>{level.timeline}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </FadeIn>
    </div>
  );
}
