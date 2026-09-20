import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BarList } from "@/components/common/BarList";
import { ExportButton } from "@/components/common/ExportButton";
import { LoadState } from "@/components/common/LoadState";
import { PeriodSwitcher } from "@/components/common/PeriodSwitcher";
import { Section } from "@/components/common/Section";
import { StatTiles } from "@/components/common/StatTiles";
import { EntryFormDialog } from "@/components/journal/EntryFormDialog";
import { EntryList } from "@/components/journal/EntryList";
import { Button } from "@/components/ui/button";
import type { WorkEntry } from "@/data/journals/types";
import {
  apiErrorMessage,
  createEntry,
  deleteEntry,
  fetchEntries,
  getJournal,
  updateEntry,
} from "@/lib/journal-api";
import {
  CATEGORY_LABEL,
  formatHours,
  inRange,
  projectLabel,
  rangeFor,
  summarize,
  tallyBy,
  todayISO,
  type Period,
} from "@/lib/journal";
import { useAsync } from "@/lib/use-async";

export function JournalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState(todayISO);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkEntry | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  const range = rangeFor(anchor, period);

  const journalState = useAsync(() => getJournal(slug ?? ""), [slug]);
  const journal = journalState.data;
  const entriesState = useAsync(
    async () => (journal ? fetchEntries({ journalId: journal.id, range }) : []),
    [journal?.id, range.from, range.to],
  );

  if (journal === null) return <Navigate to="/" replace />;

  const entries = entriesState.data ?? [];
  const stats = summarize(entries);
  const defaultDate = inRange(todayISO(), range) ? todayISO() : range.from;

  function openForm(entry?: WorkEntry) {
    setEditing(entry);
    setFormOpen(true);
  }

  async function remove(entry: WorkEntry) {
    if (!window.confirm(`Удалить запись «${entry.title}»?`)) return;
    setActionError(null);
    try {
      await deleteEntry(entry.id);
      entriesState.reload();
    } catch (error) {
      setActionError(apiErrorMessage(error));
    }
  }

  async function exportList() {
    if (!journal) return;
    const { exportJournalList } = await import("@/lib/docx-journal-export");
    await exportJournalList(journal, entries, range, period);
  }

  async function exportDay(date: string) {
    if (!journal) return;
    const { exportJournalDayReport } = await import("@/lib/docx-journal-export");
    await exportJournalDayReport(journal, entries, date);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          На главную
        </Link>
        <div className="flex flex-wrap items-start gap-2">
          <Button size="sm" onClick={() => openForm()} disabled={!journal}>
            <Plus />
            Добавить запись
          </Button>
          <ExportButton
            label="Экспорт списка в Word"
            onExport={exportList}
            disabled={entries.length === 0}
          />
        </div>
      </div>

      <LoadState
        loading={journalState.loading && !journal}
        error={journalState.error}
        onRetry={journalState.reload}
      />

      {journal ? (
        <>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{journal.employee}</h1>
            <p className="text-sm text-muted-foreground">Журнал работы · {journal.role}</p>
          </div>

          <PeriodSwitcher
            period={period}
            onPeriodChange={setPeriod}
            anchor={anchor}
            onAnchorChange={setAnchor}
          />

          <LoadState
            loading={entriesState.loading && !entriesState.data}
            error={entriesState.error}
            onRetry={entriesState.reload}
          />
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

          <StatTiles
            items={[
              { label: "Часов", value: formatHours(stats.hours) },
              { label: "Записей", value: String(stats.count) },
              { label: "Рабочих дней", value: String(stats.days) },
              { label: "Проектов", value: String(stats.projects) },
            ]}
          />

          <Section title="Записи" description="Что сделано, по дням. Отчёт за день можно скачать в Word.">
            <EntryList
              entries={entries}
              renderDayAction={(date) => (
                <ExportButton
                  label="Отчёт за день"
                  variant="ghost"
                  size="xs"
                  onExport={() => exportDay(date)}
                />
              )}
              renderEntryAction={(entry) => (
                <>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Редактировать «${entry.title}»`}
                    onClick={() => openForm(entry)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Удалить «${entry.title}»`}
                    onClick={() => remove(entry)}
                  >
                    <Trash2 />
                  </Button>
                </>
              )}
            />
          </Section>

          <div className="grid gap-8 md:grid-cols-2">
            <Section title="По проектам">
              <BarList
                items={tallyBy(entries, (e) => projectLabel(e.siteSlug)).map((t) => ({
                  label: t.key,
                  value: t.hours,
                }))}
                format={formatHours}
              />
            </Section>
            <Section title="По видам работ">
              <BarList
                items={tallyBy(entries, (e) => CATEGORY_LABEL[e.category]).map((t) => ({
                  label: t.key,
                  value: t.hours,
                }))}
                format={formatHours}
              />
            </Section>
          </div>

          <EntryFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            initial={editing}
            defaultDate={defaultDate}
            onSubmit={async (draft) => {
              if (editing) await updateEntry(editing.id, draft);
              else await createEntry(journal.id, draft);
              entriesState.reload();
            }}
          />
        </>
      ) : null}
    </div>
  );
}
