import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const functions = await prisma.nistFunction.findMany({
    include: {
      categories: {
        include: {
          subcategories: true,
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(functions);
}
