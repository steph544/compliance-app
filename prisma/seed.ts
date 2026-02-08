/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { nistSeedData } from "../src/data/nist-seed";
import { controlsSeedData } from "../src/data/controls-seed";
import orgRules from "../src/data/org-rules-seed.json";
import productRules from "../src/data/product-rules-seed.json";

// Prisma 7: use runtime class directly (avoids ESM import.meta.url issue)
import { getPrismaClientClass } from "../src/generated/prisma/internal/class";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const PrismaClient = getPrismaClientClass();
const prisma = new PrismaClient({ adapter }) as any;

async function seedNist() {
  console.log("Seeding NIST reference data...");

  for (const func of nistSeedData.functions) {
    await prisma.nistFunction.upsert({
      where: { id: func.id },
      create: {
        id: func.id,
        name: func.name,
        description: func.description,
        sortOrder: func.sortOrder,
      },
      update: {
        name: func.name,
        description: func.description,
        sortOrder: func.sortOrder,
      },
    });

    for (const cat of func.categories) {
      await prisma.nistCategory.upsert({
        where: { id: cat.id },
        create: {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          functionId: func.id,
        },
        update: {
          name: cat.name,
          description: cat.description,
        },
      });

      for (const sub of cat.subcategories) {
        await prisma.nistSubcategory.upsert({
          where: { id: sub.id },
          create: {
            id: sub.id,
            description: sub.description,
            categoryId: cat.id,
          },
          update: {
            description: sub.description,
          },
        });
      }
    }
  }

  console.log("  NIST data seeded.");
}

async function seedControls() {
  console.log("Seeding controls...");

  for (const control of controlsSeedData) {
    const validRefs: string[] = [];
    for (const refId of control.nistRefIds) {
      const exists = await prisma.nistSubcategory.findUnique({ where: { id: refId } });
      if (exists) validRefs.push(refId);
      else console.warn(`  Warning: NIST ref ${refId} not found for control ${control.controlId}`);
    }

    await prisma.control.upsert({
      where: { controlId: control.controlId },
      create: {
        controlId: control.controlId,
        name: control.name,
        description: control.description,
        type: control.type as any,
        scope: control.scope as any,
        riskTags: control.riskTags,
        implementationLevel: control.implementationLevel as any,
        implementationSteps: control.implementationSteps,
        evidenceArtifacts: control.evidenceArtifacts,
        vendorGuidance: control.vendorGuidance || undefined,
        nistRefs: { connect: validRefs.map((id) => ({ id })) },
      },
      update: {
        name: control.name,
        description: control.description,
        type: control.type as any,
        scope: control.scope as any,
        riskTags: control.riskTags,
        implementationLevel: control.implementationLevel as any,
        implementationSteps: control.implementationSteps,
        evidenceArtifacts: control.evidenceArtifacts,
        vendorGuidance: control.vendorGuidance || undefined,
        nistRefs: { set: validRefs.map((id) => ({ id })) },
      },
    });
  }

  console.log(`  ${controlsSeedData.length} controls seeded.`);
}

async function seedRules() {
  console.log("Seeding rules...");

  const allRules = [
    ...orgRules.map((r: any) => ({ ...r, description: r.description || r.name })),
    ...productRules.map((r: any) => ({ ...r, description: r.description || r.name })),
  ];

  for (const rule of allRules) {
    const controlIds: string[] = rule.actions?.selectControls || [];
    const validControls: string[] = [];
    for (const cid of controlIds) {
      const exists = await prisma.control.findUnique({ where: { controlId: cid } });
      if (exists) validControls.push(exists.id);
      else console.warn(`  Warning: Control ${cid} not found for rule ${rule.ruleId}`);
    }

    await prisma.rule.upsert({
      where: { ruleId: rule.ruleId },
      create: {
        ruleId: rule.ruleId,
        name: rule.name,
        description: rule.description,
        priority: rule.priority || 100,
        conditions: rule.conditions,
        actions: rule.actions,
        controls: { connect: validControls.map((id) => ({ id })) },
      },
      update: {
        name: rule.name,
        description: rule.description,
        priority: rule.priority || 100,
        conditions: rule.conditions,
        actions: rule.actions,
        controls: { set: validControls.map((id) => ({ id })) },
      },
    });
  }

  console.log(`  ${allRules.length} rules seeded.`);
}

async function main() {
  console.log("Starting seed...\n");
  await seedNist();
  await seedControls();
  await seedRules();
  console.log("\nSeed complete!");
}

main()
  .catch((e: unknown) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
