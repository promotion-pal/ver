export type StageStatus = "planned" | "in_progress" | "done";

/** What the team fills in for one stage of a scheme's work plan. */
export type StageDraft = {
  title: string;
  details: string;
  /** ISO days, YYYY-MM-DD; "" when not set. */
  startDate: string;
  dueDate: string;
  status: StageStatus;
};

export type Stage = StageDraft & {
  id: number;
  siteSlug: string;
  schemeId: string;
};
