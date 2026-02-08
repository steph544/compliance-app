import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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
      result: true,
      aiSystems: true,
      products: { include: { result: true } },
    },
  });

  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = assessment.result as Record<string, unknown> | null;
  const nistProgress = (result?.nistProgress ?? {}) as {
    implementedControlIds?: string[];
    controlNotes?: Record<string, string>;
  };
  const nistMapping = (result?.nistMapping ?? []) as Array<{
    controlId: string;
    controlName?: string;
    nistRef?: string;
    designation?: string;
  }>;
  const controlSelections = (result?.controlSelections ?? []) as Array<{
    controlId: string;
    designation?: string;
    owner?: string;
    reasoning?: string;
  }>;

  const controlIdToInfo = new Map<
    string,
    { controlName: string; nistRef?: string; designation?: string }
  >();
  for (const entry of nistMapping) {
    if (entry.controlId && !controlIdToInfo.has(entry.controlId)) {
      controlIdToInfo.set(entry.controlId, {
        controlName: entry.controlName ?? entry.controlId,
        nistRef: entry.nistRef,
        designation: entry.designation,
      });
    }
  }
  for (const sel of controlSelections) {
    if (sel.controlId && !controlIdToInfo.has(sel.controlId)) {
      controlIdToInfo.set(sel.controlId, {
        controlName: sel.controlId,
        designation: sel.designation,
      });
    }
  }

  const implementedIds = nistProgress.implementedControlIds ?? [];
  const controlNotes = nistProgress.controlNotes ?? {};
  const controlsDesignatedForImplementation = implementedIds.map((controlId) => {
    const info = controlIdToInfo.get(controlId);
    return {
      controlId,
      controlName: info?.controlName ?? controlId,
      nistRef: info?.nistRef,
      designation: info?.designation,
      note: controlNotes[controlId] ?? undefined,
    };
  });

  const exportData = {
    exportedAt: new Date().toISOString(),
    organization: {
      name: assessment.orgName,
      status: assessment.status,
      answers: assessment.answers,
    },
    result: assessment.result,
    controlsDesignatedForImplementation,
    aiSystems: assessment.aiSystems,
    productAssessments: assessment.products.map((p: any) => ({
      projectName: p.projectName,
      status: p.status,
      answers: p.answers,
      result: p.result,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${assessment.orgName.replace(/[^a-zA-Z0-9]/g, "_")}_assessment_export.json"`,
    },
  });
}
