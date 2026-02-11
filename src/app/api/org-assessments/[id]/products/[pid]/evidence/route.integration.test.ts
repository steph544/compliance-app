import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

const mockEvidenceItem = {
  id: "ev-1",
  productAssessmentId: "pid-1",
  controlId: null,
  taskIdentifier: null,
  requestedArtifact: "Test report",
  status: "REQUESTED",
  linkUrl: null,
  note: null,
  uploadedFileKey: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn().mockResolvedValue({ userId: "user-1" }) }));
vi.mock("@/lib/db", () => ({
  prisma: {
    orgAssessment: { findFirst: vi.fn() },
    productAssessment: { findFirst: vi.fn() },
    evidenceItem: { findMany: vi.fn(), create: vi.fn() },
  },
}));

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

describe("Evidence API", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({ userId: "user-1" } as any);
    vi.mocked(prisma.orgAssessment.findFirst).mockResolvedValue({ id: "org-1" } as any);
    vi.mocked(prisma.productAssessment.findFirst).mockResolvedValue({ id: "pid-1" } as any);
    vi.mocked(prisma.evidenceItem.findMany).mockResolvedValue([]);
    vi.mocked(prisma.evidenceItem.create).mockResolvedValue(mockEvidenceItem as any);
  });

  it("GET returns list of evidence items", async () => {
    vi.mocked(prisma.evidenceItem.findMany).mockResolvedValue([mockEvidenceItem] as any);
    const res = await GET(
      new Request("http://localhost"),
      { params: Promise.resolve({ id: "org-1", pid: "pid-1" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty("requestedArtifact", "Test report");
  });

  it("POST creates evidence item with requestedArtifact", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ requestedArtifact: "Security review" }),
      }),
      { params: Promise.resolve({ id: "org-1", pid: "pid-1" }) }
    );
    expect(res.status).toBe(200);
    expect(prisma.evidenceItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productAssessmentId: "pid-1",
        requestedArtifact: "Security review",
        status: "REQUESTED",
      }),
    });
  });

  it("POST returns 400 when requestedArtifact is missing", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "org-1", pid: "pid-1" }) }
    );
    expect(res.status).toBe(400);
  });
});
