import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewOrgPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const assessment = await prisma.orgAssessment.create({
    data: {
      orgName: "Untitled Assessment",
      userId,
      answers: {},
    },
  });

  redirect(`/org/${assessment.id}/wizard`);
}
