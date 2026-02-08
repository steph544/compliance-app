import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { IMPLEMENTATION_SECTION_KEYS } from "@/lib/governance-implementation/types";
import type { SectionTracking } from "@/lib/governance-implementation/types";

interface Blueprint {
  threeLoD?: Array<{ line: number; role: string; description: string; assignedTo: string }>;
  roles?: Array<{ title: string; description: string; line: number }>;
  committees?: Array<{ name: string; members: string[]; cadence: string; charter: string }>;
  decisionRights?: Array<{ decision: string; responsible: string; accountable: string; consulted: string; informed: string }>;
  reviewCadence?: string;
  humanAiPatterns?: Array<{ pattern: string; description: string; whenToApply: string }>;
  whistleblower?: { channel: string; process: string; sla: string };
  escalation?: Array<{ level: number; trigger: string; owner: string; timeline: string }>;
}

function seedSectionsFromBlueprint(blueprint: Blueprint): SectionTracking[] {
  return IMPLEMENTATION_SECTION_KEYS.map((key) => {
    const base: SectionTracking = {
      key,
      status: "NOT_STARTED",
      dueDate: null,
      owner: "",
      notes: "",
      data: {},
    };

    switch (key) {
      case "threeLoD":
        base.data = {
          assignments: (blueprint.threeLoD ?? []).map((l) => ({
            line: l.line,
            assignedPerson: "",
          })),
        };
        break;
      case "roles":
        base.data = {
          assignments: (blueprint.roles ?? []).map((r) => ({
            title: r.title,
            assignedPerson: "",
          })),
        };
        break;
      case "committees":
        base.data = {
          committees: (blueprint.committees ?? []).map((c) => ({
            name: c.name,
            confirmedMembers: [],
            meetingSchedule: c.cadence ?? "",
            firstMeetingDate: null,
            charterConfirmed: false,
          })),
        };
        break;
      case "decisionRights":
        base.data = {
          decisions: (blueprint.decisionRights ?? []).map((d) => ({
            decision: d.decision,
            responsible: "",
            accountable: "",
            consulted: "",
            informed: "",
          })),
        };
        break;
      case "reviewCadence":
        base.data = {
          confirmedCadence: blueprint.reviewCadence ?? "",
          firstReviewDate: null,
          reviewOwner: "",
        };
        break;
      case "humanAiPatterns":
        base.data = {
          patterns: (blueprint.humanAiPatterns ?? []).map((p) => ({
            pattern: p.pattern,
            applicable: true,
            implementationNotes: "",
          })),
        };
        break;
      case "whistleblower":
        base.data = {
          channelUrl: "",
          processOwner: "",
          configuredSla: blueprint.whistleblower?.sla ?? "",
        };
        break;
      case "escalation":
        base.data = {
          levels: (blueprint.escalation ?? []).map((e) => ({
            level: String(e.level),
            assignedOwner: "",
            confirmedTimeline: e.timeline ?? "",
          })),
        };
        break;
    }

    return base;
  });
}

function deriveOverallStatus(sections: SectionTracking[]): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" {
  const statuses = sections.map((s) => s.status);
  if (statuses.every((s) => s === "COMPLETED")) return "COMPLETED";
  if (statuses.some((s) => s === "IN_PROGRESS" || s === "COMPLETED")) return "IN_PROGRESS";
  return "NOT_STARTED";
}

// GET: Load or auto-create implementation plan
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const assessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
    include: {
      result: {
        include: { implementation: true },
      },
    },
  });

  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!assessment.result) return NextResponse.json({ error: "Assessment not yet computed" }, { status: 404 });

  // Return existing implementation if it exists
  if (assessment.result.implementation) {
    return NextResponse.json(assessment.result.implementation);
  }

  // Create a new implementation seeded from the blueprint
  const blueprint = assessment.result.governanceBlueprint as Blueprint;
  const sections = seedSectionsFromBlueprint(blueprint);

  const implementation = await prisma.governanceImplementation.create({
    data: {
      resultId: assessment.result.id,
      sections: sections as unknown as any,
    },
  });

  return NextResponse.json(implementation);
}

// PATCH: Save section data on step transition
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { sectionIndex, section, currentStep } = body;

  const assessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
    include: {
      result: {
        include: { implementation: true },
      },
    },
  });

  if (!assessment?.result?.implementation) {
    return NextResponse.json({ error: "Implementation not found" }, { status: 404 });
  }

  const impl = assessment.result.implementation;
  const sections = (impl.sections as unknown as SectionTracking[]) ?? [];

  // Merge the incoming section data
  if (sectionIndex >= 0 && sectionIndex < sections.length) {
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      ...section,
      data: { ...sections[sectionIndex].data, ...(section.data ?? {}) },
    };
  }

  const overallStatus = deriveOverallStatus(sections);

  const updated = await prisma.governanceImplementation.update({
    where: { id: impl.id },
    data: {
      sections: sections as unknown as any,
      currentStep: currentStep ?? impl.currentStep,
      status: overallStatus,
    },
  });

  return NextResponse.json(updated);
}

// POST: Finalize implementation
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const assessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
    include: {
      result: {
        include: { implementation: true },
      },
    },
  });

  if (!assessment?.result?.implementation) {
    return NextResponse.json({ error: "Implementation not found" }, { status: 404 });
  }

  const updated = await prisma.governanceImplementation.update({
    where: { id: assessment.result.implementation.id },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json(updated);
}
