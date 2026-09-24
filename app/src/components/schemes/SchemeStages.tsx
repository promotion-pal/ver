import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { fieldClass } from "@/components/common/FormField";
import { LoadState } from "@/components/common/LoadState";
import { StageFormDialog } from "@/components/schemes/StageFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Stage, StageDraft, StageStatus } from "@/data/schemes/types";
import { todayISO } from "@/lib/journal";
import { apiErrorMessage } from "@/lib/journal-api";
import {
  STAGE_STATUS_LABEL,
  createStage,
  deleteStage,
  fetchStages,
  formatStageDates,
  isOverdue,
  updateStage,
} from "@/lib/scheme-api";
import { useAsync } from "@/lib/use-async";

/** The work plan kept next to a scheme: stages, deadlines and where each one is. */
export function SchemeStages({ siteSlug, schemeId }: { siteSlug: string; schemeId: string }) {
  const state = useAsync(() => fetchStages(siteSlug, schemeId), [siteSlug, schemeId]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Stage | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  const stages = state.data ?? [];
  const today = todayISO();
  const done = stages.filter((s) => s.status === "done").length;
  const overdue = stages.filter((s) => isOverdue(s, today)).length;

  function openForm(stage?: Stage) {
    setEditing(stage);
    setFormOpen(true);
  }

  async function run(action: () => Promise<void>) {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(apiErrorMessage(error));
    }
    state.reload();
  }

  function remove(stage: Stage) {
    if (!window.confirm(`Удалить этап «${stage.title}»?`)) return;
    return run(() => deleteStage(stage.id));
  }

  function changeStatus(stage: Stage, status: StageStatus) {
    return run(() => updateStage(stage.id, { ...stage, status }));
  }

  async function save(draft: StageDraft) {
    if (editing) await updateStage(editing.id, draft);
    else await createStage(siteSlug, schemeId, draft);
    state.reload();
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold">План работ</h3>
          <p className="text-xs text-muted-foreground">
            {stages.length === 0
              ? "Что нужно сделать по схеме и в какие сроки."
              : `Готово ${done} из ${stages.length}${overdue ? ` · просрочено ${overdue}` : ""}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => openForm()}>
          <Plus />
          Добавить этап
        </Button>
      </div>

      <LoadState loading={state.loading && !state.data} error={state.error} onRetry={state.reload} />
      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      {state.data && stages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Этапов пока нет.</p>
      ) : null}

      {stages.length > 0 ? (
        <ol className="divide-y">
          {stages.map((stage, i) => {
            const late = isOverdue(stage, today);
            return (
              <li key={stage.id} className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-5 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className={`text-sm font-medium ${stage.status === "done" ? "text-muted-foreground line-through" : ""}`}
                  >
                    {stage.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={late ? "text-destructive" : undefined}>{formatStageDates(stage)}</span>
                    {late ? (
                      <Badge variant="destructive" className="font-normal">
                        Просрочен
                      </Badge>
                    ) : null}
                  </div>
                  {stage.details ? (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{stage.details}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <select
                    className={`${fieldClass} !w-auto !py-1 text-xs`}
                    value={stage.status}
                    aria-label={`Статус этапа «${stage.title}»`}
                    onChange={(e) => changeStatus(stage, e.target.value as StageStatus)}
                  >
                    {Object.entries(STAGE_STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Редактировать «${stage.title}»`}
                    onClick={() => openForm(stage)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Удалить «${stage.title}»`}
                    onClick={() => remove(stage)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      <StageFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSubmit={save} />
    </div>
  );
}
