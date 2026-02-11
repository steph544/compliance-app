import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { parseSectionIds } from "@/lib/download-sections";
import { getProductSectionContent } from "@/lib/export/product-section-content";
import { renderSectionsToPdfBuffer } from "@/lib/export/render-pdf";
import { renderSectionsToDocxBuffer } from "@/lib/export/render-docx";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = await prisma.productAssessment.findFirst({
    where: { id: pid, orgAssessmentId: id },
    include: { result: true },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format");
  const sectionsParam = searchParams.get("sections") ?? searchParams.getAll("sections");

  if (format === "pdf" || format === "docx") {
    const sectionIds = parseSectionIds("product", sectionsParam);
    if (sectionIds.length === 0) {
      return NextResponse.json(
        { error: "At least one valid section is required for PDF or Word download" },
        { status: 400 }
      );
    }

    const productAssessment = {
      projectName: product.projectName,
      result: product.result as Record<string, unknown> | null,
      answers: product.answers as Record<string, unknown> | null,
    };

    const contents = sectionIds
      .map((sid) => getProductSectionContent(sid, productAssessment))
      .filter((c): c is NonNullable<typeof c> => c != null);

    if (contents.length === 0) {
      return NextResponse.json({ error: "No content for selected sections" }, { status: 400 });
    }

    const safeName = product.projectName.replace(/[^a-zA-Z0-9]/g, "_");
    const ext = format === "pdf" ? "pdf" : "docx";
    const filename = `${safeName}_product_report.${ext}`;

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

  const exportData = {
    exportedAt: new Date().toISOString(),
    project: {
      name: product.projectName,
      status: product.status,
      answers: product.answers,
    },
    result: product.result,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${product.projectName.replace(/[^a-zA-Z0-9]/g, "_")}_product_export.json"`,
    },
  });
}
