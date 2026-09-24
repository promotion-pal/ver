import type { SiteDoc } from "@/data/types";
import authScheme from "@/docs/schema/auth.drawio?raw";

export const auth: SiteDoc = {
  slug: "auth",
  name: "Единая авторизация",
  description: "Вход сотрудников через AD, синхронизация учётных записей с MDM и хранение данных пользователей.",
  status: "dev",
  tags: ["AD", "MDM", "авторизация"],
  versions: [
    {
      id: "2026-09-24",
      date: "2026-09-24",
      label: "Первая схема",
      blocks: [
        {
          type: "scheme",
          id: "auth",
          heading: "Схема авторизации",
          xml: authScheme,
          caption: "AuthService, синхронизация AD ↔ MDM, хранение данных пользователей.",
        },
      ],
    },
  ],
};
