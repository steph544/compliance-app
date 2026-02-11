import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { logAudit } from "./audit";

vi.mock("@/lib/db", () => ({
  prisma: {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "log-1" }),
    },
  },
}));

describe("logAudit", () => {
  beforeEach(() => {
    vi.mocked(prisma.auditLog.create).mockClear();
  });

  it("calls prisma.auditLog.create with entityType, entityId, action, actorId", async () => {
    await logAudit({
      entityType: "ProductAssessment",
      entityId: "prod-123",
      action: "accept_ai_control",
      actorId: "user_abc",
    });
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        entityType: "ProductAssessment",
        entityId: "prod-123",
        action: "accept_ai_control",
        actorId: "user_abc",
        actorEmail: undefined,
        payload: undefined,
      },
    });
  });

  it("passes actorEmail and payload when provided", async () => {
    await logAudit({
      entityType: "ProductAssessment",
      entityId: "prod-456",
      action: "release_approval",
      actorId: "user_xyz",
      actorEmail: "approver@example.com",
      payload: { status: "APPROVED", comment: "All good" },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        entityType: "ProductAssessment",
        entityId: "prod-456",
        action: "release_approval",
        actorId: "user_xyz",
        actorEmail: "approver@example.com",
        payload: { status: "APPROVED", comment: "All good" },
      },
    });
  });
});
