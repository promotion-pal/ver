import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WorkJournal } from "@/data/journals/types";
import {
  entriesInRange,
  formatHours,
  plural,
  rangeFor,
  todayISO,
  totalHours,
} from "@/lib/journal";

export function JournalCard({ journal }: { journal: WorkJournal }) {
  const week = entriesInRange(journal.entries, rangeFor(todayISO(), "week"));
  const last = journal.entries.reduce<string | undefined>(
    (max, e) => (!max || e.date > max ? e.date : max),
    undefined,
  );

  return (
    <Link to={`/journals/${journal.slug}`} className="block">
      <Card className="h-full gap-3 transition-colors hover:border-foreground/20">
        <CardHeader className="space-y-0.5">
          <h3 className="text-base font-semibold tracking-tight">{journal.employee}</h3>
          <p className="text-sm text-muted-foreground">{journal.role}</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-1 text-xs text-muted-foreground">
          <p>
            На этой неделе: {formatHours(totalHours(week))} · {week.length}{" "}
            {plural(week.length, "запись", "записи", "записей")}
          </p>
          <p className="mt-auto pt-1">
            Всего записей: {journal.entries.length}
            {last ? ` · последняя ${last}` : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
