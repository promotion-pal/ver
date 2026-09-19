import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BarList } from "@/components/common/BarList";
import { ExportButton } from "@/components/common/ExportButton";
import { PeriodSwitcher } from "@/components/common/PeriodSwitcher";
import { Section } from "@/components/common/Section";
import { StatTiles } from "@/components/common/StatTiles";
import { EntryList } from "@/components/journal/EntryList";
import { getJournal } from "@/data/journals";
import {
  CATEGORY_LABEL,
  entriesInRange,
  formatHours,
  projectLabel,
  rangeFor,
  summarize,
  tallyBy,
  todayISO,
  type Period,
} from "@/lib/journal";

export function JournalPage() {
  const { slug } = useParams<{ slug: string }>();
  const journal = slug ? getJournal(slug) : undefined;
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState(todayISO);

  if (!journal) return <Navigate to="/" replace />;

  const range = rangeFor(anchor, period);
  const entries = entriesInRange(journal.entries, range);
  const stats = summarize(entries);

  async function exportList() {
    if (!journal) return;
    const { exportJournalList } = await import("@/lib/docx-journal-export");
    await exportJournalList(journal, range, period);
  }

  async function exportDay(date: string) {
    if (!journal) return;
    const { exportJournalDayReport } = await import("@/lib/docx-journal-export");
    await exportJournalDayReport(journal, date);
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
        <ExportButton
          label="Экспорт списка в Word"
          onExport={exportList}
          disabled={entries.length === 0}
        />
      </div>

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
    </div>
  );
}
