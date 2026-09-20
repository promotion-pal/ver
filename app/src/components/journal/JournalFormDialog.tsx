import { useState, type FormEvent } from "react";
import { FormDialog } from "@/components/common/FormDialog";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/journal-api";
import { slugify } from "@/lib/slug";

function JournalForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: { slug: string; employee: string; role: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [employee, setEmployee] = useState("");
  const [role, setRole] = useState("Разработчик");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!employee.trim()) return setError("Укажите имя сотрудника.");
    if (!slug) return setError("Укажите адрес журнала (латиница, цифры, дефис).");

    setSaving(true);
    setError(null);
    try {
      await onSubmit({ slug, employee: employee.trim(), role: role.trim() });
    } catch (err) {
      setError(apiErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Сотрудник">
        <Input
          value={employee}
          onChange={(e) => {
            setEmployee(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Имя Фамилия"
          required
        />
      </FormField>
      <FormField label="Должность">
        <Input value={role} onChange={(e) => setRole(e.target.value)} />
      </FormField>
      <FormField label="Адрес журнала" hint={`/journals/${slug || "…"}`}>
        <Input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          required
        />
      </FormField>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Отмена
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Создаём…" : "Создать журнал"}
        </Button>
      </div>
    </form>
  );
}

export function JournalFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { slug: string; employee: string; role: string }) => Promise<void>;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Новый журнал" description="Журнал работы одного сотрудника.">
      <JournalForm
        onSubmit={async (input) => {
          await onSubmit(input);
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </FormDialog>
  );
}
