import type { WorkJournal } from "@/data/journals/types";
import { rostislav } from "@/data/journals/rostislav";

/**
 * Every journal shown in the hub lives here as one entry. To add an
 * employee: copy `_template.ts`, fill it in, and add it to this array.
 */
export const journals: WorkJournal[] = [rostislav];

export function getJournal(slug: string): WorkJournal | undefined {
  return journals.find((journal) => journal.slug === slug);
}
