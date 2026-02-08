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

  const exportData = {
    exportedAt: new Date().toISOString(),
    organization: {
      name: assessment.orgName,
      status: assessment.status,
      answers: assessment.answers,
    },
    result: assessment.result,
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
