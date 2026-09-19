export type WorkCategory = "dev" | "docs" | "testing" | "deploy" | "meeting" | "other";

/** One line of a journal: what was done, on which day, for which project. */
export type WorkEntry = {
  /** ISO day, YYYY-MM-DD. */
  date: string;
  /** `slug` of a site from `data/sites`; leave out for work not tied to a site. */
  siteSlug?: string;
  category: WorkCategory;
  /** Short line — what was done. */
  title: string;
  /** Optional detail: how, why, result. */
  details?: string;
  /** What exactly was done, step by step — shown as a list in the report. */
  steps?: string[];
  /** Outcome of the task: what now works / what was delivered. */
  result?: string;
  /** Time spent, in hours (0.5 steps are fine). */
  hours: number;
};

/** One employee's journal. Entries are plain data — add a line per piece of work. */
export type WorkJournal = {
  /** URL-safe id, also the route segment: /journals/:slug */
  slug: string;
  employee: string;
  role: string;
  /** Oldest first, like site versions. */
  entries: WorkEntry[];
};
