import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const product = await prisma.productAssessment.create({
    data: {
      orgAssessmentId: id,
      userId,
      projectName: "Untitled Product",
      answers: {},
    },
  });

  redirect(`/org/${id}/product/${product.id}/wizard`);
}
