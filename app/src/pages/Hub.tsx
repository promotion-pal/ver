import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { LoadState } from "@/components/common/LoadState";
import { AnalyticsCard } from "@/components/journal/AnalyticsCard";
import { JournalCard } from "@/components/journal/JournalCard";
import { JournalFormDialog } from "@/components/journal/JournalFormDialog";
import { SiteCard } from "@/components/SiteCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sites } from "@/data/sites";
import { createJournal, fetchEntries, listJournals } from "@/lib/journal-api";
import { rangeFor, todayISO } from "@/lib/journal";
import { useAsync } from "@/lib/use-async";

export function Hub() {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const week = rangeFor(todayISO(), "week");
  const journalsState = useAsync(async () => {
    const [journals, weekEntries] = await Promise.all([
      listJournals(),
      fetchEntries({ range: week }),
    ]);
    return { journals, weekEntries };
  }, [week.from, week.to]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((site) =>
      [site.name, site.description, ...site.tags].some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Сайты</h1>
        <p className="text-sm text-muted-foreground">
          {sites.length} {sites.length === 1 ? "сайт" : "сайта"} на сопровождении.
        </p>
      </div>

      <Input
        placeholder="Поиск по названию или тегу…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ничего не нашлось.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Журналы работы</h2>
            <p className="text-sm text-muted-foreground">
              Что выполнено за день, неделю и месяц — по сотрудникам, с экспортом в Word.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus />
            Новый журнал
          </Button>
        </div>
        <LoadState
          loading={journalsState.loading && !journalsState.data}
          error={journalsState.error}
          onRetry={journalsState.reload}
        />
        {journalsState.data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {journalsState.data.journals.map((journal) => (
              <JournalCard
                key={journal.id}
                journal={journal}
                weekEntries={journalsState.data!.weekEntries.filter((e) => e.journalId === journal.id)}
              />
            ))}
            <AnalyticsCard />
          </div>
        ) : null}
        <JournalFormDialog
          open={creating}
          onOpenChange={setCreating}
          onSubmit={async (input) => {
            await createJournal(input);
            journalsState.reload();
          }}
        />
      </section>
    </div>
  );
}
