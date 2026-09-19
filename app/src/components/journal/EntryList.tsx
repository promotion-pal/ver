import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { WorkEntry } from "@/data/journals/types";
import {
  CATEGORY_LABEL,
  formatDate,
  formatHours,
  groupByDay,
  projectLabel,
  totalHours,
} from "@/lib/journal";

/** Work entries grouped by day, newest day first. */
export function EntryList({
  entries,
  renderDayAction,
  emptyText = "За выбранный период записей нет.",
}: {
  entries: WorkEntry[];
  /** Extra control in each day's header, e.g. a per-day report export. */
  renderDayAction?: (date: string, dayEntries: WorkEntry[]) => ReactNode;
  emptyText?: string;
}) {
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;

  return (
    <div className="space-y-6">
      {groupByDay(entries, "desc").map(([date, dayEntries]) => (
        <div key={date} className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-3">
              <h3 className="text-sm font-semibold">{formatDate(date, true)}</h3>
              <span className="font-mono text-xs text-muted-foreground">
                {formatHours(totalHours(dayEntries))}
              </span>
            </div>
            {renderDayAction?.(date, dayEntries)}
          </div>
          <ul className="divide-y rounded-lg border">
            {dayEntries.map((entry, i) => (
              <li key={i} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1.5">
                  <p className="text-sm font-medium">{entry.title}</p>
                  {entry.details ? (
                    <p className="text-sm text-muted-foreground">{entry.details}</p>
                  ) : null}
                  {entry.steps && entry.steps.length > 0 ? (
                    <ul className="space-y-1">
                      {entry.steps.map((step) => (
                        <li key={step} className="flex gap-2 text-sm">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {entry.result ? (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Результат: </span>
                      {entry.result}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {entry.siteSlug ? (
                      <Link to={`/sites/${entry.siteSlug}`}>
                        <Badge variant="secondary" className="font-normal hover:bg-secondary/70">
                          {projectLabel(entry.siteSlug)}
                        </Badge>
                      </Link>
                    ) : (
                      <Badge variant="secondary" className="font-normal">
                        {projectLabel()}
                      </Badge>
                    )}
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                      {CATEGORY_LABEL[entry.category]}
                    </Badge>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-sm tabular-nums">
                  {formatHours(entry.hours)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
