export type WorkCategory = "dev" | "docs" | "testing" | "deploy" | "meeting" | "other";

/** One employee's journal, as served by the API. */
export type WorkJournal = {
  id: number;
  /** URL-safe id, also the route segment: /journals/:slug */
  slug: string;
  employee: string;
  role: string;
};

/** The editable part of a work entry — what the entry form fills in. */
export type WorkEntryDraft = {
  /** ISO day, YYYY-MM-DD. */
  date: string;
  /** `slug` of a site from `data/sites`; empty for work not tied to a site. */
  siteSlug: string;
  category: WorkCategory;
  /** Short line — what was done. */
  title: string;
  /** Optional detail: how, why. */
  details: string;
  /** What exactly was done, step by step — shown as a list in the report. */
  steps: string[];
  /** Outcome of the task: what now works / what was delivered. */
  result: string;
  /** Time spent, in hours (0.5 steps are fine). */
  hours: number;
};

/** One task done on one day. Several entries with the same date are several tasks of that day. */
export type WorkEntry = WorkEntryDraft & {
  id: number;
  journalId: number;
};
