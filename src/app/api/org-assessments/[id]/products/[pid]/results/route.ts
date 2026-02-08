import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
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
  if (!product.result) return NextResponse.json({ error: "Product not yet computed" }, { status: 404 });

  return NextResponse.json(product.result);
}
