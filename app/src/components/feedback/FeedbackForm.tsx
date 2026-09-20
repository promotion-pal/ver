import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { FormField, fieldClass } from "@/components/common/FormField";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FeedbackAction } from "@/data/feedback/types";
import type { SiteDoc, SiteVersion } from "@/data/types";
import { ACTION_LABEL, nameError } from "@/lib/feedback";
import { createFeedback } from "@/lib/feedback-api";
import { apiErrorMessage } from "@/lib/journal-api";
import { isCompletePhone, toStoredPhone } from "@/lib/phone";

const COMMENT_MAX = 2000;

/** Feedback on the open site version; the site and version are filled in automatically. */
export function FeedbackForm({
  site,
  version,
  onCreated,
}: {
  site: SiteDoc;
  version: SiteVersion;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [action, setAction] = useState<FeedbackAction | "">("");
  const [comment, setComment] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const errors = {
    name: nameError(name),
    phone: isCompletePhone(phone) ? null : "Введите номер полностью: +7 (999) 123-45-67.",
    action: action ? null : "Выберите, что требуется.",
    comment: comment.trim() ? null : "Напишите комментарий.",
  };
  const shown = (field: keyof typeof errors) => (touched[field] || submitted ? errors[field] : null);
  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setSent(false);
    if (Object.values(errors).some(Boolean) || !action) return;

    setBusy(true);
    setServerError(null);
    try {
      await createFeedback({
        siteSlug: site.slug,
        siteName: site.name,
        versionId: version.id,
        versionLabel: version.label,
        authorName: name.trim().replace(/\s+/g, " "),
        phone: toStoredPhone(phone),
        action,
        comment: comment.trim(),
      });
      // Name and phone stay filled in: one person often leaves several comments.
      setAction("");
      setComment("");
      setTouched({});
      setSubmitted(false);
      setSent(true);
      onCreated();
    } catch (err) {
      setServerError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <dl className="grid gap-3 rounded-md bg-muted/40 px-3 py-2.5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Сайт</dt>
          <dd className="font-medium">{site.name}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Версия</dt>
          <dd className="font-medium">
            {version.label} <span className="font-mono text-xs text-muted-foreground">{version.date}</span>
          </dd>
        </div>
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="ФИО">
          <Input
            autoComplete="name"
            placeholder="Иванов Иван Иванович"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            aria-invalid={shown("name") ? true : undefined}
          />
          {shown("name") ? <span className="block text-xs text-destructive">{shown("name")}</span> : null}
        </FormField>
        <FormField label="Телефон">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            onBlur={() => touch("phone")}
            invalid={!!shown("phone")}
          />
          {shown("phone") ? <span className="block text-xs text-destructive">{shown("phone")}</span> : null}
        </FormField>
      </div>

      <FormField label="Что требуется">
        <select
          className={fieldClass}
          value={action}
          onChange={(e) => setAction(e.target.value as FeedbackAction | "")}
          onBlur={() => touch("action")}
          aria-invalid={shown("action") ? true : undefined}
        >
          <option value="">Выберите действие…</option>
          {Object.entries(ACTION_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {shown("action") ? <span className="block text-xs text-destructive">{shown("action")}</span> : null}
      </FormField>

      <FormField label="Комментарий">
        <textarea
          className={fieldClass}
          rows={4}
          maxLength={COMMENT_MAX}
          placeholder="Опишите, что именно и где на сайте нужно сделать"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={() => touch("comment")}
          aria-invalid={shown("comment") ? true : undefined}
        />
        <span className="flex justify-between text-xs">
          <span className="text-destructive">{shown("comment")}</span>
          <span className="text-muted-foreground">
            {comment.length}/{COMMENT_MAX}
          </span>
        </span>
      </FormField>

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Отправляем…" : "Отправить"}
        </Button>
        {sent ? (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            Спасибо! Обратная связь отправлена.
          </span>
        ) : null}
      </div>
    </form>
  );
}
