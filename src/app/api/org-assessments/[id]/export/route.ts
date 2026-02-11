import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { parseSectionIds } from "@/lib/download-sections";
import { getOrgSectionContent } from "@/lib/export/org-section-content";
import { renderSectionsToPdfBuffer } from "@/lib/export/render-pdf";
import { renderSectionsToDocxBuffer } from "@/lib/export/render-docx";

export async function GET(
  request: NextRequest,
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

  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format");
  const sectionsParam = searchParams.get("sections") ?? searchParams.getAll("sections");

  if (format === "pdf" || format === "docx") {
    const sectionIds = parseSectionIds("org", sectionsParam);
    if (sectionIds.length === 0) {
      return NextResponse.json(
        { error: "At least one valid section is required for PDF or Word download" },
        { status: 400 }
      );
    }

    const orgAssessment = {
      orgName: assessment.orgName,
      result: assessment.result as Record<string, unknown> | null,
      answers: assessment.answers as Record<string, unknown> | null,
      products: assessment.products.map((p: { projectName: string; result: unknown }) => ({
        projectName: p.projectName,
        result: p.result as { riskTier?: string } | null,
      })),
    };

    const contents = sectionIds
      .map((sid) => getOrgSectionContent(sid, orgAssessment))
      .filter((c): c is NonNullable<typeof c> => c != null);

    if (contents.length === 0) {
      return NextResponse.json({ error: "No content for selected sections" }, { status: 400 });
    }

    const safeName = assessment.orgName.replace(/[^a-zA-Z0-9]/g, "_");
    const ext = format === "pdf" ? "pdf" : "docx";
    const filename = `${safeName}_assessment_report.${ext}`;

    if (format === "pdf") {
      const buffer = renderSectionsToPdfBuffer(contents);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const buffer = await renderSectionsToDocxBuffer(contents);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

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
    productAssessments: assessment.products.map((p: { projectName: string; status: string; answers: unknown; result: unknown }) => ({
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
