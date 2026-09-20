import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ActivityChart } from "@/components/common/ActivityChart";
import { BarList } from "@/components/common/BarList";
import { LoadState } from "@/components/common/LoadState";
import { PeriodSwitcher } from "@/components/common/PeriodSwitcher";
import { Section } from "@/components/common/Section";
import { StatTiles } from "@/components/common/StatTiles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchEntries, listJournals } from "@/lib/journal-api";
import {
  CATEGORY_LABEL,
  eachDay,
  formatDate,
  formatHours,
  formatRange,
  fromISO,
  plural,
  projectLabel,
  rangeFor,
  summarize,
  tallyBy,
  todayISO,
  totalHours,
  type Period,
} from "@/lib/journal";
import { useAsync } from "@/lib/use-async";

export function Analytics() {
  const [period, setPeriod] = useState<Period>("month");
  const [anchor, setAnchor] = useState(todayISO);

  const range = rangeFor(anchor, period);
  const state = useAsync(
    async () => {
      const [journals, entries] = await Promise.all([listJournals(), fetchEntries({ range })]);
      return { journals, entries };
    },
    [range.from, range.to],
  );
  const journals = state.data?.journals ?? [];
  const all = state.data?.entries ?? [];
  const perJournal = journals.map((journal) => ({
    journal,
    entries: all.filter((e) => e.journalId === journal.id),
  }));
  const stats = summarize(all);

  const journalBars = perJournal
    .map(({ journal, entries }) => ({ label: journal.employee, value: totalHours(entries) }))
    .sort((a, b) => b.value - a.value);

  const projectRows = tallyBy(all, (e) => e.siteSlug ?? "").map((t) => ({
    ...t,
    employees: perJournal
      .filter((p) => p.entries.some((e) => (e.siteSlug ?? "") === t.key))
      .map((p) => p.journal.employee),
  }));

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        На главную
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Аналитика работы</h1>
        <p className="text-sm text-muted-foreground">
          По журналам сотрудников и по сайтам · {formatRange(range, period)}
        </p>
      </div>

      <PeriodSwitcher
        period={period}
        onPeriodChange={setPeriod}
        anchor={anchor}
        onAnchorChange={setAnchor}
      />

      <LoadState loading={state.loading && !state.data} error={state.error} onRetry={state.reload} />

      {state.data ? (
        <>
      <Section title="Общие показатели">
        <StatTiles
          items={[
            { label: "Часов", value: formatHours(stats.hours) },
            { label: "Записей", value: String(stats.count) },
            { label: "Рабочих дней", value: String(stats.days) },
            { label: "Проектов", value: String(stats.projects) },
          ]}
        />
      </Section>

      <Section
        title="По журналам"
        description="Сколько часов и какие проекты у каждого сотрудника."
      >
        <BarList items={journalBars} format={formatHours} />
        <div className="grid gap-4 md:grid-cols-2">
          {perJournal.map(({ journal, entries }) => (
            <div key={journal.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/journals/${journal.slug}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {journal.employee}
                  </Link>
                  <p className="text-xs text-muted-foreground">{journal.role}</p>
                </div>
                <p className="text-right font-mono text-xs text-muted-foreground">
                  {formatHours(totalHours(entries))}
                  <br />
                  {entries.length} {plural(entries.length, "запись", "записи", "записей")}
                </p>
              </div>
              <BarList
                items={tallyBy(entries, (e) => projectLabel(e.siteSlug)).map((t) => ({
                  label: t.key,
                  value: t.hours,
                }))}
                format={formatHours}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="По проектам" description="Сколько времени ушло на каждый сайт и кто над ним работал.">
        <BarList
          items={projectRows.map((r) => ({ label: projectLabel(r.key || undefined), value: r.hours }))}
          format={formatHours}
        />
        {projectRows.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Проект</TableHead>
                  <TableHead>Часов</TableHead>
                  <TableHead>Записей</TableHead>
                  <TableHead>Сотрудники</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectRows.map((r) => (
                  <TableRow key={r.key}>
                    <TableCell className="font-medium">
                      {r.key ? (
                        <Link to={`/sites/${r.key}`} className="hover:underline">
                          {projectLabel(r.key)}
                        </Link>
                      ) : (
                        projectLabel()
                      )}
                    </TableCell>
                    <TableCell className="font-mono">{formatHours(r.hours)}</TableCell>
                    <TableCell className="font-mono">{r.count}</TableCell>
                    <TableCell className="text-muted-foreground">{r.employees.join(", ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </Section>

      <div className="grid gap-8 md:grid-cols-2">
        <Section title="Виды работ">
          <BarList
            items={tallyBy(all, (e) => CATEGORY_LABEL[e.category]).map((t) => ({
              label: t.key,
              value: t.hours,
            }))}
            format={formatHours}
          />
        </Section>
        <Section title="Динамика по дням" description="Часов в день, все журналы вместе.">
          <ActivityChart
            points={eachDay(range).map((day) => {
              const hours = totalHours(all.filter((e) => e.date === day));
              return {
                label: String(fromISO(day).getDate()),
                value: hours,
                title: `${formatDate(day)} — ${formatHours(hours)}`,
              };
            })}
          />
        </Section>
      </div>
        </>
      ) : null}
    </div>
  );
}
