import type { WorkJournal } from "@/data/journals/types";

/**
 * Copy this file to `<slug>.ts`, fill it in, then add the export to
 * `journals/index.ts`. One journal per employee.
 *
 * Each entry is one piece of work: the day, an optional site (its
 * `slug` from `data/sites`), a category, what was done and how long it
 * took; `steps` and `result` make it a full task report. Several entries
 * with the same date are several tasks of that day. Day / week / month views, analytics and Word export are built
 * from these lines automatically — just append new entries.
 */
export const templateJournal: WorkJournal = {
  slug: "my-journal",
  employee: "Имя Фамилия",
  role: "Разработчик",
  entries: [
    {
      date: "2026-01-01",
      siteSlug: "my-site", // optional
      category: "dev", // "dev" | "docs" | "testing" | "deploy" | "meeting" | "other"
      title: "Что сделано — одной строкой",
      details: "Подробности, если нужны.", // optional
      steps: ["Шаг 1", "Шаг 2"], // optional — что именно сделано, списком
      result: "Что получилось в итоге.", // optional
      hours: 2,
    },
  ],
};
