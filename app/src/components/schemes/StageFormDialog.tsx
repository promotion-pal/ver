import { useState, type FormEvent } from "react";
import { FormDialog } from "@/components/common/FormDialog";
import { FormField, fieldClass } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Stage, StageDraft, StageStatus } from "@/data/schemes/types";
import { apiErrorMessage } from "@/lib/journal-api";
import { STAGE_STATUS_LABEL } from "@/lib/scheme-api";

function StageForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Stage;
  onSubmit: (draft: StageDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [status, setStatus] = useState<StageStatus>(initial?.status ?? "planned");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return setError("Опишите, что нужно сделать.");
    if (startDate && dueDate && dueDate < startDate) return setError("Срок не может быть раньше начала.");

    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), details: details.trim(), startDate, dueDate, status });
    } catch (err) {
      setError(apiErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Что нужно сделать">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Одной строкой" required />
      </FormField>
      <FormField label="Подробности" hint="Кто отвечает, что входит в этап, от чего зависит.">
        <textarea className={fieldClass} rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Начало">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormField>
        <FormField label="Срок">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </FormField>
        <FormField label="Статус">
          <select
            className={fieldClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as StageStatus)}
          >
            {Object.entries(STAGE_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

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

/** Add (no `initial`) or edit (`initial`) one stage. The dialog closes itself on success. */
export function StageFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Stage;
  onSubmit: (draft: StageDraft) => Promise<void>;
}) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? "Редактировать этап" : "Новый этап"}
      description="Что сделать по схеме и в какие сроки. Даты можно оставить пустыми."
    >
      <StageForm
        initial={initial}
        onSubmit={async (draft) => {
          await onSubmit(draft);
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </FormDialog>
  );
}
