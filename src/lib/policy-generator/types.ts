export interface PolicySection {
  title: string;
  content: string;
  source?: string;
}

export interface PolicyDraft {
  title: string;
  sections: PolicySection[];
}
