import { prisma } from "@/lib/db";

export interface AuditLogInput {
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorEmail?: string | null;
  payload?: Record<string, unknown> | null;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actorId: input.actorId,
      actorEmail: input.actorEmail ?? undefined,
      payload: input.payload ?? undefined,
    },
  });
}
