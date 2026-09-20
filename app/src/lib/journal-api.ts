import { Code, ConnectError } from "@connectrpc/connect";
import type { Journal, WorkEntry as WorkEntryMessage } from "@ver/proto/entity/journal.entity_pb";
import { WorkCategory } from "@ver/proto/enum/journal.enum_pb";
import type { WorkCategory as Category, WorkEntry, WorkEntryDraft, WorkJournal } from "@/data/journals/types";
import { journalClient, workEntryClient } from "@/lib/api";
import type { DateRange } from "@/lib/journal";

const CATEGORY_TO_PROTO: Record<Category, WorkCategory> = {
  dev: WorkCategory.DEV,
  docs: WorkCategory.DOCS,
  testing: WorkCategory.TESTING,
  deploy: WorkCategory.DEPLOY,
  meeting: WorkCategory.MEETING,
  other: WorkCategory.OTHER,
};

const CATEGORY_FROM_PROTO = new Map<WorkCategory, Category>(
  Object.entries(CATEGORY_TO_PROTO).map(([category, proto]) => [proto, category as Category]),
);

function toJournal(j: Journal): WorkJournal {
  return { id: Number(j.id), slug: j.slug, employee: j.employee, role: j.role };
}

function toEntry(e: WorkEntryMessage): WorkEntry {
  return {
    id: Number(e.id),
    journalId: Number(e.journalId),
    date: e.date,
    siteSlug: e.siteSlug,
    category: CATEGORY_FROM_PROTO.get(e.category) ?? "other",
    title: e.title,
    details: e.details,
    steps: e.steps,
    result: e.result,
    hours: e.hours,
  };
}

function toRequestFields(draft: WorkEntryDraft) {
  return {
    date: draft.date,
    siteSlug: draft.siteSlug,
    category: CATEGORY_TO_PROTO[draft.category],
    title: draft.title,
    details: draft.details,
    steps: draft.steps,
    result: draft.result,
    hours: draft.hours,
  };
}

export async function listJournals(): Promise<WorkJournal[]> {
  const res = await journalClient.journalList({});
  return res.journals.map(toJournal);
}

/** Resolves to `null` when there is no journal with this slug. */
export async function getJournal(slug: string): Promise<WorkJournal | null> {
  try {
    const res = await journalClient.journalBySlug({ slug });
    return res.entity ? toJournal(res.entity) : null;
  } catch (error) {
    if (error instanceof ConnectError && error.code === Code.NotFound) return null;
    throw error;
  }
}

export async function createJournal(input: { slug: string; employee: string; role: string }) {
  await journalClient.journalCreate(input);
}

/** Entries of one journal (or of all journals) within an inclusive day range. */
export async function fetchEntries(filter: { journalId?: number; range?: DateRange } = {}): Promise<WorkEntry[]> {
  const res = await workEntryClient.workEntryFetch({
    journalId: filter.journalId === undefined ? undefined : BigInt(filter.journalId),
    fromDate: filter.range?.from,
    toDate: filter.range?.to,
  });
  return res.entries.map(toEntry);
}

export async function createEntry(journalId: number, draft: WorkEntryDraft) {
  await workEntryClient.workEntryCreate({ journalId: BigInt(journalId), ...toRequestFields(draft) });
}

export async function updateEntry(id: number, draft: WorkEntryDraft) {
  await workEntryClient.workEntryUpdate({ id: BigInt(id), ...toRequestFields(draft) });
}

export async function deleteEntry(id: number) {
  await workEntryClient.workEntryDelete({ id: BigInt(id) });
}

/** A human-readable message for an API failure. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ConnectError) {
    if (error.code === Code.Unavailable) return "Сервер недоступен. Попробуйте позже.";
    return error.rawMessage;
  }
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
