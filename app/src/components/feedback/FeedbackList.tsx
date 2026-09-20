import { Badge } from "@/components/ui/badge";
import { fieldClass } from "@/components/common/FormField";
import type { Feedback, FeedbackStatus } from "@/data/feedback/types";
import { ACTION_LABEL, STATUS_LABEL } from "@/lib/feedback";
import { formatStoredPhone } from "@/lib/phone";

const dateTime = new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeStyle: "short" });

/** Customer feedback as a list of blocks, newest first, with a status switch for the team. */
export function FeedbackList({
  feedbacks,
  onStatusChange,
  emptyText = "Обратной связи пока нет.",
}: {
  feedbacks: Feedback[];
  onStatusChange: (feedback: Feedback, status: FeedbackStatus) => void;
  emptyText?: string;
}) {
  if (feedbacks.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;

  return (
    <ul className="space-y-3">
      {feedbacks.map((f) => (
        <li key={f.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{f.authorName}</p>
              <p className="text-xs text-muted-foreground">
                <a href={`tel:${f.phone}`} className="hover:text-foreground hover:underline">
                  {formatStoredPhone(f.phone)}
                </a>{" "}
                · {dateTime.format(f.createdAt)}
              </p>
            </div>
            <select
              className={`${fieldClass} !w-auto !py-1 text-xs`}
              value={f.status}
              aria-label={`Статус обратной связи от ${f.authorName}`}
              onChange={(e) => onStatusChange(f, e.target.value as FeedbackStatus)}
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="font-normal">
              {ACTION_LABEL[f.action]}
            </Badge>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {f.versionLabel || f.versionId}
            </Badge>
          </div>
          <p className="whitespace-pre-wrap text-sm">{f.comment}</p>
        </li>
      ))}
    </ul>
  );
}
