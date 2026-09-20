import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WorkEntry, WorkJournal } from "@/data/journals/types";
import { formatHours, plural, totalHours } from "@/lib/journal";

export function JournalCard({ journal, weekEntries }: { journal: WorkJournal; weekEntries: WorkEntry[] }) {
  return (
    <Link to={`/journals/${journal.slug}`} className="block">
      <Card className="h-full gap-3 transition-colors hover:border-foreground/20">
        <CardHeader className="space-y-0.5">
          <h3 className="text-base font-semibold tracking-tight">{journal.employee}</h3>
          <p className="text-sm text-muted-foreground">{journal.role}</p>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          На этой неделе: {formatHours(totalHours(weekEntries))} · {weekEntries.length}{" "}
          {plural(weekEntries.length, "запись", "записи", "записей")}
        </CardContent>
      </Card>
    </Link>
  );
}
