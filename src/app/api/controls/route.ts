import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");
  const type = searchParams.get("type");
  const level = searchParams.get("level");
  const riskTag = searchParams.get("riskTag");

  const where: Record<string, unknown> = {};
  if (scope) where.scope = { in: [scope, "BOTH"] };
  if (type) where.type = type;
  if (level) where.implementationLevel = level;
  if (riskTag) where.riskTags = { has: riskTag };

  const controls = await prisma.control.findMany({
    where,
    include: { nistRefs: true },
    orderBy: { controlId: "asc" },
  });

  return NextResponse.json(controls);
}
