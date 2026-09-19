import { getSite } from "@/data/sites";
import type { WorkCategory, WorkEntry } from "@/data/journals/types";

export type Period = "day" | "week" | "month";
/** Inclusive ISO days. */
export type DateRange = { from: string; to: string };

export const PERIOD_LABEL: Record<Period, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
};

export const CATEGORY_LABEL: Record<WorkCategory, string> = {
  dev: "Разработка",
  docs: "Документация",
  testing: "Тестирование",
  deploy: "Деплой",
  meeting: "Встречи",
  other: "Другое",
};

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parses a YYYY-MM-DD day as local time, so time zones never shift the date. */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const todayISO = () => toISO(new Date());

export function rangeFor(anchor: string, period: Period): DateRange {
  const d = fromISO(anchor);
  if (period === "day") return { from: anchor, to: anchor };
  if (period === "week") {
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { from: toISO(monday), to: toISO(sunday) };
  }
  return {
    from: toISO(new Date(d.getFullYear(), d.getMonth(), 1)),
    to: toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
  };
}

export function shiftAnchor(anchor: string, period: Period, direction: 1 | -1): string {
  const d = fromISO(anchor);
  if (period === "day") return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + direction));
  if (period === "week") return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7 * direction));
  return toISO(new Date(d.getFullYear(), d.getMonth() + direction, 1));
}

export function inRange(date: string, range: DateRange): boolean {
  return date >= range.from && date <= range.to;
}

export function eachDay(range: DateRange): string[] {
  const days: string[] = [];
  for (let d = fromISO(range.from); toISO(d) <= range.to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    days.push(toISO(d));
  }
  return days;
}

const dayMonth = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
const dayMonthYear = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
const weekday = new Intl.DateTimeFormat("ru-RU", { weekday: "long" });
const monthYear = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });

export function formatDate(iso: string, withWeekday = false): string {
  const d = fromISO(iso);
  return withWeekday ? `${dayMonthYear.format(d)}, ${weekday.format(d)}` : dayMonthYear.format(d);
}

export function formatRange(range: DateRange, period: Period): string {
  const from = fromISO(range.from);
  const to = fromISO(range.to);
  if (period === "day") return dayMonthYear.format(from);
  if (period === "month") return monthYear.format(from).replace(/\s?г\.$/, "");
  if (from.getFullYear() !== to.getFullYear()) return `${dayMonthYear.format(from)} – ${dayMonthYear.format(to)}`;
  if (from.getMonth() !== to.getMonth()) return `${dayMonth.format(from)} – ${dayMonthYear.format(to)}`;
  return `${from.getDate()}–${dayMonthYear.format(to)}`;
}

export function formatHours(hours: number): string {
  return `${hours.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} ч`;
}

/** Site name for a journal entry's project, or "Общее" for site-less work. */
export function projectLabel(siteSlug?: string): string {
  if (!siteSlug) return "Общее";
  return getSite(siteSlug)?.name ?? siteSlug;
}

export function entriesInRange(entries: WorkEntry[], range: DateRange): WorkEntry[] {
  return entries.filter((e) => inRange(e.date, range));
}

export function totalHours(entries: WorkEntry[]): number {
  return entries.reduce((sum, e) => sum + e.hours, 0);
}

export function groupByDay(entries: WorkEntry[], order: "asc" | "desc"): [string, WorkEntry[]][] {
  const map = new Map<string, WorkEntry[]>();
  for (const e of entries) map.set(e.date, [...(map.get(e.date) ?? []), e]);
  const groups = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  return order === "asc" ? groups : groups.reverse();
}

export type Tally = { key: string; hours: number; count: number };

/** Hours and entry counts per key, biggest first. */
export function tallyBy(entries: WorkEntry[], keyOf: (e: WorkEntry) => string): Tally[] {
  const map = new Map<string, Tally>();
  for (const e of entries) {
    const key = keyOf(e);
    const t = map.get(key) ?? { key, hours: 0, count: 0 };
    t.hours += e.hours;
    t.count += 1;
    map.set(key, t);
  }
  return [...map.values()].sort((a, b) => b.hours - a.hours);
}

export function summarize(entries: WorkEntry[]) {
  return {
    hours: totalHours(entries),
    count: entries.length,
    days: new Set(entries.map((e) => e.date)).size,
    projects: new Set(entries.filter((e) => e.siteSlug).map((e) => e.siteSlug)).size,
  };
}

/** Russian plural form: 1 запись, 2 записи, 5 записей. */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
