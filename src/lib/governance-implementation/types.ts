export const IMPLEMENTATION_SECTION_KEYS = [
  "threeLoD",
  "roles",
  "committees",
  "decisionRights",
  "reviewCadence",
  "humanAiPatterns",
  "whistleblower",
  "escalation",
] as const;

export type SectionKey = (typeof IMPLEMENTATION_SECTION_KEYS)[number];

export type SectionStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface SectionTracking {
  key: SectionKey;
  status: SectionStatus;
  dueDate: string | null;
  owner: string;
  notes: string;
  data: Record<string, unknown>;
}

// Per-section data shapes

export interface ThreeLoDAssignment {
  line: number;
  assignedPerson: string;
}

export interface RoleAssignment {
  title: string;
  assignedPerson: string;
}

export interface CommitteeImplementation {
  name: string;
  confirmedMembers: string[];
  meetingSchedule: string;
  firstMeetingDate: string | null;
  charterConfirmed: boolean;
}

export interface DecisionRightAssignment {
  decision: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
}

export interface ReviewCadenceImplementation {
  confirmedCadence: string;
  firstReviewDate: string | null;
  reviewOwner: string;
}

export interface HumanAiPatternImplementation {
  pattern: string;
  applicable: boolean;
  implementationNotes: string;
}

export interface WhistleblowerImplementation {
  channelUrl: string;
  processOwner: string;
  configuredSla: string;
}

export interface EscalationAssignment {
  level: string;
  assignedOwner: string;
  confirmedTimeline: string;
}
