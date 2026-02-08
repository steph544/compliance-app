import { z } from "zod";

export const sectionTrackingSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
  dueDate: z.string().nullable(),
  owner: z.string(),
  notes: z.string(),
});

// Step 1: Three Lines of Defense
export const step1Schema = z.object({
  tracking: sectionTrackingSchema,
  assignments: z.array(
    z.object({
      line: z.number(),
      assignedPerson: z.string(),
    })
  ),
});

// Step 2: Governance Roles
export const step2Schema = z.object({
  tracking: sectionTrackingSchema,
  assignments: z.array(
    z.object({
      title: z.string(),
      assignedPerson: z.string(),
    })
  ),
});

// Step 3: Committees
export const step3Schema = z.object({
  tracking: sectionTrackingSchema,
  committees: z.array(
    z.object({
      name: z.string(),
      confirmedMembers: z.array(z.string()),
      meetingSchedule: z.string(),
      firstMeetingDate: z.string().nullable(),
      charterConfirmed: z.boolean(),
    })
  ),
});

// Step 4: Decision Rights (RACI)
export const step4Schema = z.object({
  tracking: sectionTrackingSchema,
  decisions: z.array(
    z.object({
      decision: z.string(),
      responsible: z.string(),
      accountable: z.string(),
      consulted: z.string(),
      informed: z.string(),
    })
  ),
});

// Step 5: Review Cadence
export const step5Schema = z.object({
  tracking: sectionTrackingSchema,
  confirmedCadence: z.string(),
  firstReviewDate: z.string().nullable(),
  reviewOwner: z.string(),
});

// Step 6: Human-AI Oversight Patterns
export const step6Schema = z.object({
  tracking: sectionTrackingSchema,
  patterns: z.array(
    z.object({
      pattern: z.string(),
      applicable: z.boolean(),
      implementationNotes: z.string(),
    })
  ),
});

// Step 7: Whistleblower Mechanism
export const step7Schema = z.object({
  tracking: sectionTrackingSchema,
  channelUrl: z.string(),
  processOwner: z.string(),
  configuredSla: z.string(),
});

// Step 8: Escalation Matrix
export const step8Schema = z.object({
  tracking: sectionTrackingSchema,
  levels: z.array(
    z.object({
      level: z.string(),
      assignedOwner: z.string(),
      confirmedTimeline: z.string(),
    })
  ),
});

export const implementationStepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
];
