/** Neutral content blocks for PDF/DOCX export */

export type ContentBlock =
  | { type: "text"; content: string }
  | { type: "heading"; level: 1 | 2 | 3; content: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface SectionContent {
  title: string;
  blocks: ContentBlock[];
}
