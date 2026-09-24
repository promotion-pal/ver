import type { SiteDoc } from "@/data/types";

/**
 * Copy this file to `<slug>.ts`, fill it in, then add the export to
 * `sites/index.ts`. Every block type below is optional — delete the
 * ones you don't need, reorder the rest, add more of the same type.
 * Every block may carry its own `heading` — that's what separates
 * sections visually, so give each block one.
 *
 * Screenshots go in `public/screenshots/<slug>/*.png` and are
 * referenced as `/screenshots/<slug>/name.png`.
 *
 * VERSIONING: `versions` is a plain array of dated snapshots, oldest
 * first. To record how the site changed, don't edit the last entry —
 * copy it, bump `id`/`date`/`label`, and edit the copy's `blocks`.
 * The site page shows a version switcher automatically once there's
 * more than one.
 */
export const templateSite: SiteDoc = {
  slug: "my-site",
  name: "Название сайта",
  description: "Одна строка: что это и для кого.",
  status: "dev", // "live" | "dev" | "planned" | "archived"
  url: "https://example.com",
  repoPath: "apps/my-site",
  tags: ["Next.js"],
  versions: [
    {
      id: "2026-01-01",
      date: "2026-01-01",
      label: "Запуск сайта",
      blocks: [
        { type: "text", heading: "О сайте", body: "Короткое описание." },
        {
          type: "stats",
          items: [{ label: "Разделов", value: "0" }],
        },
        {
          type: "pages",
          heading: "Разделы и их возможности",
          items: [
            {
              name: "Главная",
              path: "/",
              purpose: "Что решает эта страница для посетителя.",
              actions: ["Конкретное действие, доступное на странице"],
            },
          ],
        },
        {
          type: "gallery",
          heading: "Скриншоты",
          items: [
            {
              src: "/screenshots/my-site/home.png",
              caption: "Главная",
              description: "Что видно на этом экране и зачем.",
            },
          ],
        },
        // Схема draw.io: файл кладём в src/docs/schema/ и импортируем
        // вверху файла — `import myScheme from "@/docs/schema/my-site.drawio?raw";`
        // {
        //   type: "scheme",
        //   heading: "Архитектура",
        //   xml: myScheme,
        //   caption: "Что показывает схема.",
        // },
        {
          type: "checklist",
          heading: "Выполнено",
          items: [{ label: "Что уже сделано", done: true }],
        },
        {
          type: "checklist",
          heading: "Дальше",
          items: [{ label: "Что нужно сделать", done: false }],
        },
        {
          // Вопросы для заказчика — статичный список внизу страницы,
          // без сбора ответов (это отдельная, более поздняя задача).
          type: "questions",
          heading: "Вопросы для заказчика",
          items: [{ question: "Что спросить у заказчика по итогам этой версии сайта?" }],
        },
      ],
    },
  ],
};
