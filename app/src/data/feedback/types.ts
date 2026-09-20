export type FeedbackAction = "fix" | "add" | "change" | "remove" | "question" | "approve";
export type FeedbackStatus = "new" | "in_progress" | "done";

/** What the customer fills in; the site and version are taken from the open page. */
export type FeedbackDraft = {
  siteSlug: string;
  siteName: string;
  versionId: string;
  versionLabel: string;
  authorName: string;
  /** Normalized: +7XXXXXXXXXX. */
  phone: string;
  action: FeedbackAction;
  comment: string;
};

export type Feedback = FeedbackDraft & {
  id: number;
  status: FeedbackStatus;
  createdAt: Date;
};
