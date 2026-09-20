import {
  BorderStyle,
  HeadingLevel,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { WorkEntry, WorkJournal } from "@/data/journals/types";
import {
  BORDER_COLOR,
  MUTED_COLOR,
  cellBorder,
  downloadDocx,
  heading,
  muted,
  type DocElement,
} from "@/lib/docx-common";
import {
  CATEGORY_LABEL,
  entriesInRange,
  formatDate,
  formatHours,
  formatRange,
  groupByDay,
  plural,
  projectLabel,
  summarize,
  tallyBy,
  totalHours,
  type DateRange,
  type Period,
} from "@/lib/journal";

function cell(children: Paragraph[], widthPercent: number, options: { header?: boolean } = {}) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorder(),
    shading: options.header ? { type: ShadingType.CLEAR, fill: "F2F2F2" } : undefined,
    children,
  });
}

function text(value: string, options: { bold?: boolean; color?: string } = {}) {
  return new Paragraph({ children: [new TextRun({ text: value, ...options })] });
}

function table(widths: number[], header: string[], rows: Paragraph[][][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: header.map((h, i) => cell([text(h, { bold: true })], widths[i], { header: true })),
      }),
      ...rows.map((row) => new TableRow({ children: row.map((c, i) => cell(c, widths[i])) })),
    ],
  });
}

function keyValueTable(pairs: [string, string][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: pairs.map(
      ([key, value]) =>
        new TableRow({
          children: [
            cell([text(key, { color: MUTED_COLOR })], 35),
            cell([text(value, { bold: true })], 65),
          ],
        }),
    ),
  });
}

const spacer = () => muted("", 160);

function projectTotals(entries: WorkEntry[]) {
  return table(
    [60, 20, 20],
    ["Проект", "Часы", "Записей"],
    tallyBy(entries, (e) => projectLabel(e.siteSlug)).map((t) => [
      [text(t.key)],
      [text(formatHours(t.hours))],
      [text(String(t.count))],
    ]),
  );
}

function entryCell(entry: WorkEntry): Paragraph[] {
  const lines = [text(entry.title, { bold: true })];
  if (entry.details) lines.push(text(entry.details, { color: MUTED_COLOR }));
  for (const step of entry.steps ?? []) lines.push(text(`• ${step}`));
  if (entry.result) lines.push(text(`Результат: ${entry.result}`, { color: MUTED_COLOR }));
  return lines;
}

/** A journal's entries over a period: summary, per-project totals, then a table per day. */
export async function exportJournalList(
  journal: WorkJournal,
  allEntries: WorkEntry[],
  range: DateRange,
  period: Period,
): Promise<void> {
  const entries = entriesInRange(allEntries, range);
  const stats = summarize(entries);

  const children: DocElement[] = [
    new Paragraph({ text: "Журнал работы", heading: HeadingLevel.TITLE }),
    muted(`${journal.employee} · ${journal.role}`, 60),
    muted(`Период: ${formatRange(range, period)}`, 240),
    keyValueTable([
      ["Всего часов", formatHours(stats.hours)],
      ["Записей", String(stats.count)],
      ["Рабочих дней", String(stats.days)],
      ["Проектов", String(stats.projects)],
    ]),
    spacer(),
    heading("Итого по проектам", HeadingLevel.HEADING_2),
    projectTotals(entries),
    spacer(),
    heading("Работа по дням", HeadingLevel.HEADING_2),
  ];

  for (const [date, dayEntries] of groupByDay(entries, "asc")) {
    children.push(
      heading(`${formatDate(date, true)} — ${formatHours(totalHours(dayEntries))}`, HeadingLevel.HEADING_3, 200),
      table(
        [20, 15, 55, 10],
        ["Проект", "Вид работ", "Что сделано", "Часы"],
        dayEntries.map((e) => [
          [text(projectLabel(e.siteSlug))],
          [text(CATEGORY_LABEL[e.category])],
          entryCell(e),
          [text(formatHours(e.hours))],
        ]),
      ),
    );
  }

  await downloadDocx(children, `zhurnal-${journal.slug}-${range.from}_${range.to}.docx`);
}

/** A one-day work report for a single employee, ready to send or sign. */
export async function exportJournalDayReport(
  journal: WorkJournal,
  allEntries: WorkEntry[],
  date: string,
): Promise<void> {
  const entries = entriesInRange(allEntries, { from: date, to: date });

  const children: DocElement[] = [
    new Paragraph({ text: "Отчёт о работе за день", heading: HeadingLevel.TITLE }),
    keyValueTable([
      ["Сотрудник", journal.employee],
      ["Должность", journal.role],
      ["Дата", formatDate(date, true)],
      ["Всего часов", formatHours(totalHours(entries))],
    ]),
    spacer(),
    heading("Выполненные работы", HeadingLevel.HEADING_2),
  ];

  entries.forEach((e, i) => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${i + 1}. ${e.title}`, bold: true })],
        spacing: { before: 120, after: 20 },
      }),
      muted(`${projectLabel(e.siteSlug)} · ${CATEGORY_LABEL[e.category]} · ${formatHours(e.hours)}`, 20),
    );
    if (e.details) {
      children.push(
        new Paragraph({ indent: { left: 340 }, children: [new TextRun(e.details)], spacing: { after: 60 } }),
      );
    }
    for (const step of e.steps ?? []) {
      children.push(
        new Paragraph({ indent: { left: 340 }, children: [new TextRun(`• ${step}`)], spacing: { after: 40 } }),
      );
    }
    if (e.result) {
      children.push(
        new Paragraph({
          indent: { left: 340 },
          children: [new TextRun({ text: "Результат: ", bold: true }), new TextRun(e.result)],
          spacing: { before: 40, after: 100 },
        }),
      );
    }
  });

  const projects = tallyBy(entries, (e) => projectLabel(e.siteSlug));
  children.push(
    heading("Итого по проектам", HeadingLevel.HEADING_2),
    new Paragraph({
      children: [
        new TextRun(
          projects
            .map((p) => `${p.key} — ${formatHours(p.hours)} (${p.count} ${plural(p.count, "запись", "записи", "записей")})`)
            .join("; "),
        ),
      ],
      spacing: { after: 360 },
    }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR } },
      children: [new TextRun({ text: `Сотрудник: ${journal.employee}      Подпись: ______________`, color: MUTED_COLOR })],
      spacing: { before: 240 },
    }),
  );

  await downloadDocx(children, `otchet-${journal.slug}-${date}.docx`);
}
