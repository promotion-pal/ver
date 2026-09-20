import type { FeedbackAction, FeedbackStatus } from "@/data/feedback/types";

export const ACTION_LABEL: Record<FeedbackAction, string> = {
  fix: "Исправить ошибку",
  add: "Добавить",
  change: "Изменить",
  remove: "Убрать",
  question: "Вопрос / уточнение",
  approve: "Согласовано",
};

export const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "Новое",
  in_progress: "В работе",
  done: "Готово",
};

/** At least a surname and a name; letters, spaces, dots and hyphens only. */
export function nameError(name: string): string | null {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Укажите ФИО.";
  if (!/^[\p{L}][\p{L}.\- ]*$/u.test(trimmed)) return "ФИО: только буквы, пробелы, точки и дефис.";
  if (trimmed.split(" ").length < 2) return "Укажите фамилию и имя.";
  return null;
}
