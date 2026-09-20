import { useState, type FormEvent } from "react";
import { FormDialog } from "@/components/common/FormDialog";
import { FormField, fieldClass } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkCategory, WorkEntry, WorkEntryDraft } from "@/data/journals/types";
import { sites } from "@/data/sites";
import { apiErrorMessage } from "@/lib/journal-api";
import { CATEGORY_LABEL } from "@/lib/journal";

function EntryForm({
  initial,
  defaultDate,
  onSubmit,
  onCancel,
}: {
  initial?: WorkEntry;
  defaultDate: string;
  onSubmit: (draft: WorkEntryDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [siteSlug, setSiteSlug] = useState(initial?.siteSlug ?? "");
  const [category, setCategory] = useState<WorkCategory>(initial?.category ?? "dev");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [steps, setSteps] = useState(initial?.steps.join("\n") ?? "");
  const [result, setResult] = useState(initial?.result ?? "");
  const [hours, setHours] = useState(initial ? String(initial.hours) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedHours = Number(hours.replace(",", "."));
    if (!date) return setError("Укажите дату.");
    if (!title.trim()) return setError("Опишите, что сделано.");
    if (!(parsedHours > 0 && parsedHours <= 24)) return setError("Часы: число от 0 до 24.");

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        date,
        siteSlug,
        category,
        title: title.trim(),
        details: details.trim(),
        steps: steps.split("\n").map((s) => s.trim()).filter(Boolean),
        result: result.trim(),
        hours: parsedHours,
      });
    } catch (err) {
      setError(apiErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Дата">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </FormField>
        <FormField label="Часы" hint="Например, 1,5">
          <Input
            inputMode="decimal"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="2"
            required
          />
        </FormField>
        <FormField label="Проект">
          <select className={fieldClass} value={siteSlug} onChange={(e) => setSiteSlug(e.target.value)}>
            <option value="">Общее (без сайта)</option>
            {sites.map((site) => (
              <option key={site.slug} value={site.slug}>
                {site.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Вид работ">
          <select
            className={fieldClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as WorkCategory)}
          >
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Что сделано">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Одной строкой" required />
      </FormField>
      <FormField label="Подробности">
        <textarea className={fieldClass} rows={2} value={details} onChange={(e) => setDetails(e.target.value)} />
      </FormField>
      <FormField label="Шаги" hint="Каждый шаг — с новой строки.">
        <textarea className={fieldClass} rows={4} value={steps} onChange={(e) => setSteps(e.target.value)} />
      </FormField>
      <FormField label="Результат">
        <Input value={result} onChange={(e) => setResult(e.target.value)} placeholder="Что получилось в итоге" />
      </FormField>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Отмена
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}

/** Add (no `initial`) or edit (`initial`) one work entry. The dialog closes itself on success. */
export function EntryFormDialog({
  open,
  onOpenChange,
  initial,
  defaultDate,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: WorkEntry;
  defaultDate: string;
  onSubmit: (draft: WorkEntryDraft) => Promise<void>;
}) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? "Редактировать запись" : "Новая запись"}
      description="Одна задача за день. В один день можно добавить несколько задач."
    >
      <EntryForm
        initial={initial}
        defaultDate={defaultDate}
        onSubmit={async (draft) => {
          await onSubmit(draft);
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </FormDialog>
  );
}
